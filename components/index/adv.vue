<template>
  <div class="adv-container">
    <img src="@/assets/qrcode.png" alt="二维码" class="qrcode">
    <div class="adv-info">
      <div class="adv-title">微信小程序版</div>
      DISCUZ! 分享、交流、共融
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {}
  }
}
</script>
<style lang="scss" scoped>
.adv-container{
  padding: 15px;
  display: flex;
  align-items: center;
  .qrcode{
    width:70px;
    height:70px;
    margin-right:6px;
  }
  .adv-title{
    font-size:18px;
    font-weight:bold;
    margin-bottom:6px;
  }
}
</style>
