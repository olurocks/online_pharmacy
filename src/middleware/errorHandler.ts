import { Request, Response, NextFunction } from "express";
import { ValidationError } from "sequelize";

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const createError = (message: string, statusCode: number = 500) => {
  return new AppError(message, statusCode);
};

export const errorHandler = (
  error: Error | AppError | ValidationError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = "Internal Server Error";
  let details: any = null;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof ValidationError) {
    statusCode = 400;
    message = "Validation Error";
    details = error.errors.map((err) => ({
      field: err.path,
      message: err.message,
      value: err.value,
    }));
  } else if (error.name === "SequelizeUniqueConstraintError") {
    statusCode = 409;
    message = "Resource already exists";
    details = { field: (error as any).errors[0]?.path };
  } else if (error.name === "SequelizeForeignKeyConstraintError") {
    statusCode = 400;
    message = "Invalid reference - related resource not found";
  } else if (error.name === "SequelizeDatabaseError") {
    statusCode = 400;
    message = "Database operation failed";
  } else if (error.name === "ValidationError" && (error as any).details) {
    statusCode = 400;
    message = "Validation Error";
    details = (error as any).details.map((detail: any) => ({
      field: detail.path.join("."),
      message: detail.message,
      value: detail.context?.value,
    }));
  } else if (error.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  } else if (error.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  } else {
    console.error("Unhandled Error:", error);
    if (process.env.NODE_ENV === "development") {
      message = error.message;
    }
  }

  const response: any = {
    success: false,
    message,
    statusCode,
  };

  if (details) {
    response.details = details;
  }

  if (process.env.NODE_ENV === "development" && error.stack) {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    statusCode: 404,
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};