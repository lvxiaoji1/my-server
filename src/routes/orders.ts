import { Router, Request, Response } from "express"
import { authenticate, AuthRequest } from "../middleware/auth"
import { asyncHandler } from "../middleware/error"
import { validate } from "../middleware/validate"
import { createOrderSchema } from "../validators/order"
import * as svc from "../services/orderService"

const router = Router()
router.get("/", asyncHandler(async (req: Request, res: Response) => {
  const r = await svc.getAllOrders(req.query.status as string, parseInt(req.query.page as string) || 1, parseInt(req.query.pageSize as string) || 20)
  res.json(r)
}))
router.get("/:id", asyncHandler(async (req: Request, res: Response) => {
  const o = await svc.getOrderById(parseInt(req.params.id as string))
  if (!o) { res.status(404).json({ error: "订单未找到" }); return }
  res.json(o)
}))
router.post("/", authenticate, validate(createOrderSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  try { const o = await svc.createOrder(req.user!.id, req.body.items); res.status(201).json(o) }
  catch (e: any) { res.status(400).json({ error: e.message }) }
}))
router.put("/:id/status", authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const o = await svc.updateOrderStatus(parseInt(req.params.id as string), req.body.status)
  if (!o) { res.status(404).json({ error: "订单未找到" }); return }
  res.json(o)
}))
export default router
