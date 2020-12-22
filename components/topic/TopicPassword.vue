<template>
  <message-box :title="$t('pay.checkoutCounter')" @close="$emit('close')">
    <div class="container">
      <div class="block show-amount">
        <div class="title">{{ $t("pay.pay") + $t("pay.sumOfMoney") }}</div>
        <div class="amount">
          <span class="icon">￥</span>
          <span>{{ price }}</span>
        </div>
      </div>
      <div class="block input-password">
        <div class="title">{{ $t("pay.payPassword") }}</div>
        <password-input
          :error="passwordError"
          @password="password => $emit('password', password)"
          @type="$emit('update:passwordError', false)"
        />
        <div v-show="passwordError" class="error-tip">
          {{ passwordErrorTip ? passwordErrorTip : $t("pay.passwordError") }}
        </div>
      </div>
      <span class="forget-password" @click="$emit('findPassword')">{{
        $t("topic.forgetPasswordFindIt")
      }}</span>
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
    },
    passwordErrorTip: {
      type: String,
      default: ''
    }
  }
};
</script>

<style lang="scss" scoped>
.container {
  height: 370px;
  position: relative;
  > .block {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 40px;
    > .error-tip {
      margin-top: 10px;
      color: #8590a6;
      font-size: 12px;
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
  > .forget-password {
    position: absolute;
    color: #8590a6;
    cursor: pointer;
    font-size: 12px;
    right: 20px;
    bottom: 20px;
  }
}
</style>
