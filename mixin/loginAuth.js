module.exports = {
  methods: {
    handleLogin(url, code) {
      console.log('判断是否登陆')
      this.login(url, code)
    },
    login(url = '/', code) {
      console.log('判断是否登陆')

      if (this.forums && this.forums.set_reg) {
        // 用户名模式 / 手机模式 / 腾讯验证码是否开启都是跳到同一个登录页面
        console.log('判断是否登陆')

        this.$router.push(`/user/login?url=${url}&code=${code}`)
      }
    }
  }
}
