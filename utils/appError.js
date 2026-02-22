class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // we cover operational errors, errors we can predict, instead of programming errors meaning bugs we introduce

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
