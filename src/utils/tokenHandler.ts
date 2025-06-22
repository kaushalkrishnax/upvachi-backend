import { StringValue } from "ms";
import dotenv from "dotenv";
import jwt, { SignOptions } from "jsonwebtoken";
import crypto from "crypto";
dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
export const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY!;
export const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY!;

export const generateAccessToken = (userId: string): string => {
  const payload = { userId };
  const options: SignOptions = { expiresIn: ACCESS_TOKEN_EXPIRY as StringValue };
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, options);
};

export const generateRefreshToken = (): string => {
  return crypto.randomBytes(64).toString("hex");
};
