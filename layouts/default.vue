<template>
  <div>
    <Header/>
    <div class="container">
      <Nuxt/>
    </div>
    <Footer/>
  </div>
</template>

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
</style>
