<template>
  <div class="global">
    <Nuxt />
  </div>
</template>
<script>
export default {
  data() {
    return {};
  },
  computed: {
    forums() {
      return this.$store.state.site.info.attributes || {};
    }
  },
  head() {
    return {
      link: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          href:
            this.forums
            && this.forums.set_site
            && this.forums.set_site.site_favicon
        }
      ]
    };
  }
};
</script>
<style lang="scss" scoped>
.global {
  width: 100vw;
  height: 100vh;
  background: white;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
