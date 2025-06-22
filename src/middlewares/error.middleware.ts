import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError.js";

export function errorMiddleware(err: any, req: Request, res: Response, _next: NextFunction) {
  return ApiError(err, res, "Unexpected internal error", {
    path: req.originalUrl,
    method: req.method,
    query: req.query,
    body: req.body
  });
}
