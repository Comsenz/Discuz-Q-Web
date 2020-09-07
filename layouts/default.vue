<template>
  <div class="global">
    <Header
      :key="this.$route.path"
      :head-img="info.set_site ? info.set_site.site_header_logo : ''"
    />
    <div class="app-container">
      <div class="app-cont">
        <Nuxt />
      </div>
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
  .app-container {
    width: 1005px;
    background: #F4F5F6;
    margin: 15px auto 0;
    // padding: 0 15px;
    @media screen and ( max-width: 1005px ) {
      width: 100%;
      min-width: 768px;
    }
    .app-cont {
      width: 100%;
      min-height: calc(100vh - 65px - 80px - 15px);
      display: flex;
      justify-content: center;
      background: rgba(255, 255, 255, 1);
      box-shadow: 0 3px 3px rgba(0, 0, 0, 0.03);
      border-radius: 5px;
    }
  }

</style>
