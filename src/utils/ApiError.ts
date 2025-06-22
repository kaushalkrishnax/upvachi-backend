import { Response } from "express";

interface ApiErrorOptions {
  error: unknown;
  res: Response;
  message?: string;
  meta?: Record<string, any>;
}

/**
 * ApiError — handles all internal server errors (500)
 * and returns a consistent error response.
 */
function ApiError(error: unknown, res: Response, message = "Internal Server Error", meta = {}): void {
  const debugPayload = {
    message,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    meta
  };

  console.error("[ApiError]", debugPayload);

  res.status(500).json({
    success: false,
    code: 500,
    error: message,
    debug: {
      error: debugPayload.error,
      stack: debugPayload.stack,
      meta: debugPayload.meta
    }
  });
}

export default ApiError;
