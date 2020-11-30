module.exports = {
  methods: {
    handleLogin(url, code) {
      this.toregister(url, code)
    },
    toregister(url = '/', code) {
      const preurl = this.$route.fullPath
      if (this.forums && this.forums.set_reg && this.forums.set_reg.register_type === 0) {
        // 用户名模式
        this.$router.push(`/user/register?code=${code}&preurl=${preurl}`)
      }
      if (this.forums && this.forums.set_reg && this.forums.set_reg.register_type === 1) {
        // 手机模式
        this.$router.push(`/user/phone-login-register?code=${code}&preurl=${preurl}`)
      }
      if (this.forums && this.forums.set_reg && this.forums.set_reg.register_type === 2) {
        //  微信模式
        if (this.forums && this.forums.passport && this.forums.passport.oplatform_close && this.forums.passport.offiaccount_close) {
          this.$router.push(`/user/wechat?code=${code}&preurl=${preurl}`)
        } else if (this.forums && this.forums.qcloud && this.forums.qcloud.qcloud_sms) {
          this.$router.push(`/user/phone-login-register?code=${code}&preurl=${preurl}`)
        } else {
          this.$router.push(`/user/register?code=${code}&preurl=${preurl}`)
        }
      }
    },
    headerTologin() {
      const preurl = this.$route.fullPath
      if (this.forums && this.forums.set_reg && this.forums.set_reg.register_type === 0) {
        // 用户名模式
        this.$router.push(`/user/login?preurl=${preurl}`)
      } else if (this.forums && this.forums.set_reg && this.forums.set_reg.register_type === 1) {
        // 手机模式
        this.$router.push(`/user/phone-login-register?preurl=${preurl}`)
      } else if (this.forums && this.forums.set_reg && this.forums.set_reg.register_type === 2) {
        //  微信模式
        if (this.forums && this.forums.passport && this.forums.passport.oplatform_close && this.forums.passport.offiaccount_close) {
          this.$router.push(`/user/wechat?preurl=${preurl}`)
        } else if (this.forums && this.forums.qcloud && this.forums.qcloud.qcloud_sms) {
          this.$router.push(`/user/phone-login-register?preurl=${preurl}`)
        } else {
          this.$router.push(`/user/login?preurl=${preurl}`)
        }
      } else {
        this.$router.push(`/user/login?preurl=${preurl}`)
      }
    },
    logind(loginInfo) {
      // 新用户去填拓展信息，老用户直接登陆
      // this.$message.success(this.$t('user.registerSuccess'))
      // this.$router.push('/user/supple-mentary')
      if (loginInfo && loginInfo.isNew) {
        this.$router.push('/user/supple-mentary')
        return
      } else {
        this.$message.success(this.$t('user.loginSuccess'))
      }
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
          this.$router.push(`${this.preurl}`)
        }
        if (this.site_mode === 'pay' && !this.isPaid) {
          this.$router.push('/site/info')
        }
      })
    },
    headerTologin2() {
      const preurl = this.$route.fullPath
      if (this.forums && this.forums.set_reg && this.forums.set_reg.register_type === 0) {
        // 用户名模式
        location.href = `/user/login?preurl=${preurl}`
      } else if (this.forums && this.forums.set_reg && this.forums.set_reg.register_type === 1) {
        // 手机模式
        location.href = `/user/phone-login-register?preurl=${preurl}`
      } else if (this.forums && this.forums.set_reg && this.forums.set_reg.register_type === 2) {
        //  微信模式
        if (this.forums && this.forums.passport && this.forums.passport.oplatform_close && this.forums.passport.offiaccount_close) {
          location.href = `/user/wechat?preurl=${preurl}`
        } else if (this.forums && this.forums.qcloud && this.forums.qcloud.qcloud_sms) {
          location.href = `/user/phone-login-register?preurl=${preurl}`
        } else {
          location.href = `/user/login?preurl=${preurl}`
        }
      } else {
        location.href = `/user/login?preurl=${preurl}`
      }
    }
  }
}
