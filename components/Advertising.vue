<template>
  <div class="adv-container">
    <div ref="qrcode" class="qrcode" />
    <div class="adv-info">
      <div class="adv-title"> 扫一扫，访问移动端</div>
      {{ site_name }}
    </div>
  </div>
</template>
<script>
const QRCode = process.client && require('qrcodejs2')
export default {
  data() {
    return {
      qrcode: null,
      site_name: ''
    }
  },
  computed: {
    forums() {
      return this.$store.state.site.info.attributes || {}
    }
  },
  watch: {
    forums: {
      handler(val) {
        if (val && val.set_site) {
          this.site_name = val.set_site.site_name ? val.set_site.site_name : 'Discuz! Q'
        }
      },
      deep: true
    }
  },
  mounted() {
    this.site_name = this.forums && this.forums.set_site && this.forums.set_site.site_name ? this.forums.set_site.site_name : 'Discuz! Q'
    this.createQrcode(window.location.href)
  },
  destroyed() {
    this.qrcode = null
  },
  methods: {
    /**
     * 生成二维码
     * @param {*} link 网址
     * @example:
     * createQrcode('https://xxx.com/')
     */
    createQrcode(link) {
      if (process.client) {
        this.qrcode = null
        this.$nextTick(() => {
          this.qrcode = new QRCode(this.$refs.qrcode, {
            width: 70,
            height: 70, // 高度
            text: link // 二维码内容
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
