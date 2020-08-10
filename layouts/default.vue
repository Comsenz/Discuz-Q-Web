<template>
  <div>
    <Header
      :key="this.$route.path"
      :head-img="info.set_site ? info.set_site.site_header_logo : ''"
    />
    <div class="app-cont">
      <Nuxt />
    </div>
    <Footer />
  </div>
</template>

<script>
export default {
  data() {
    return {
      info: ''
    }
  },
  mounted() {
    const info = this.$store.getters['jv/get']('forums/1')
    this.info = info
    console.log(info)
    // const _params = {
    //   _jv: {
    //     type: 'forum'
    //   }
    // }
    // this.$store.dispatch('jv/get', _params).then(data => {
    //   console.log('user data => ', data)
    //   this.info = data
    // })
  }
}
</script>
<style lang="scss" scoped>
.app-cont {
  display: flex;
  justify-content: center;
  margin: 15px auto 0;
  width: 1005px;
  /* height: 706px; */
  min-height: calc(100vh - 65px - 80px - 15px);
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 3px 3px rgba(0, 0, 0, 0.03);
  border-radius: 5px;
}
</style>
