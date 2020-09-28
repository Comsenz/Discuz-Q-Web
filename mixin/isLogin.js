module.exports = {
  name: 'isLogin',
  methods: {
    isLogin() {
      const userId = this.$store.state.user.info.id
      if (!userId) {
        this.$message.error(this.$t('user.pleaseLogin'))
        this.$router.push('/pages/user/login')
        return false
      }
      return true
    }
  }
}
