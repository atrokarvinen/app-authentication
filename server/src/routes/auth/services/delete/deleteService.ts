import { DeleteRepository, type IDeleteRepository } from './deleteRepository'

type DeleteUserArgs = {
  email: string
}

type DeleteUserResult = {
  deleted: boolean
  logMeta: Record<string, unknown>
}

class DeleteService {
  constructor(private readonly repository: IDeleteRepository) {}

  async deleteUser(params: DeleteUserArgs): Promise<DeleteUserResult> {
    const deleted = await this.repository.deleteUserByEmail(params.email)

    if (!deleted) {
      return { deleted: false, logMeta: { email: params.email } }
    }

    return { deleted: true, logMeta: { email: params.email } }
  }
}

const deleteService = new DeleteService(new DeleteRepository())

export function deleteUser(params: DeleteUserArgs): Promise<DeleteUserResult> {
  return deleteService.deleteUser(params)
}
