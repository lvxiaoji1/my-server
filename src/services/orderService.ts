import pool from "../database"

export async function getAllOrders(status?: string, page = 1, pageSize = 20) {
  const offset = (page - 1) * pageSize
  let where = ""
  const params: any[] = []
  if (status) { where = "WHERE o.status = $1"; params.push(status) }
  const count = await pool.query(`SELECT COUNT(*) FROM orders o ${where}`, params)
  const total = parseInt(count.rows[0].count, 10)
  const data = await pool.query(`SELECT o.*, u.name AS user_name FROM orders o LEFT JOIN users u ON o.user_id = u.id ${where} ORDER BY o.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, pageSize, offset])
  return { orders: data.rows, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}

export async function getOrderById(id: number) {
  const order = await pool.query("SELECT o.*, u.name AS user_name FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE o.id = $1", [id])
  if (!order.rows[0]) return null
  const items = await pool.query("SELECT * FROM order_items WHERE order_id = $1 ORDER BY id", [id])
  return { ...order.rows[0], items: items.rows }
}

export async function createOrder(userId: number, items: { product_id: number; quantity: number }[]) {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")
    let total = 0
    for (const item of items) {
      const prod = await client.query("SELECT id, name, price, stock FROM products WHERE id = $1 FOR UPDATE", [item.product_id])
      if (!prod.rows[0]) throw new Error(`Product ${item.product_id} not found`)
      if (prod.rows[0].stock < item.quantity) throw new Error(`${prod.rows[0].name} 库存不足`)
      total += parseFloat(prod.rows[0].price) * item.quantity
      await client.query("UPDATE products SET stock = stock - $1 WHERE id = $2", [item.quantity, item.product_id])
      await client.query("INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES ($1, $2, $3, $4, $5)", [0, item.product_id, prod.rows[0].name, item.quantity, prod.rows[0].price])
    }
    const ord = await client.query("INSERT INTO orders (user_id, total) VALUES ($1, $2) RETURNING *", [userId, total])
    const orderId = ord.rows[0].id
    await client.query("UPDATE order_items SET order_id = $1 WHERE order_id = 0", [orderId])
    await client.query("COMMIT")
    return ord.rows[0]
  } catch (e) { await client.query("ROLLBACK"); throw e }
  finally { client.release() }
}

export async function updateOrderStatus(id: number, status: string) {
  const r = await pool.query("UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *", [status, id])
  return r.rows[0] || null
}
