<template>
  <div class="share-container">
    <el-popover
      placement="bottom"
      width="120"
      min-width="120"
      trigger="click"
      popper-class="custom-popover-width"
      @show="onShowPopover"
      @hide="closeCode"
    >
      <div class="share-cont">
        <div class="copy" @click="copyLink">
          <svg-icon type="copy-link" class="copy-icon" />
          <span>{{ $t('core.copyLink') }}</span>
        </div>
        <div class="qrcode">
          <div class="qrcode-text">
            <svg-icon type="wechat-logo" class="wechat-logo" />
            <span>{{ $t('core.wxShare') }}</span>
          </div>
          <div ref="qrcode" class="qrcode-cont">
          <!-- <i class="el-icon-loading qrcode-loading" /> -->
          </div>
        </div>
      </div>
      <template slot="reference">
        <slot />
      </template>
    </el-popover>
  </div>
</template>
<script>
const QRCode = process.client && require('qrcodejs2')
export default {
  props: {
    threadsId: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      qrcode: null
    }
  },
  methods: {
    copyLink() {
      const oInput = document.createElement('input')
      if (process.client) {
        oInput.value = window.location.host + '/topic/index?id=' + this.threadsId
        oInput.id = 'copyInput'
        document.body.appendChild(oInput)
        oInput.select()
        document.execCommand('Copy')
      }
      this.$message.success('链接复制成功')
      setTimeout(() => {
        oInput.remove()
      }, 100)
    },
    onShowPopover() {
      this.createQrcode(process.env.mobileDomain + '/pages/topic/index?id=' + this.threadsId)
    },
    createQrcode(link) {
      if (process.client) {
        this.qrcode = null
        this.$nextTick(() => {
          this.qrcode = new QRCode(this.$refs.qrcode, {
            width: 88,
            height: 88, // 高度
            text: link // 二维码内容
            // render: 'canvas' ,   // 设置渲染方式（有两种方式 table和canvas，默认是canvas）
            // background: '#f0f',   // 背景色
            // foreground: '#ff0'    // 前景色
          })
        })
      }
    },
    // 关闭弹框,清除已经生成的二维码
    closeCode() {
      this.$refs.qrcode.innerHTML = ''
    }
  }
}
</script>
<style lang="scss">
.custom-popover-width{
  min-width: 120px;
  padding: 0;
}
</style>
<style lang="scss" scoped>
@import '@/assets/css/variable/color.scss';
.share-cont{
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #6D6D6D;
  font-size: 14px;
  text-align: center;
  padding:5px 12px 15px;
  .copy{
    width: 100%;
    border-bottom: 1px solid #EDEDED;
    padding: 10px 0;
    cursor: pointer;
    &:hover{
      color: $color-blue-deep;
    }
    .copy-icon{
      margin-right: 6px;
    }
  }
}
.qrcode{
  &-text{
    width: 100%;
    padding: 10px 0;
  }
  .wechat-logo{
    font-size: 18px;
    margin-right: 6px;
  }
  &-cont{
    width:88px;
    height: 88px;
    position: relative;
  }
  &-loading{
    position: absolute;
    z-index: -1;
    font-size: 23px;
    display: inline-block;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
