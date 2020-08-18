<template>
  <message-box :title="$t('pay.pay')" @close="$emit('close')">
    <div class="container">
      <div class="title">
        <svg-icon style="fill: #09BB07;font-size: 30px" type="wechat" />
        <span>微信支付</span>
      </div>
      <div class="tip">二维码有效时长为5分钟，请尽快支付</div>
      <div class="container-qr-code">
        <img :src="qrCode" style="width: 138px; height: 138px" alt="qr-code">
      </div>
      <div class="scan-tip">
        <svg-icon style="display: block; font-size: 32px" type="wx-scan" />
        <div class="tip">
          <span>请使用微信扫一扫</span>
          <span>扫描二维码支付</span>
        </div>
      </div>
    </div>
  </message-box>
</template>

<script>
export default {
  name: 'TopicPassword',
  props: {
    qrCode: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="scss" scoped>
  .container {
    height: 460px;
    display: flex;
    flex-direction: column;
    align-items: center;
    > .title {
      margin-top: 40px;
      > span {
        line-height: 40px;
        font-size: 30px;
        font-weight: bold;
      }
    }

    > .tip {
      margin-top: 20px;
      font-size: 16px;
      color: #6D6D6D;
    }

    > .container-qr-code {
      margin-top: 20px;
      width: 180px;
      height: 180px;
      padding: 20px;
      border: 2px solid #EDEDED;
    }

    > .scan-tip {
      margin-top: 10px;
      display: flex;
      align-items: center;
      > .tip {
        span {
          margin-left: 10px;
          display: block;
          color: #6D6D6D;
          font-size: 16px;
        }
      }
    }

  }

</style>
