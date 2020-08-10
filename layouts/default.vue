<template>
  <div>
<<<<<<< HEAD
    <Header :head-img="info.set_site ? info.set_site.site_header_logo : ''" :key="this.$route.path"/>
    <div class="container">
=======
    <Header/>
    <div class="app-cont">
>>>>>>> f14532ad191aaf91bd3ed2be9be93820467dfad0
      <Nuxt/>
    </div>
    <Footer/>
  </div>
</template>
<<<<<<< HEAD
<script>
export default {
  data() {
    return {
      info: ''
    }
  },
  mounted() {
     const _params = {
      _jv: {
        type: 'forum',
      },
    };
      this.$store.dispatch('jv/get', _params).then(data => {
        console.log('user data => ', data)
        this.info = data
      });
  }
}
</script>
<style>
  .container {
    display: flex;
    justify-content: center;
    margin: 15px auto 0;
    width: 1005px;
    /* height: 706px; */
    min-height: 660px;
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 3px 3px rgba(0, 0, 0, 0.03);
    opacity: 1;
    border-radius: 5px;
  }
=======

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
>>>>>>> f14532ad191aaf91bd3ed2be9be93820467dfad0
</style>
