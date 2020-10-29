module.exports = {
  data() {
    return {
      orderNo: '',
      paymentType: 0,
      paymentStatus: 0
    }
  },
  methods: {
    createOrder(hideAvatar, amount = 0, type, paymentType) {
      if (this.defaultLoading) return
      this.defaultLoading = true
      const params = {
        _jv: { type: `/orders` },
        type,
        thread_id: this.threadId || '',
        is_anonymous: hideAvatar,
        amount
      }
      return this.$store.dispatch('jv/post', params).then(data => {
        this.orderNo = data.order_sn
        this.paymentType = paymentType
      }, e => this.handleError(e))
    },
    payOrder(password = '') {
      const params = {
        _jv: { type: `/trade/pay/order/${this.orderNo}` },
        order_sn: this.orderNo,
        payment_type: this.paymentType,
        pay_password: password
      }
      return this.$store.dispatch('jv/post', params).then(data => {
        if (this.paymentType === 10) {
          this.wxPayActive(data)
        } else {
          this.$message.success(this.$t('pay.paySuccess'))
          this.passwordError = false
          this.showPasswordInput = false
          this.getThread()
        }
      }, e => {
        const { response: { data: { errors }}} = e
        if (errors[0].code === 'pay_password_failures_times_toplimit') {
          this.passwordError = true
          this.passwordErrorTip = this.$t('core.pay_password_failures_times_toplimit')
          return
        }
        if (errors[0].code === 'validation_error') {
          this.passwordError = true
          this.passwordErrorTip = errors[0].detail[0]
          return
        }
        this.handleError(e)
      })
    },
    wxPayActive(data) {
      this.payment.wechat_qrcode = data.wechat_qrcode
      this.showWxPay = true
      if (process.client) {
        const id = setInterval(() => {
          if (this.paymentStatus === 1) {
            clearInterval(id)
            this.$message.success(this.$t('pay.paySuccess'))
            this.showWxPay = false
            this.getThread()
          }
          if (!this.showWxPay) clearInterval(id)
          this.getOrderStatus()
        }, 3000)
      }
    },
    getOrderStatus() {
      const params = { _jv: { type: `/orders/${this.orderNo}` }, orderNo: this.orderNo }
      return this.$store.dispatch('jv/get', params).then(data => { this.paymentStatus = data.status }, e => this.handleError(e))
    },
    onFindPassword() {
      this.showPasswordInput = this.passwordError = false
      this.passwordErrorTip = ''
      this.findPassword = true
    }
  }
}
