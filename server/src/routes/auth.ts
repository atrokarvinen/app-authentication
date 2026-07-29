import { AuthProvider, UserStatus } from '@prisma/client'
import { Router } from 'express'
import {
  createSessionToken,
  hashPassword,
  hashSessionToken,
  verifyPassword,
} from '../lib/auth'
import { prisma } from '../lib/prisma'

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

const authRouter = Router()

type PublicUser = {
  id: string
  displayName: string
  email: string
  authProvider: 'Credentials' | 'Google' | 'Facebook' | 'Microsoft'
  role: string
  status: string
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase()
}

function providerToClient(provider: AuthProvider): PublicUser['authProvider'] {
  switch (provider) {
    case AuthProvider.CREDENTIALS:
      return 'Credentials'
    case AuthProvider.GOOGLE:
      return 'Google'
    case AuthProvider.FACEBOOK:
      return 'Facebook'
    case AuthProvider.MICROSOFT:
      return 'Microsoft'
    default:
      return 'Credentials'
  }
}

function statusToClient(status: UserStatus): string {
  switch (status) {
    case UserStatus.ACTIVE:
      return 'Active'
    case UserStatus.PENDING:
      return 'Pending'
    case UserStatus.SUSPENDED:
      return 'Suspended'
    default:
      return 'Pending'
  }
}

function getSessionTokenFromRequest(request: {
  get: (name: string) => string | undefined
  body?: { sessionToken?: unknown }
}): string | null {
  const authHeader = request.get('authorization')

  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length).trim()
  }

  if (typeof request.body?.sessionToken === 'string') {
    return request.body.sessionToken
  }

  return null
}

function toPublicUser(params: {
  user: {
    id: string
    displayName: string
    status: UserStatus
    emails: Array<{ email: string; isPrimary: boolean; createdAt: Date }>
    roles: Array<{ role: { name: string } }>
  }
  provider: AuthProvider
}): PublicUser {
  const primaryEmail =
    params.user.emails.find((entry) => entry.isPrimary)?.email ||
    params.user.emails[0]?.email ||
    ''

  return {
    id: params.user.id,
    displayName: params.user.displayName,
    email: primaryEmail,
    authProvider: providerToClient(params.provider),
    role: params.user.roles[0]?.role.name || 'member',
    status: statusToClient(params.user.status),
  }
}

