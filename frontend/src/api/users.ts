import request from './request'
import type { User } from '../types/user'

export interface UserListResponse {
  users: User[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export function getUsers(params?: { search?: string; page?: number; pageSize?: number }) {
  return request.get<UserListResponse>('/users', { params })
}

export function createUser(data: { name: string; email: string }) {
  return request.post<User>('/users', data)
}

export function updateUser(id: number, data: { name: string; email: string }) {
  return request.put<User>('/users/' + id, data)
}

export function deleteUser(id: number) {
  return request.delete('/users/' + id)
}
