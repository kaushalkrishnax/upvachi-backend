import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import ApiResponse from "../utils/ApiResponse.js";

dotenv.config();

/**
 * Extended request with authenticated user ID
 */
export interface AuthenticatedRequest extends Request {
  userId?: string;
}

/**
 * JWT authentication middleware.
 * Attaches `userId` to `req` if valid token is present.
 */
export const authMiddleware: RequestHandler = (req: Request, res: Response, next: NextFunction): any => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return ApiResponse(res, 401, "Authentication token required.");
  }

  const token = authHeader.split(" ")[1];

  if (!process.env.ACCESS_TOKEN_SECRET) {
    console.error("ACCESS_TOKEN_SECRET is not defined in environment variables.");
    return ApiResponse(res, 500, "Server configuration error.");
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) as { userId: string };

    (req as AuthenticatedRequest).userId = decoded.userId;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return ApiResponse(res, 401, "Authentication token expired.");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return ApiResponse(res, 401, "Invalid authentication token.");
    }

    console.error("Authentication error:", error);
    return ApiResponse(res, 500, "Failed to authenticate token.");
  }
};
