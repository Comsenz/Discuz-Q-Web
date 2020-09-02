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
  created() {
    if (process.client) this.$store.commit('session/SET_USER_ID', localStorage.getItem('user_id') || '0')
  },
  mounted() {
    const _params = {
      _jv: {
        type: 'forum'
      }
    }
    this.$store.dispatch('jv/get', _params).then(data => {
      console.log('user data => ', data)
      this.info = data
    })
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
  @media screen and ( max-width: 1005px ) {
    width: 100%;
    min-width: 768px;
    padding: 0 14px;
  }
}
</style>
