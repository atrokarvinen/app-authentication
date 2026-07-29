export class AuthServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly logEvent: string,
    public readonly logMeta?: Record<string, unknown>
  ) {
    super(message)
  }
}