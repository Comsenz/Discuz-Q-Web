module.exports = {
  methods: {
    setCurrentTime() {
      const date = (process.client && window.currentTime) || new Date();
      const year = date.getFullYear();
      let month = date.getMonth() + 1;
      month = month < 10 ? `0${month}` : month;
      this.date = `${year}-${month}`;
    }
  }
};
