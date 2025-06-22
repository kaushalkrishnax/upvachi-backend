import { Response } from "express";

/**
 * Unified ApiResponse — sends both success and error responses.
 * Returns true if a response was sent.
 *
 * @param res - Express response object
 * @param code - HTTP status code (default: 200)
 * @param message - Message to be sent in the response
 * @param data - Optional payload (default: null)
 * @returns true when response sent
 */
export function ApiResponse<T = any>(
  res: Response,
  code: number = 200,
  message: string = "OK",
  data: T | null = null
): any {
  res.status(code).json({
    success: code < 400,
    code,
    message,
    data
  });
  return true;
}

export default ApiResponse;
