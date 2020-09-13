<template>
  <div>
    <Header />
    <div class="app-cont">
      <Nuxt />
    </div>
    <!-- <Footer /> -->
  </div>
</template>

<script>
export default {
  data() {
    return {
    }
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
