import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  errors?: any[];
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.statusCode ? err.message : 'Internal Server Error';

  // Always log errors server-side for debugging
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    statusCode,
    url: req.url,
    method: req.method
  });

  // NEVER send stack traces or detailed errors to clients in production
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(err.errors && { details: err.errors })
  });
};
