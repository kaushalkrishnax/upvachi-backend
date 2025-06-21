// src/routes/user.routes.ts
import { Router, Request, Response } from 'express';
import { getUsers } from '../controllers/user.controller.js';

const router = Router();

router.get('/', getUsers);
router.get('/test', (req: Request, res: Response) => {
  res.send('User router test successful!');
});

export default router;
