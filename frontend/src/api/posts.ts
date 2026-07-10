import request from './request'

export function getPosts(params?: { page?: number; pageSize?: number }) {
  return request.get('/posts', { params })
}

export function getPostById(id: number) {
  return request.get('/posts/' + id)
}

export function createPost(data: { title: string; content: string }) {
  return request.post('/posts', data)
}

export function updatePost(id: number, data: { title: string; content: string }) {
  return request.put('/posts/' + id, data)
}

export function deletePost(id: number) {
  return request.delete('/posts/' + id)
}
