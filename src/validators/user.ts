import { z } from 'zod'

// ========================================
// 创建用户时的校验规则
// - name: 必传，至少 1 个字符
// - email: 必传，必须是合法邮箱格式
// - phone: 可选（选传参数示例）
// ========================================
export const createUserSchema = z.object({
  name: z.string().min(1, '姓名不能为空'),
  email: z.string().email('邮箱格式不正确'),
  phone: z.string().optional(),
})

// ========================================
// 更新用户时的校验规则
// - 和创建一样，但 phone 也是可选的
// ========================================
export const updateUserSchema = z.object({
  name: z.string().min(1, '姓名不能为空'),
  email: z.string().email('邮箱格式不正确'),
  phone: z.string().optional(),
})

// 从 schema 推导出 TypeScript 类型
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
