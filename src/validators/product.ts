import { z } from "zod"
export const createProductSchema = z.object({ name: z.string().min(1), price: z.number().positive(), stock: z.number().int().min(0), description: z.string().optional() })
export const updateProductSchema = z.object({ name: z.string().min(1), price: z.number().positive(), stock: z.number().int().min(0), description: z.string().optional() })
