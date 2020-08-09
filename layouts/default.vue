<template>
  <div>
    <Header/>
    <div class="app-cont">
      <Nuxt/>
    </div>
    <Footer/>
  </div>
</template>

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
