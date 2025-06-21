import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

import pool from './config/db.config.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import userRoutes from './routes/user.routes.js'
import { ApiResponse } from './utils/ApiResponse.js';

dotenv.config();

process.on('unhandledRejection', err => {
  console.error('UNHANDLED REJECTION:', err);
});
process.on('uncaughtException', err => {
  console.error('UNCAUGHT EXCEPTION:', err);
});

export function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const accessLogStream = fs.createWriteStream(path.join(path.resolve(), 'logs/access.log'), { flags: 'a' });

  // Middlewares
  app.use(cors());
  app.use(helmet());
  app.use(express.json());

  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
  } else {
    app.use(morgan('combined', { stream: accessLogStream }))
  }

  // Routes
  app.get('/', (_req, res) => {
    return ApiResponse(res, 200, 'OK');
  });

  app.use('/api/users', userRoutes);

  // Error middleware
  app.use(errorMiddleware);

  // Connect to PostgreSQL
  pool.connect()
    .then(async client => {
      await client.query("SELECT NOW()")
        .then(result => {
          console.log("Connected to PostgreSQL at:", result.rows[0].now);
          client.release();
        })
        .catch(err => {
          client.release();
          throw err;
        });
    })
    .then(() => {
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`🌐 Server running on port ${PORT}`);
      });
    })
    .catch(err => {
      console.error("Error connecting to PostgreSQL:", err.stack || err);
      process.exit(1);
    });
}

startServer();
