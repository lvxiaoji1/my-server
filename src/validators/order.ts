import { z } from "zod"
export const createOrderSchema = z.object({ items: z.array(z.object({ product_id: z.number(), quantity: z.number().int().min(1) })).min(1, "至少选择一个商品") })
