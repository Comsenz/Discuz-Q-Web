<template>
  <div class="actions">
    <button
      v-for="(action, index) in actions.slice(0, 3)"
      :key="index"
      :disabled="!action.canOpera"
      :class="{ 'action': true, 'disabled': !action.canOpera }"
      @click="onClick(action)"
    >
      <svg-icon class="action-icon" :type="action.icon" />
      <span class="content">
        <span>{{ action.text }}</span>
        <span v-if="action.count"> ({{ action.count }})</span>
      </span>
    </button>
    <div class="action">
      <el-popover
        placement="bottom"
        width="120"
        trigger="click"
      >
        <div
          style="display: flex; flex-direction: column; align-items: center; color: #6D6D6D; font-size: 14px; text-align: center;"
        >
          <div style="width: 100%;border-bottom: 1px solid #EDEDED; padding: 10px 0; cursor: pointer" @click="copyLink">
            <svg-icon style="margin-right: 6px;" type="copy-link" />
            <span>{{ $t('core.copyLink') }}</span>
          </div>
          <div class="qr-code">
            <div style="width: 100%; padding: 10px 0;">
              <svg-icon style="font-size: 18px;margin-right: 6px;" type="wechat-logo" />
              <span>{{ $t('core.wxShare') }}</span>
            </div>
            <div style="width: 88px; height: 88px; border: 1px solid red">二维码</div>
          </div>
        </div>
        <button
          slot="reference"
          :disabled="!actions[3].canOpera"
          :class="{ 'action': true, 'disabled': !actions[3].canOpera }"
        >
          <svg-icon class="action-icon" :type="actions[3].icon" />
          <span class="content">
            <span>{{ actions[3].text }}</span>
            <span v-if="actions[3].count"> ({{ actions[3].count }})</span>
          </span>
        </button>
      </el-popover>
    </div>
  </div>

</template>

<script>
// TODO create qrcode
// import QRCode from 'qrcodejs2'
export default {
  name: 'TopicActions',
  props: {
    actions: {
      type: Array,
      default: () => []
    }
  },
  // updated() {
  //   setTimeout(() => {
  //     this.qrcode('baidu.com')
  //   }, 1000)
  // },
  methods: {
    onClick(action) {
      if (action.command) this.$emit('clickAction', action)
    },
    copyLink() {
      const oInput = document.createElement('input')
      if (process.client) {
        oInput.value = window.location.href
        oInput.id = 'copyInput'
        document.body.appendChild(oInput)
        oInput.select()
        document.execCommand('Copy')
      }
      this.$message.success('链接复制成功')
      setTimeout(() => {
        oInput.remove()
      }, 100)
    }
    // qrcode(link) {
    //   const xxx = new QRCode('qrcode', {
    //     width: 88,
    //     height: 88, // 高度
    //     text: link // 二维码内容
    //     // render: 'canvas' ,   // 设置渲染方式（有两种方式 table和canvas，默认是canvas）
    //     // background: '#f0f',   // 背景色
    //     // foreground: '#ff0'    // 前景色
    //   })
    //   console.log('qrcode', xxx)
    // }
  }
}
</script>

<style lang="scss" scoped>
  @import '@/assets/css/variable/color.scss';
  .actions {
    margin: 15px auto 70px;
    padding: 0 25px;
    display: flex;
    justify-content: space-between;

    .action {
      cursor: pointer;
      flex: 1;
      display: flex;
      align-items: center;
      flex-direction: column;
      color: $font-color-grey;

      &.disabled {
        cursor: not-allowed;
      }

      > .action-icon {
        font-size: 20px;
        fill: $font-color-grey;
      }

      > .content {
        margin-top: 10px;
        font-size: 12px;
      }
    }
  }

</style>
