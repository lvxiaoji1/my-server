import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AppError } from './error'

// 扩展 Request 类型，加上当前用户信息
export interface AuthRequest extends Request {
  user?: { id: number; email: string }
}

/**
 * 验证 JWT 的中间件
 * - 从 Authorization: Bearer xxx 取 token
 * - 验证签名和过期时间
 * - 验证通过后把用户信息挂在 req.user 上
 */
export function authenticate(
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('未提供认证令牌', 401))
  }

  const token = header.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: number
      email: string
    }
    req.user = decoded
    next()
  } catch {
    return next(new AppError('令牌无效或已过期', 401))
  }
}