authRouter.post('/register', async (request, response) => {
  const body = request.body as {
    displayName?: unknown
    email?: unknown
    password?: unknown
  }

  const displayName =
    typeof body.displayName === 'string' ? body.displayName.trim() : ''
  const email = typeof body.email === 'string' ? normalizeEmail(body.email) : ''
  const password = typeof body.password === 'string' ? body.password : ''

  if (!displayName || !email || !password) {
    response
      .status(400)
      .json({ error: 'Display name, email, and password are required.' })
    return
  }

  if (password.length < 8) {
    response
      .status(400)
      .json({ error: 'Password must be at least 8 characters long.' })
    return
  }

  const existingEmail = await prisma.userEmail.findUnique({
    where: { email },
    select: { id: true },
  })

  if (existingEmail) {
    response.status(409).json({ error: 'Email is already registered.' })
    return
  }

  const passwordHash = await hashPassword(password)
  const sessionToken = createSessionToken()
  const sessionTokenHash = hashSessionToken(sessionToken)
  const expiresAt = new Date(Date.now() + THIRTY_DAYS_MS)

  const created = await prisma.$transaction(async (tx) => {
    const role = await tx.role.upsert({
      where: { name: 'member' },
      update: {},
      create: {
        name: 'member',
        description: 'Default application member role.',
      },
    })

    const user = await tx.user.create({
      data: {
        status: UserStatus.ACTIVE,
        displayName,
        lastLoginAt: new Date(),
        emails: {
          create: {
            email,
            isPrimary: true,
            isVerified: true,
            verificationSource: 'LOCAL',
            verifiedAt: new Date(),
          },
        },
        identities: {
          create: {
            provider: AuthProvider.CREDENTIALS,
            providerUserId: email,
            usernameOrLogin: email,
            passwordHash,
            passwordAlgo: 'scrypt',
            passwordUpdatedAt: new Date(),
          },
        },
      },
      include: {
        emails: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    })

    await tx.userRole.create({
      data: {
        userId: user.id,
        roleId: role.id,
      },
    })

    await tx.session.create({
      data: {
        userId: user.id,
        refreshTokenHash: sessionTokenHash,
        expiresAt,
        ipAddress: request.ip || null,
        userAgent: request.get('user-agent') || null,
      },
    })

    const userWithRole = await tx.user.findUniqueOrThrow({
      where: { id: user.id },
      include: {
        emails: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    })

    return userWithRole
  })

  response.status(201).json({
    user: toPublicUser({ user: created, provider: AuthProvider.CREDENTIALS }),
    sessionToken,
  })
})

authRouter.post('/login', async (request, response) => {
  const body = request.body as { email?: unknown; password?: unknown }
  const email = typeof body.email === 'string' ? normalizeEmail(body.email) : ''
  const password = typeof body.password === 'string' ? body.password : ''

  if (!email || !password) {
    response.status(400).json({ error: 'Email and password are required.' })
    return
  }

  const emailRecord = await prisma.userEmail.findUnique({
    where: { email },
    include: {
      user: {
        include: {
          identities: {
            where: { provider: AuthProvider.CREDENTIALS },
          },
          emails: true,
          roles: {
            include: {
              role: true,
            },
          },
        },
      },
    },
  })

  const identity = emailRecord?.user.identities[0]

  if (!emailRecord || !identity?.passwordHash) {
    response.status(401).json({ error: 'Invalid email or password.' })
    return
  }

  if (emailRecord.user.status === UserStatus.SUSPENDED) {
    response.status(403).json({ error: 'This account has been suspended.' })
    return
  }

  const passwordMatches = await verifyPassword(password, identity.passwordHash)

  if (!passwordMatches) {
    response.status(401).json({ error: 'Invalid email or password.' })
    return
  }

  const sessionToken = createSessionToken()
  const sessionTokenHash = hashSessionToken(sessionToken)
  const expiresAt = new Date(Date.now() + THIRTY_DAYS_MS)

  await prisma.$transaction([
    prisma.user.update({
      where: { id: emailRecord.user.id },
      data: { lastLoginAt: new Date() },
    }),
    prisma.session.create({
      data: {
        userId: emailRecord.user.id,
        refreshTokenHash: sessionTokenHash,
        expiresAt,
        ipAddress: request.ip || null,
        userAgent: request.get('user-agent') || null,
      },
    }),
  ])

  response.json({
    user: toPublicUser({
      user: emailRecord.user,
      provider: identity.provider,
    }),
    sessionToken,
  })
})

authRouter.post('/logout', async (request, response) => {
  const sessionToken = getSessionTokenFromRequest(request)

  if (!sessionToken) {
    response.status(400).json({ error: 'Session token is required.' })
    return
  }

  await prisma.session.updateMany({
    where: {
      refreshTokenHash: hashSessionToken(sessionToken),
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  })

  response.json({ success: true })
})

authRouter.get('/me', async (request, response) => {
  const sessionToken = getSessionTokenFromRequest(request)

  if (!sessionToken) {
    response.status(401).json({ error: 'Not authenticated.' })
    return
  }

  const session = await prisma.session.findFirst({
    where: {
      refreshTokenHash: hashSessionToken(sessionToken),
      revokedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      user: {
        include: {
          emails: true,
          identities: {
            where: { provider: AuthProvider.CREDENTIALS },
          },
          roles: {
            include: {
              role: true,
            },
          },
        },
      },
    },
  })

  if (!session) {
    response.status(401).json({ error: 'Session is invalid or expired.' })
    return
  }

  const provider =
    session.user.identities[0]?.provider || AuthProvider.CREDENTIALS

  response.json({
    user: toPublicUser({
      user: session.user,
      provider,
    }),
  })
})

export { authRouter }
