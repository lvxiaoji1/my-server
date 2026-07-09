import express, { Request, Response } from 'express';
import pool from './database';
import path from 'path';
import dotenv from 'dotenv';
import { AppError, asyncHandler, errorHandler } from './middleware/error';
import authRoutes from './routes/auth';
import usersRouter from './routes/users';



dotenv.config();

const app = express();
app.use(express.json())

// CORS：允许前端跨域请求
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});


// 托管前端静态文件（和 API 同源，不需要 CORS）


const PORT = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
  const frontendDir = process.env.NODE_ENV === 'production' ? 'frontend/dist' : 'frontend';
  res.sendFile(path.join(__dirname, '..', frontendDir, 'index.html'));
});

app.get('/env', (req: Request, res: Response) => {
  res.json({
    nodeEnv: process.env.NODE_ENV,
    message: '环境变量读取成功',
  });
});

app.use('/users', usersRouter);


app.listen(PORT, () => {
  console.log(`?? 服务器运行在 http://localhost:${PORT}`);
});




