export default ({ app }) => {
  app.router.beforeEach(async(to, from, next) => {
    if (process.client) {
      // 获取站点信息
      if (!app.store.state.site.info.id) {
        try {
          await app.store.dispatch('site/getSiteInfo')
        } catch (error) {
          console.log(error)
        }
      }
      // 获取用户信息
      const userId = app.store.getters['session/get']('userId')
      if (!app.store.state.user.info.id && userId) {
        try {
          await app.store.dispatch('user/getUserInfo', userId)
        } catch (error) {
          console.log(error)
        }
      }
    }

    next()
  })
  app.router.afterEach((to, from) => {
    console.log(to.path)
    console.log('afterEach')
  })
}
