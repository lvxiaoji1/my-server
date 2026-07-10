import { Router } from 'express'
import { Request, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth'
import { asyncHandler } from '../middleware/error'
import { validate } from '../middleware/validate'
import { createPostSchema, updatePostSchema } from '../validators/post'
import * as postService from '../services/postService'

const router = Router()

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string, 10) || 1
  const pageSize = parseInt(req.query.pageSize as string, 10) || 10
  const result = await postService.getAllPosts(page, pageSize)
  res.json(result)
}))

router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string, 10)
  const post = await postService.getPostById(id)
  if (!post) { res.status(404).json({ error: '文章未找到' }); return }
  res.json(post)
}))

router.post('/', authenticate, validate(createPostSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const post = await postService.createPost(req.user!.id, req.body.title, req.body.content)
  res.status(201).json(post)
}))

router.put('/:id', authenticate, validate(updatePostSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id as string, 10)
  const post = await postService.updatePost(id, req.body.title, req.body.content)
  if (!post) { res.status(404).json({ error: '文章未找到' }); return }
  res.json(post)
}))

router.delete('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id as string, 10)
  const deleted = await postService.deletePost(id)
  if (!deleted) { res.status(404).json({ error: '文章未找到' }); return }
  res.json({ message: '删除成功' })
}))

export default router