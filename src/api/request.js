import axios from 'axios'
import Qs from 'qs'
// import store from '@/store'
// import { Message } from 'element-ui'
// 创建 Axios 实例

// const isDev = process.env.NODE_ENV === 'development'
const service = axios.create({
  // baseURL: "http://203.195.197.176/live",
  baseURL: process.env.VUE_APP_BASE_API,
  // timeout: 60000,  // 请求超时时间；Respone 拦截器要做好提示处理
  paramsSerializer: params =>
    Qs.stringify(params, {
      arrayFormat: 'repeat'
    })
})

// Request 拦截器
service.interceptors.request.use(
  oConfig => {
    return oConfig
  },
  oError => {
    return Promise.reject(oError)
  }
)

// Respone 拦截器
service.interceptors.response.use(
  oRes => {
    return oRes
  },
  oError => {
    return Promise.reject(oError)
  }
)

export default service
