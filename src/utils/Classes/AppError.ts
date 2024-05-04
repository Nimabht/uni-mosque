class AppError extends Error {
  constructor(
    public message: string,
    public status: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string) {
    return new AppError(message, "fail", 400);
  }

  static notFound(message: string) {
    return new AppError(message, "fail", 404);
  }

  static unAuthorized(message: string) {
    return new AppError(message, "fail", 401);
  }

  static Forbidden(message: string) {
    return new AppError(message, "fail", 403);
  }

  static internal(message: string) {
    return new AppError(message, "error", 500);
  }
}

export default AppError;
