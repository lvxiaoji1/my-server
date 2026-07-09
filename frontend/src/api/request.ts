import axios from "axios"

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  timeout: 10000,
})

// 请求拦截器：自动从 localStorage 取 token 带上
request.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

request.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401：token 失效，清除登录状态
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
    }
    const msg = error.response
      ? `请求失败: ${error.response.status}`
      : "无法连接到服务器"
    console.error(msg)
    return Promise.reject(error)
  },
)

export default request
