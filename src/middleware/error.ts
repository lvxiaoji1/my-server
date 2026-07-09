import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'


// ========================================
// 1. 自定义错误类 —— 带 HTTP 状态码
// ========================================
export class AppError extends Error {
  statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
  }
}

// ========================================
// 2. 异步路由包装器 —— 自动捕获 async 错误
// ========================================
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// ========================================
// 3. 全局错误处理中间件（4 个参数！）
// ========================================
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
    // Zod 校验错误 —— 返回具体的字段错误信息
  if (err instanceof ZodError) {
    const fields = err.issues.map((e: any) => ({
      field: e.path.join('.'),
      message: e.message,
    }))
    console.error(`[400] 参数校验失败:`, fields)
    res.status(400).json({ error: '参数校验失败', fields })
    return
  }

  const statusCode = err instanceof AppError ? err.statusCode : 500
  const message = err.message || '服务器内部错误'

  // 开发环境打印完整错误栈
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[${statusCode}] ${message}`)
    if (statusCode === 500) console.error(err.stack)
  }

  res.status(statusCode).json({ error: message })
}
