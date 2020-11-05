// route在server render也会跑
// client执行顺序 => beforeEach - middleware - afterEach
// server执行顺序 => beforeEach - afterEach - middleware
import cookie from '../utils/parserCookie'
const freePath = ['/user/login-bind-phone', '/user/login-bind', '/user/phone-login-register', '/user/phone-login', '/user/register-bind-phone', '/user/register-bind', '/user/wechat', '/user/login', '/user/register', '/site/info', '/user/warning', '/user/agreement', '/user/agreement', '/modify/findpwd', '/site/partner-invite']
export default ({ app }) => {
  const { store, router } = app
  router.beforeEach(async(to, from, next) => {
    if (process.client) {
      // 登录页不判断站点关闭
      if (from.path === '/site/close' && to.path === '/user/login') return next()
      // 获取站点信息
      if (!store.state.site.info.id) {
        try {
          await store.dispatch('site/getSiteInfo')
        } catch (e) {
          if (e && e.response && e.response.data && e.response.data.errors) {
            const { response: { data: { errors }}} = e
            // 站点关闭跳转
            if (errors[0].code === 'site_closed') {
              await store
                .dispatch('forum/setError', { code: errors[0].code, detail: errors[0].detail[0] })
              if (to.path === '/site/close') return next()
              next({ path: '/site/close' })
              return
            }
          }
        }
      }
      // 获取用户信息
      const userId = localStorage.getItem('user_id') || ''
      if (!store.state.user.info.id && userId) {
        try {
          await store.dispatch('user/getUserInfo', userId)
          store.commit('session/SET_USER_ID', userId)
        } catch (error) {
          // 清除用户信息
          store.commit('user/SET_USER_INFO', {})
        }
      }

      // 暂时先在这里种一下cookie, 带给ssr服务，避免ssr渲染无状态
      // const token = localStorage.getItem('access_token')
      // token && cookie.set('token', token)

      cookie.set('token', '')
      // 网站付费拦截
      if (freePath.includes(to.path)) return next()
      if (Object.keys(store.state.site.info).length === 0) return next()
      const { attributes: { set_site: site_info }} = store.state.site.info
      const { attributes: user_info } = store.state.user.info
      if (site_info.site_mode && site_info.site_mode === 'pay') {
        if (!userId || (user_info && !user_info.paid)) return next({ path: '/site/info' })
      }
      return next()
    }
    next()
  })
  router.afterEach((to, from) => {
  })
}
