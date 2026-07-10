import request from './request'
export function getProducts(params?: any) { return request.get('/products', { params }) }
export function createProduct(data: any) { return request.post('/products', data) }
export function updateProduct(id: number, data: any) { return request.put('/products/' + id, data) }
export function deleteProduct(id: number) { return request.delete('/products/' + id) }
