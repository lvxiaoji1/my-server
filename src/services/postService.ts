import pool from '../database'

export interface Post {
  id: number
  title: string
  content: string
  user_id: number
  created_at: string
  updated_at: string
}

export async function getAllPosts(page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize
  const countResult = await pool.query('SELECT COUNT(*) FROM posts')
  const total = parseInt(countResult.rows[0].count, 10)
  const dataResult = await pool.query(
    'SELECT p.*, u.name AS author_name FROM posts p LEFT JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC LIMIT $1 OFFSET $2',
    [pageSize, offset],
  )
  return { posts: dataResult.rows, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}

export async function getPostById(id: number) {
  const result = await pool.query(
    'SELECT p.*, u.name AS author_name FROM posts p LEFT JOIN users u ON p.user_id = u.id WHERE p.id = $1',
    [id],
  )
  return result.rows[0] || null
}

export async function createPost(userId: number, title: string, content: string) {
  const result = await pool.query(
    'INSERT INTO posts (title, content, user_id) VALUES ($1, $2, $3) RETURNING *',
    [title, content, userId],
  )
  return result.rows[0]
}

export async function updatePost(id: number, title: string, content: string) {
  const result = await pool.query(
    "UPDATE posts SET title = $1, content = $2, updated_at = NOW() WHERE id = $3 RETURNING *",
    [title, content, id],
  )
  return result.rows[0] || null
}

export async function deletePost(id: number) {
  const result = await pool.query('DELETE FROM posts WHERE id = $1 RETURNING id', [id])
  return result.rows[0] || null
}