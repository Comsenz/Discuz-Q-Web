
module.exports = {
  computed: {
    forums() {
      return this.$store.getters['jv/get']('forums/1');
    }
  }
};
