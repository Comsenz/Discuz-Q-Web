// route在server render也会跑
// client执行顺序 => beforeEach - middleware - afterEach
// server执行顺序 => beforeEach - afterEach - middleware
export default ({ app }) => {
  const { store, router } = app
  router.beforeEach(async(to, from, next) => {
    if (process.client) {
      // 获取站点信息
      if (!store.state.site.info.id) {
        try {
          await store.dispatch('site/getSiteInfo')
        } catch (error) {
          console.log(error)
        }
      }
      // 获取用户信息
      const userId = store.getters['session/get']('userId')
      console.log('user id => ', userId)
      if (!store.state.user.info.id && userId > 0) {
        try {
          await store.dispatch('user/getUserInfo', userId)
        } catch (error) {
          // 清除用户信息
          store.commit('user/SET_USER_INFO', {})
          console.log(error)
        }
      }
    }
    next()
  })
  router.afterEach((to, from) => {
    console.log(to.path)
    console.log('afterEach')
  })
}
