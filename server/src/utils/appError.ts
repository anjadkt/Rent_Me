class AppError extends Error {
  public readonly statusCode: number;
  public readonly status: string;

  constructor(statusCode: number, message: string) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
  }
}

export default AppError;