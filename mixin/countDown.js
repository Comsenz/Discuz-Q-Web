module.exports = {
  methods: {
    countDown(interval) {
      if (!this.canClick) return;
      let intervals = interval;
      this.canClick = false;
      this.content = intervals + this.$t('modify.retransmission');
      const clock = setInterval(() => {
        intervals = intervals - 1;
        this.content = intervals + this.$t('modify.retransmission');
        if (intervals < 0) {
          clearInterval(clock);
          this.content = this.$t('modify.sendVerifyCode');
          this.canClick = true;
        }
      }, 1000);
    }
  }
};
