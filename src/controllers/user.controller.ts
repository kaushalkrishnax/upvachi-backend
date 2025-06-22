import { Request, Response } from "express";
import ApiResponse from "../utils/ApiResponse.js";
import { query } from "../config/db.config.js";

export const getUsers = async (req: Request, res: Response) => {
  const result = await query("SELECT * FROM users");
  const users = result.rows;

  return ApiResponse(res, 200, "Users fetched successfully", users);
};
