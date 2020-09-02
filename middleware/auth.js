export default ({ store, route, redirect }) => {
  const requiresAuth = (route.meta || []).find(item => item.requiresAuth)
  const isLogin = store.state.user.info.id

  // 没登录态的时候重定向到首页
  if (requiresAuth && !isLogin) {
    redirect('/')
  }
}
