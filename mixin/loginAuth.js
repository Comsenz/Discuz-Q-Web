module.exports = {
  methods: {
    handleLogin(url, code) {
      this.login(url, code)
    },
    login(url = '/', code) {

      if (this.forums && this.forums.set_reg) {
        // 用户名模式 / 手机模式 / 腾讯验证码是否开启都是跳到同一个登录页面
        this.$router.push(`/pages/user/register?url=${url}&code=${code}`)
      }
    }
  }
}
