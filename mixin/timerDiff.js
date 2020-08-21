module.exports = {
  data() {
    return {
      diffModulus: [
        [1000, 60, this.$t('discuzq.date.sec')],
        [1000 * 60, 60, this.$t('discuzq.date.min')],
        [1000 * 60 * 60, 60, this.$t('discuzq.date.hour')],
        [1000 * 60 * 60 * 24, 24, this.$t('discuzq.date.day')],
        [1000 * 60 * 60 * 24 * 30, 30, this.$t('discuzq.date.mon')],
        [1000 * 60 * 60 * 24 * 30 * 12, 1000000, this.$t('discuzq.date.year')]
      ]
    }
  },
  methods: {
    timerDiff(dateStart, dateEnd = new Date()) {
      if (!(dateStart instanceof Date)) dateStart = new Date(dateStart)
      if (!(dateEnd instanceof Date)) dateEnd = new Date(dateEnd)
      const diff = dateEnd - dateStart
      let value
      for (let i = 0; i < this.diffModulus.length; i++) {
        const item = this.diffModulus[i]
        if (diff / item[0] < item[1]) {
          value = Math.floor(diff / item[0]) + ' ' + item[2]
          break
        }
      }
      return value
    }
  }
}

