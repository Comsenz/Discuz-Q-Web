module.exports = {
  data() {
    return {
      orderNo: '',
      paymentType: 0,
      paymentStatus: 0
    }
  },
  methods: {
    createOrder(hideAvatar, amount = 0, type, paymentType, payeeId = '') {
      if (this.defaultLoading) return
      this.defaultLoading = true
      const params = {
        _jv: { type: `/orders` },
        is_anonymous: hideAvatar,
        type,
        amount
      }
      if (payeeId) params.payee_id = payeeId
      if (this.threadId) params.thread_id = this.threadId
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
          return data.wechat_qrcode
        } else {
          this.$message.success(this.$t('pay.paySuccess'))
          this.passwordError = false
          this.showPasswordInput = false
          return this.orderNo
        }
      }, e => {
        const { response: { data: { errors }}} = e
        if (errors[0].code === 'pay_password_failures_times_toplimit') {
          this.passwordError = true
          this.passwordErrorTip = this.$t('core.pay_password_failures_times_toplimit')
          return Promise.reject()
        }
        if (errors[0].code === 'validation_error') {
          this.passwordError = true
          this.passwordErrorTip = errors[0].detail[0]
          return Promise.reject()
        }
        this.handleError(e)
      })
    },
    wxPayActive() {
      this.showWxPay = true
      return new Promise((resolve, reject) => {
        const id = setInterval(() => {
          if (this.paymentStatus === 1) {
            clearInterval(id)
            this.$message.success(this.$t('pay.paySuccess'))
            this.showWxPay = false
            resolve(this.orderNo)
          }
          if (!this.showWxPay) {
            clearInterval(id)
            reject()
          }
          this.getOrderStatus()
        }, 3000)
      })
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
