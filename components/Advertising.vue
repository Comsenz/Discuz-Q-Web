<template>
  <div class="adv-container">
    <div ref="qrcode" class="qrcode" />
    <div class="adv-info">
      <div class="adv-title">微信小程序版</div>
      DISCUZ! 分享、交流、共融
    </div>
  </div>
</template>
<script>
const QRCode = process.client && require('qrcodejs2')
export default {
  data() {
    return {
      qrcode: null
    }
  },
  mounted() {
    this.createQrcode(process.env.mobileDomain)
  },
  destroyed() {
    this.qrcode = null
    // this.$refs.qrcode.innerHTML = ''
  },
  methods: {
    createQrcode(link) {
      if (process.client) {
        this.qrcode = null
        this.$nextTick(() => {
          this.qrcode = new QRCode(this.$refs.qrcode, {
            width: 70,
            height: 70, // 高度
            text: link // 二维码内容
            // render: 'canvas' ,   // 设置渲染方式（有两种方式 table和canvas，默认是canvas）
            // background: '#f0f',   // 背景色
            // foreground: '#ff0'    // 前景色
          })
        })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.adv-container{
  padding: 15px;
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 5px;
  box-shadow: 0 3px 3px rgba(0, 0, 0, 0.03);
  margin-bottom: 16px;
  @media screen and ( max-width: 1005px ) {
    font-size:12px;
  }
  .qrcode{
    width:70px;
    height:70px;
    flex:0 0 70px;
    margin-right:10px;
  }
  .adv-title{
    font-size:18px;
    font-weight:bold;
    margin-bottom:6px;
    @media screen and ( max-width: 1005px ) {
      font-size:16px;
    }
  }
}
</style>
