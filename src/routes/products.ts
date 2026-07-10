import { Router, Request, Response } from "express"
import { authenticate, AuthRequest } from "../middleware/auth"
import { asyncHandler } from "../middleware/error"
import { validate } from "../middleware/validate"
import { createProductSchema, updateProductSchema } from "../validators/product"
import * as svc from "../services/productService"

const router = Router()
router.get("/", asyncHandler(async (req: Request, res: Response) => {
  const r = await svc.getAllProducts(req.query.search as string, parseInt(req.query.page as string) || 1, parseInt(req.query.pageSize as string) || 50)
  res.json(r)
}))
router.post("/", authenticate, validate(createProductSchema), asyncHandler(async (req: AuthRequest, res: Response) => { res.status(201).json(await svc.createProduct(req.body)) }))
router.put("/:id", authenticate, validate(updateProductSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const p = await svc.updateProduct(parseInt(req.params.id as string), req.body)
  if (!p) { res.status(404).json({ error: "产品未找到" }); return }
  res.json(p)
}))
router.delete("/:id", authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const d = await svc.deleteProduct(parseInt(req.params.id as string))
  if (!d) { res.status(404).json({ error: "产品未找到" }); return }
  res.json({ message: "删除成功" })
}))
export default router
