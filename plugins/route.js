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
      if (!store.state.user.info.id && userId) {
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
