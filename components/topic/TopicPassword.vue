<template>
  <message-box :title="$t('pay.checkoutCounter')" @close="$emit('close')">
    <div class="container">
      <div class="block show-amount">
        <div class="title">{{ $t('pay.pay') + $t('pay.sumOfMoney') }}</div>
        <div class="amount">
          <span class="icon">￥</span>
          <span>{{ price }}</span>
        </div>
      </div>
      <div class="block input-password">
        <div class="title">{{ $t('pay.payPassword') }}</div>
        <password-input :error="passwordError" @password="updatePassword" />
        <div v-show="passwordError" class="error-tip">{{ $t('pay.passwordError') }}</div>
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
    },
    passwordError: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    updatePassword(password) {
      this.$emit('password', password)
      this.$emit('update:passwordError', false)
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
      > .error-tip {
        margin-top: 10px;
        color: #8590A6;
        line-height: 16px;
      }
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
    }
  }

</style>
