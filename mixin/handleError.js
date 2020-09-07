module.exports = {
  methods: {
    handleError(e) {
      const { response: { data: { errors }}} = e
      if (errors[0]) {
        const error = errors[0].detail ? errors[0].detail[0] : errors[0].code
        const errorText = errors[0].detail ? errors[0].detail[0] : this.$t(`core.${error}`)
        process.client && this.$message.error(errorText)
      }
    }
  }
}
