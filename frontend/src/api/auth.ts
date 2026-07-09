import request from './request'

export function register(data: {
  name: string
  email: string
  password: string
}) {
  return request.post('/auth/register', data)
}

export function login(data: { email: string; password: string }) {
  return request.post('/auth/login', data)
}
