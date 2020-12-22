module.exports = {
  methods: {
    postLegalityCheck(post, successTip, examineTip = this.$t('topic.publishExamineTip')) {
      post.isApproved === 0 ? this.$message.warning(examineTip) : this.$message.success(successTip);
    }
  }
};
