// src/controllers/user.controller.ts
import { Request, Response } from 'express';
import ApiResponse from '../utils/ApiResponse.js';
import { query } from '../config/db.config.js';

export async function getUsers(req: Request, res: Response) {
  const result = await query('SELECT * FROM users');
  const users = result.rows;

  return ApiResponse(res, 200, 'Users fetched', users);
}
