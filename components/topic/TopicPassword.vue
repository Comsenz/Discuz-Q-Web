<template>
  <message-box :title="$t('pay.checkoutCounter')" @close="$emit('close')">
    <div class="container">
      <div class="block show-amount">
        <div class="title">支付金额</div>
        <div class="amount">
          <span class="icon">￥</span>
          <span>{{ price }}</span>
        </div>
      </div>
      <div class="block input-password">
        <div class="title">支付密码</div>
        <div class="code">
          <span v-for="(item, index) in 6" :key="index" class="code-item">{{ password[index] ? '*' : ' ' }}</span>
        </div>
      </div>
    </div>
  </message-box>
</template>

<script>
export default {
  name: 'TopicPassword',
  props: {
    price: {
      type: [Number, String],
      default: ''
    }
  },
  data() {
    return {
      password: ''
    }
  },
  mounted() {
    document.addEventListener('keyup', this.onInput)
  },
  methods: {
    onInput(e) {
      if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].indexOf(e.key) > 0) this.password += e.key
      if (this.password.length >= 6) return this.$emit('password', this.password.substr(0, 6))
      if (e.key === 'Backspace') this.password = this.password.substr(0, this.password.length - 1)
    }
  }
}
</script>

<style lang="scss" scoped>
  .container {
    height: 370px;
    > .block {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 40px;
      &.show-amount {
        > .title {
          font-size: 16px;
        }
        > .amount {
          height: 52px;
          line-height: 52px;
          position: relative;
          font-size: 40px;
          font-weight: bold;
          > .icon {
            line-height: 20px;
            position: absolute;
            top: 10px;
            left: -20px;
            font-size: 20px;
          }
        }
      }
      &.input-password {
        > .code {
          display: flex;
          > .code-item {
            display: inline-block;
            line-height: 50px;
            text-align: center;
            font-size: 40px;
            font-weight: bold;
            height: 50px;
            width: 36px;
            border-bottom: 1px solid #C5CAD5;
            margin-top: 10px;
            margin-right: 10px;
            margin-bottom: 10px;
            &:last-child {
              margin-right: 0;
            }
          }
        }
      }
    }
  }

</style>
