module.exports = {
  methods: {
    handleLogin(url, code) {
      this.toregister(url, code)
    },
    toregister(url = '/', code) {
      if (this.forums && this.forums.set_reg && this.forums.set_reg.register_type === 0) {
        // 用户名模式
        this.$router.push(`/pages/user/register?code=${code}`)
      }
      if (this.forums && this.forums.set_reg && this.forums.set_reg.register_type === 1) {
        // 手机模式
        this.$router.push(`/pages/user/phone-login-register?code=${code}`)
      }
      if (this.forums && this.forums.set_reg && this.forums.set_reg.register_type === 2) {
        //  微信模式
        if (this.forums && this.forums.passport && this.forums.passport.oplatform_close && this.forums.passport.offiaccount_close) {
          this.$router.push(`/pages/user/wechat?code=${code}`)
        } else if (this.forums && this.forums.qcloud && this.forums.qcloud.qcloud_sms) {
          this.$router.push(`/pages/user/phone-login?code=${this.code}`)
        } else {
          this.$router.push(`/pages/user/register?code=${this.code}`)
        }
      }
    },
    headerTologin() {
      if (this.forums && this.forums.set_reg && this.forums.set_reg.register_type === 0) {
        // 用户名模式
        this.$router.push(`/pages/user/login`)
      } else if (this.forums && this.forums.set_reg && this.forums.set_reg.register_type === 1) {
        // 手机模式
        this.$router.push(`/pages/user/phone-login-register`)
      } else if (this.forums && this.forums.set_reg && this.forums.set_reg.register_type === 2) {
        //  微信模式
        if (this.forums && this.forums.passport && this.forums.passport.oplatform_close && this.forums.passport.offiaccount_close) {
          this.$router.push(`/pages/user/wechat`)
        } else if (this.forums && this.forums.qcloud && this.forums.qcloud.qcloud_sms) {
          this.$router.push(`/pages/user/phone-login`)
        } else {
          this.$router.push(`/pages/user/login`)
        }
      } else {
        this.$router.push(`/pages/user/login`)
      }
    },
    logind() {
      const userId = this.$store.getters['session/get']('userId')
      if (!userId) return
      const params = {
        include: 'groups'
      }
      // 登录成功重新获取一下站点信息
      this.$store.dispatch('site/getSiteInfo')

      this.$store.dispatch('jv/get', [`users/${userId}`, {
        params
      }]).then((val) => {
        this.user = val
        if (this.user && this.user.paid) {
          this.isPaid = this.user.paid
        }
        if (this.site_mode !== 'pay' || this.isPaid) {
          this.$router.push('/')
        }
        if (this.site_mode === 'pay' && !this.isPaid) {
          this.$router.push('/pages/site/info')
        }
      })
    }
  }
}
