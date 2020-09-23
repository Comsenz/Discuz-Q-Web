import axios from 'axios'
import Qs from 'qs'
import env from '@/utils/env.js'

// 创建 Axios 实例
const service = axios.create({
  baseURL: '/api',
  // timeout: 60000,  // 请求超时时间，Respone 拦截器要做好提示处理
  paramsSerializer: params =>
    Qs.stringify(params, {
      arrayFormat: 'repeat'
    })
})

// Request 拦截器
service.interceptors.request.use(
  (oConfig) => {
    // SSR 服务端 baseURL 修正处理
    if (process.server) {
      oConfig.baseURL = `${process.env.NODE_ENV === 'production' ? 'https:' : 'http:'}//${env.host}${oConfig.baseURL}`
    }

    oConfig.headers['Accept'] = 'application/vnd.api+json'

    if (process.client && localStorage.getItem('access_token')) {
      oConfig.headers['authorization'] = `Bearer ${localStorage.getItem('access_token')}`
    }

    // TODO: 由于腾讯的网络环境不能发PATCH请求，所有的PATCH请求要改一下，改成用POST，然后在header里加 x-http-method-override: patch
    if (oConfig.method === 'patch') {
      oConfig.method = 'post'
      oConfig.headers['x-http-method-override'] = 'patch'
    }

    return oConfig
  },
  oError => {
    console.log('Request Error => ', oError)

    return Promise.reject(oError)
  }
)
// Respone 拦截器
service.interceptors.response.use(
  oRes => {
    // console.log('Response => ', oRes)

    return oRes
  },
  oError => {
    console.log('Response Error => ', oError)

    if (oError.response && oError.response.data && oError.response.data.errors) {
      oError.response.data.errors.forEach(error => {
        switch (error.code) {
          case 'access_denied':
            console.log('token 无效 重新请求')
            // token 无效 重新请求
            if (process.client) {
              localStorage.removeItem('access_token')
            }
            // delete response.config.header.Authorization;
            break
          case 'model_not_found':
            console.log('模型未找到')
            // app.$store.dispatch('forum/setError', {
            //   code: 'type_404',
            //   status: 500,
            // });
            break
          case 'permission_denied':
            console.log('没有查看权限')
            // app.$store.dispatch('forum/setError', {
            //   code: 'type_401',
            //   status: 500,
            // });
            break
          case 'site_closed':
            console.log('site_closed')
            // uni.showToast({
            //   icon: 'none',
            //   title: i18n.t(`core.${error.code}`),
            // });
            break
          case 'not_install':
          case 'ban_user':
            break
          default:
            // if (response.config.custom.showTost) {
            //   clearTimeout(tostTimeout);
            //   tostTimeout = setTimeout(() => {
            //     // eslint-disable-next-line no-nested-ternary
            //     const title = error.detail
            //       ? Array.isArray(error.detail)
            //         ? error.detail[0]
            //         : error.detail
            //       : i18n.t(`core.${error.code}`);
            //     uni.showToast({
            //       icon: 'none',
            //       title,
            //     });
            //   });
            // }
        }
      })
    }
    return Promise.reject(oError)
  }
)

export default service
