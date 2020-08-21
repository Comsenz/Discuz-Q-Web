<template>
  <div class="advertising">
    <img src="@/assets/qrcode.png" alt="二维码" class="qrcode">
    <div class="adv-info">
      <div class="adv-title">微信小程序版</div>
      DISCUZ! 分享、交流、共融
    </div>
  </div>
</template>

<script>
export default {
  name: 'Advertising'
}
</script>

<style lang="scss" scoped>
  .advertising {
    display: flex;
    align-items: center;
    padding: 20px;
    background: #ffffff;
    border-radius: 3px;
    margin-top: 15px;

    .qrcode {
      width: 70px;
      height: 70px;
      margin-right: 6px;
    }

    .adv-title {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 6px;
    }
  }
</style >
