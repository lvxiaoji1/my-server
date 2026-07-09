import { Router } from 'express'
import { Request, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth'
import { asyncHandler } from '../middleware/error'
import { validate } from '../middleware/validate'
import { createUserSchema, updateUserSchema } from '../validators/user'
import * as userService from '../services/userService'

const router = Router()

router.get('/', authenticate, asyncHandler(async (req: Request, res: Response) => {
  const search = req.query.search as string | undefined
  const page = parseInt(req.query.page as string, 10) || 1
  const pageSize = parseInt(req.query.pageSize as string, 10) || 10
  const result = await userService.getAllUsers(search, page, pageSize)
  res.json(result)
}))

router.get('/:id', authenticate, asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string, 10)
  const user = await userService.getUserById(id)
  if (!user) { res.status(404).json({ error: '用户未找到' }); return }
  res.json(user)
}))

router.post('/', authenticate, validate(createUserSchema), asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.createUser(req.body)
  res.status(201).json(user)
}))

router.put('/:id', authenticate, validate(updateUserSchema), asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string, 10)
  const user = await userService.updateUser(id, req.body)
  if (!user) { res.status(404).json({ error: '用户未找到' }); return }
  res.json(user)
}))

router.delete('/:id', authenticate, asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string, 10)
  const deleted = await userService.deleteUser(id)
  if (!deleted) { res.status(404).json({ error: '用户未找到' }); return }
  res.json({ message: '删除成功', user: deleted })
}))

export default router