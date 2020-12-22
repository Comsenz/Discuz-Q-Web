module.exports = {
  data() {
    return {
      errorCodeHandler: {
        default: {
          model_not_found: () => this.$router.replace('/error'),
          not_authenticated: () => this.$router.push('/user/login')
        },
        thread: {
          permission_denied: () => this.$router.replace('/error')
        }
      }
    };
  },
  methods: {
    async handleError(e, type = '') {
      const {
        response: {
          data: {
            errors
          }
        }
      } = e;
      if (Array.isArray(errors) && errors.length > 0) {
        const errorCode = errors[0].code;
        const error = errors[0].detail && errors[0].detail.length > 0 ? errors[0].detail[0] : errors[0].code;
        const errorText = errors[0].detail && errors[0].detail.length > 0
          ? errors[0].detail[0] : this.$t(`core.${error}`);
        // 站点关闭跳转
        if (errors[0].code === 'site_closed') return await this.siteClose(errors);

        process.client && this.$message.error(errorText);
        this.errorCodeHandler.default[errorCode] && this.errorCodeHandler.default[errorCode]();
        type && this.errorCodeHandler[type][errorCode] && this.errorCodeHandler[type][errorCode]();
      }
    },
    async siteClose(errors) {
      try {
        await this.$store.dispatch('forum/setError', {
          code: errors[0].code,
          detail: errors[0].detail && errors[0].detail.length > 0 && errors[0].detail[0]
        });
        await this.$router.push('/site/close');
      } catch (e) {
        console.log(e);
      }
    }
  }
};
