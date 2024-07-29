import { NextFunction, Request, Response } from "express";

class AppError extends Error {
  statusCode: number;
  statusType: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.statusType = `${statusCode}`.startsWith("4") ? `fail` : `error`; // 4xx:fail and 5xx:error
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }

}

// Central error handling middleware
const globalErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.statusType = err.statusType || "error";

  if (err.isOperational) {
    res.status(err.statusCode).json({
      statustype: err.statusType,
      message: err.message,
      code: err.statusCode,
    });
  } else {
    console.error("Error", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
      code: 500,
    });
  }
};
export { AppError, globalErrorHandler };
