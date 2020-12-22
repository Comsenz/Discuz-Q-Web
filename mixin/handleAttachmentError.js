module.exports = {
  methods: {
    handleAttachmentError(e) {
      if (e && e.message) {
        const errors = e.message.errors;
        const error = errors[0].detail ? errors[0].detail[0] : errors[0].code;
        const errorText = errors[0].detail ? errors[0].detail[0] : this.$t(`core.${error}`);
        process.client && this.$message.error(errorText);
      } else this.$message.error(this.$t('post.imageUploadFail'));
    }
  }
};
