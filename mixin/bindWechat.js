module.exports = {
  data() {
    return {
      wehcatTimer: null,
      wechatBind: {}
    };
  },
  destroyed() {
    window.clearInterval(this.wehcatTimer);
  },
  methods: {
    // 绑定微信 生成二维码
    createQRcode() {
      this.$store.dispatch('jv/get', `/oauth/wechat/pc/qrcode?type=pc_relation`).then(res => {
        if (res) {
          this.wechatBind = res;
          const _this = this;
          this.wehcatTimer = setInterval(_this.getWechatStatus, 3000);
        }
      }, e => this.handleError(e));
    },
    // 轮询查询微信是否绑定成功
    getWechatStatus() {
      if (this.wechatBind && !this.wechatBind.session_token) return;
      this.$store.dispatch('jv/get', `/oauth/wechat/pc/bind/${this.wechatBind.session_token}`).then(res => {
        if (res._jv.json.bind) {
          clearInterval(this.wehcatTimer);
          this.userinfo();
          this.isWechatModify = false;
          this.$message.success(this.$t('user.BindSuccess'));
        }
      }, e => {
        const {
          response: {
            data: {
              errors
            }
          }
        } = e;
        if (Array.isArray(errors) && errors.length > 0) {
          const error = errors[0].detail && errors[0].detail.length > 0 ? errors[0].detail[0] : errors[0].code;
          const errorText = errors[0].detail && errors[0].detail.length > 0
            ? errors[0].detail[0] : this.$t(`core.${error}`);
          if (error === 'pc_qrcode_scanning_code') {
            return;
          } else {
            clearInterval(this.wehcatTimer);
            this.$message.error(errorText);
            this.createQRcode();
          }
        }
      });
    }
  }
};
