module.exports = {
  data() {
    return {
      errorCodeHandler: {
        'default': {
          'model_not_found': () => this.$router.push('/error')
        },
        'thread': {
          'permission_denied': () => this.$router.push('/error')
        }
      }
    }
  },
  methods: {
    handleError(e, type = '') {
      const { response: { data: { errors }}} = e
      if (errors[0]) {
        const errorCode = errors[0].code
        const error = errors[0].detail ? errors[0].detail[0] : errors[0].code
        const errorText = errors[0].detail ? errors[0].detail[0] : this.$t(`core.${error}`)
        process.client && this.$message.error(errorText)
        this.errorCodeHandler.default[errorCode] && this.errorCodeHandler.default[errorCode]()
        type && this.errorCodeHandler[type][errorCode] && this.errorCodeHandler[type][errorCode]()
      }
    }
  }
}
