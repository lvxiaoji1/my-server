import request from './request'
export function getOrders(params?: any) { return request.get('/orders', { params }) }
export function getOrderById(id: number) { return request.get('/orders/' + id) }
export function createOrder(data: any) { return request.post('/orders', data) }
export function updateOrderStatus(id: number, status: string) { return request.put('/orders/' + id + '/status', { status }) }
