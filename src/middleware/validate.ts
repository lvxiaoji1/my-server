import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'

// ========================================
// 通用的校验中间件
// 接收一个 zod schema，返回 Express 中间件
// - 数据合法：自动把解析后的数据赋给 req.body
// - 数据不合法：把错误传给 errorHandler
// ========================================
export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)

    if (result.success) {
      // 校验通过，用解析后的干净数据替换 req.body
      req.body = result.data
      next()
    } else {
      // 校验失败，把 zod 的错误传给全局错误处理器
      next(result.error)
    }
  }
}
