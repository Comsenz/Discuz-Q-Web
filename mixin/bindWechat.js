module.exports = {
  data() {
    return {
      wehcatTimer: null,
      wechatBind: {}
    }
  },
  destroyed() {
    window.clearInterval(this.wehcatTimer)
  },
  methods: {
    // 绑定微信 生成二维码
    createQRcode() {
      this.$store.dispatch('jv/get', `/oauth/wechat/pc/qrcode`).then(res => {
        if (res) {
          this.wechatBind = res
          const _this = this
          this.wehcatTimer = setInterval(_this.getWechatStatus, 3000)
        }
      }, e => this.handleError(e))
    },
    // 轮询查询微信是否绑定成功
    getWechatStatus() {
      if (this.wechatBind && !this.wechatBind.session_token) return
      this.$store.dispatch('jv/get', `/oauth/wechat/pc/login/${this.wechatBind.session_token}`).then(res => {
        if (res.pc_login) {
          window.clearInterval(this.wehcatTimer)
          this.userinfo()
          this.isWechatModify = false
          this.$message.success('绑定成功')
        }
      }, e => {
        this.handleError(e)
        window.clearInterval(this.wehcatTimer)
        this.createQRcode()
      })
    }
  }
}
