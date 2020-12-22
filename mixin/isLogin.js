/* eslint-disable max-len */
module.exports = {
  name: 'isLogin',
  methods: {
    isLogin() {
      const userId = this.$store.state.user.info.id;
      if (!userId) {
        this.$message.error(this.$t('user.pleaseLogin'));
        // this.$router.push(`/user/login?preurl=${this.$route.fullPath}`)
        const preurl = this.$route.fullPath;
        if (this.forums && this.forums.set_reg && this.forums.set_reg.register_type === 0) {
          // 用户名模式
          this.$router.push(`/user/login?preurl=${preurl}`);
        } else if (this.forums && this.forums.set_reg && this.forums.set_reg.register_type === 1) {
          // 手机模式
          this.$router.push(`/user/phone-login-register?preurl=${preurl}`);
        } else if (this.forums && this.forums.set_reg && this.forums.set_reg.register_type === 2) {
          //  微信模式
          if (this.forums && this.forums.passport && this.forums.passport.oplatform_close && this.forums.passport.offiaccount_close) {
            this.$router.push(`/user/wechat?preurl=${preurl}`);
          } else if (this.forums && this.forums.qcloud && this.forums.qcloud.qcloud_sms) {
            this.$router.push(`/user/phone-login-register?preurl=${preurl}`);
          } else {
            this.$router.push(`/user/login?preurl=${preurl}`);
          }
        } else {
          this.$router.push(`/user/login?preurl=${preurl}`);
        }
        return false;
      }
      return true;
    }
  }
};
