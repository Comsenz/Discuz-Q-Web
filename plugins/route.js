// route在server render也会跑
// client执行顺序 => beforeEach - middleware - afterEach
// server执行顺序 => beforeEach - afterEach - middleware
import cookie from '../utils/parserCookie'
import env from '../utils/env.js'
import mobileRouter from '../utils/mobileRouter.js'
const freePath = ['/user/login', '/user/register', '/site/info', '/user/warning', '/user/agreement', '/site/partner-invite']
export default ({ app }) => {
  const { store, router } = app
  router.beforeEach(async(to, from, next) => {
    // 根据ua跳转到移动端
    if (env.isMobile && !env.isTablet) {
      let path = '/'
      const _map = mobileRouter.map
      if (to.matched && to.matched.length > 0) {
        const _path = to.matched[to.matched.length - 1 ].path
        switch (_path) {
          case '/topic/:id?':
            path = _map[_path] + to.params.id
            break
          case '/profile':
            path = _map[_path] + to.query.userId
            break
          case '/topic/post/:type?':
            path = _map[_path] + to.params.type
            break
          case '/topic/comment':
            path = _map[_path] + `?threadId=${to.query.threadId}&commentId=${to.query.commentId}`
            break
          case '/search/user':
            path = _map[_path] + to.query.q
            break
          case '/location':
            path = _map[_path] + `?longitude=${to.query.longitude}&latitude=${to.query.latitude}`
            break
          case '/site/partner-invite':
            path = _map[_path] + to.query.code
            break
          default:
            path = _map[_path] || '/'
        }
      }
      window.location.href = process.env.mobileDomain + path
    }
    if (process.client) {
      // 登录页不判断站点关闭
      if (from.path === '/site/close' && to.path === '/user/login') return next()
      // 获取站点信息
      if (!store.state.site.info.id) {
        try {
          await store.dispatch('site/getSiteInfo')
        } catch (e) {
          const { response: { data: { errors }}} = e
          // 站点关闭跳转
          if (errors[0].code === 'site_closed') {
            console.log(errors[0].code)
            await store
              .dispatch('forum/setError', { code: errors[0].code, detail: errors[0].detail[0] })
            if (to.path === '/site/close') return next()
            next({ path: '/site/close' })
            return
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
          console.log(error)
        }
      }

      // 暂时先在这里种一下cookie, 带给ssr服务，避免ssr渲染无状态
      const token = localStorage.getItem('access_token')
      token && cookie.set('token', token)
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
    console.log('afterEach')
  })
}
