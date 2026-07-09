import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../database'
import { asyncHandler } from '../middleware/error'
import { validate } from '../middleware/validate'
import { registerSchema, loginSchema } from '../validators/auth'

const router = Router()

// POST /auth/register
router.post(
  '/register',
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body

    // 检查邮箱是否已被注册
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email])
    if (existing.rows.length > 0) {
      res.status(409).json({ error: '该邮箱已被注册' })
      return
    }

    // 密码用 bcrypt 哈希（加盐 10 轮）
    const passwordHash = await bcrypt.hash(password, 10)

    // 存到数据库
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, passwordHash],
    )
    const user = result.rows[0]

    // 签发 JWT（7 天过期）
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' },
    )

    res.status(201).json({ user, token })
  }),
)

// POST /auth/login
router.post(
  '/login',
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body

    // 查用户（包含密码哈希）
    const result = await pool.query(
      'SELECT id, name, email, password_hash FROM users WHERE email = $1',
      [email],
    )
    if (result.rows.length === 0) {
      res.status(401).json({ error: '邮箱或密码错误' })
      return
    }

    const user = result.rows[0]

    // 比对密码
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      res.status(401).json({ error: '邮箱或密码错误' })
      return
    }

    // 签发 JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' },
    )

    res.json({ user: { id: user.id, name: user.name, email: user.email }, token })
  }),
)

export default router
