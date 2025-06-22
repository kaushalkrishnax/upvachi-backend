import ms, { StringValue } from "ms";
import { Request, Response } from "express";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { query } from "../config/db.config.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import {
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
  generateAccessToken,
  generateRefreshToken
} from "../utils/tokenHandler.js";

dotenv.config();

const ACCESS_TOKEN_MAX_AGE = ms(ACCESS_TOKEN_EXPIRY as StringValue);
const REFRESH_TOKEN_MAX_AGE = ms(REFRESH_TOKEN_EXPIRY as StringValue);

export const signupUser = async (req: Request, res: Response) => {
  try {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
      return ApiResponse(res, 400, "Missing required fields.");
    }

    const existingUser = await query("SELECT 1 FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return ApiResponse(res, 400, "User already exists.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verifyToken = uuidv4();

    const result = await query(
      `INSERT INTO users (full_name, email, password, plan, is_verified, verify_token)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, full_name, email, plan, is_verified, avatar_url, created_at, updated_at`,
      [full_name, email, hashedPassword, "free", false, verifyToken]
    );

    const user = result.rows[0];
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken();

    const now = new Date();
    const expiresAt = new Date(now.getTime() + REFRESH_TOKEN_MAX_AGE);

    await query(
      `INSERT INTO refresh_tokens (user_id, token, user_agent, ip_address, expires_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, refreshToken, req.headers["user-agent"] || null, req.ip, expiresAt]
    );

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: ACCESS_TOKEN_MAX_AGE
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: REFRESH_TOKEN_MAX_AGE
    });

    return ApiResponse(res, 201, "User signed up successfully.", {
      user
    });
  } catch (error) {
    return ApiError(error, res, "Failed to sign up user.", { function: "signupUser" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return ApiResponse(res, 400, "Missing email or password.");
    }

    const result = await query(
      "SELECT id, full_name, email, password, plan, is_verified, avatar_url, created_at, updated_at FROM users WHERE email = $1",
      [email]
    );
    const user = result.rows[0];

    if (!user) {
      return ApiResponse(res, 401, "Invalid credentials.");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return ApiResponse(res, 401, "Invalid credentials.");
    }

    delete user.password;

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken();

    const now = new Date();
    const expiresAt = new Date(now.getTime() + REFRESH_TOKEN_MAX_AGE);

    await query(
      `INSERT INTO refresh_tokens (user_id, token, user_agent, ip_address, expires_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, refreshToken, req.headers["user-agent"] || null, req.ip, expiresAt]
    );

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: ACCESS_TOKEN_MAX_AGE
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: REFRESH_TOKEN_MAX_AGE,
      path: "/"
    });

    return ApiResponse(res, 200, "User logged in successfully.", {
      user
    });
  } catch (error) {
    return ApiError(error, res, "Failed to log in.", { function: "loginUser" });
  }
};

export const logoutUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;

    await query("DELETE FROM refresh_tokens WHERE user_id = $1", [userId]);

    res.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/"
    });
    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/"
    });

    return ApiResponse(res, 200, "User logged out successfully.");
  } catch (error) {
    return ApiError(error, res, "Failed to log out.", { function: "logoutUser" });
  }
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      return ApiResponse(res, 404, "Refresh token not found.");
    }

    const result = await query("SELECT user_id, expires_at FROM refresh_tokens WHERE token = $1", [refreshToken]);
    const token = result.rows[0];

    if (!token) {
      return ApiResponse(res, 401, "Invalid refresh token.");
    }

    const now = new Date();
    if (token.expires_at < now) {
      return ApiResponse(res, 401, "Refresh token has expired.");
    }

    const userId = token.user_id;
    const accessToken = generateAccessToken(userId);

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: ACCESS_TOKEN_MAX_AGE
    });

    return ApiResponse(res, 200, "Access token refreshed successfully.");
  } catch (error) {
    return ApiError(error, res, "Failed to refresh access token.", {
      function: "refreshAccessToken"
    });
  }
};
