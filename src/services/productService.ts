import pool from "../database"

export async function getAllProducts(search?: string, page = 1, pageSize = 50) {
  const offset = (page - 1) * pageSize
  if (search) {
    const like = `%${search}%`
    const count = await pool.query("SELECT COUNT(*) FROM products WHERE name ILIKE $1", [like])
    const total = parseInt(count.rows[0].count, 10)
    const data = await pool.query("SELECT * FROM products WHERE name ILIKE $1 ORDER BY id LIMIT $2 OFFSET $3", [like, pageSize, offset])
    return { products: data.rows, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
  }
  const count = await pool.query("SELECT COUNT(*) FROM products")
  const total = parseInt(count.rows[0].count, 10)
  const data = await pool.query("SELECT * FROM products ORDER BY id LIMIT $1 OFFSET $2", [pageSize, offset])
  return { products: data.rows, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}

export async function createProduct(data: { name: string; price: number; stock: number; description?: string }) {
  const r = await pool.query("INSERT INTO products (name, price, stock, description) VALUES ($1, $2, $3, $4) RETURNING *", [data.name, data.price, data.stock, data.description || null])
  return r.rows[0]
}

export async function updateProduct(id: number, data: { name: string; price: number; stock: number; description?: string }) {
  const r = await pool.query("UPDATE products SET name=$1, price=$2, stock=$3, description=$4, updated_at=NOW() WHERE id=$5 RETURNING *", [data.name, data.price, data.stock, data.description || null, id])
  return r.rows[0] || null
}

export async function deleteProduct(id: number) {
  const r = await pool.query("DELETE FROM products WHERE id=$1 RETURNING id", [id])
  return r.rows[0] || null
}
