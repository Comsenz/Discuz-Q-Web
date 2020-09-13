const tcaptchs = process.client ? require('@/utils/tcaptcha') : ''
module.exports = {
  mixins: [tcaptchs],
  computed: {
    forums() {
      return this.$store.state.site.info.attributes || {}
    },
    user() {
      return this.$store.state.user.info.attributes || {}
    }
  },
  methods: {
    checkCaptcha(params) {
      return new Promise((resolve, reject) => {
        if (this.forums && this.forums.qcloud && this.forums.qcloud.qcloud_captcha) {
          // eslint-disable-next-line no-undef
          const captcha = new TencentCaptcha(this.forums.qcloud.qcloud_captcha_app_id, res => {
            if (res.ret === 0) {
              params.captcha_rand_str = res.randstr
              params.captcha_ticket = res.ticket
              resolve(params)
            } else reject(res)
          })
          return captcha.show()
        }
        resolve(params)
      })
    }
  }
}
