module.exports = {
  data() {
    return {
      diffModulus: [
        [1000, 60, this.$t('discuzq.date.sec')],
        [1000 * 60, 60, this.$t('discuzq.date.min')],
        [1000 * 60 * 60, 24, this.$t('discuzq.date.hour')],
        [1000 * 60 * 60 * 24, 30, this.$t('discuzq.date.day')],
        [1000 * 60 * 60 * 24 * 30, 12, this.$t('discuzq.date.mon')],
        [1000 * 60 * 60 * 24 * 30 * 12, 1000000, this.$t('discuzq.date.year')]
      ]
    };
  },
  methods: {
    timerDiff(dateStart, dateEnd) {
      if (!process.client) return '';
      if (!(dateStart instanceof Date)) dateStart = new Date(dateStart);
      if (!(dateEnd instanceof Date)) dateEnd = (process.client && window.currentTime) || new Date();
      if (!dateEnd) dateEnd = (process.client && window.currentTime) || new Date();
      const diff = dateEnd - dateStart;
      let value;
      for (let i = 0; i < this.diffModulus.length; i++) {
        const item = this.diffModulus[i];
        if (diff / item[0] < item[1]) {
          value = `${Math.ceil(diff / item[0])} ${item[2]}`;
          break;
        }
      }
      return value || '';
    }
  }
};

