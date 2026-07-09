import pool from '../database'

export async function getAllUsers(search?: string, page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize
  let total: number

  if (search) {
    const like = `%${search}%`
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM users WHERE name ILIKE $1 OR email ILIKE $1',
      [like],
    )
    total = parseInt(countResult.rows[0].count, 10)
    const dataResult = await pool.query(
      'SELECT id, name, email FROM users WHERE name ILIKE $1 OR email ILIKE $1 ORDER BY id LIMIT $2 OFFSET $3',
      [like, pageSize, offset],
    )
    return { users: dataResult.rows, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
  }

  const countResult = await pool.query('SELECT COUNT(*) FROM users')
  total = parseInt(countResult.rows[0].count, 10)
  const dataResult = await pool.query(
    'SELECT id, name, email FROM users ORDER BY id LIMIT $1 OFFSET $2',
    [pageSize, offset],
  )
  return { users: dataResult.rows, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}

export async function getUserById(id: number) {
  const result = await pool.query(
    'SELECT id, name, email FROM users WHERE id = $1',
    [id],
  )
  return result.rows[0] || null
}

export async function createUser(data: { name: string; email: string }) {
  const result = await pool.query(
    'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email',
    [data.name, data.email],
  )
  return result.rows[0]
}

export async function updateUser(id: number, data: { name: string; email: string }) {
  const result = await pool.query(
    'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email',
    [data.name, data.email, id],
  )
  return result.rows[0] || null
}

export async function deleteUser(id: number) {
  const result = await pool.query(
    'DELETE FROM users WHERE id = $1 RETURNING id, name, email',
    [id],
  )
  return result.rows[0] || null
}