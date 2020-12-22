module.exports = {
  data() {
    return {
      title: '\u200E'
    };
  },
  computed: {
    forums() {
      return this.$store.state.site.info.attributes || {};
    }
  },
  head() {
    return {
      title: this.title !== '\u200E' && this.forums
        && this.forums.set_site && this.forums.set_site.site_name
        ? `${this.title} - ${this.forums.set_site.site_name}` : this.title
    };
  }
};
