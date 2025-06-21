import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

export function errorMiddleware(err: any, req: Request, res: Response, _next: NextFunction) {
  return ApiError({
    error: err,
    res,
    message: 'Unexpected internal error',
    meta: {
      path: req.originalUrl,
      method: req.method,
    },
  });
}
