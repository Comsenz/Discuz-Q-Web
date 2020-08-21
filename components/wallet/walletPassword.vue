<template>
  <message-box
    :title="$t('profile.editpaypassword')"
    @close="$emit('close')"
  >
    <div class="container">
      <div class="block show-amount">
        <div class="title">{{ error ? $t('profile.orignpassword') :$t('modify.editphonecode') +userInfo.mobile+$t('user.verification') }}</div>
        <div class="amount">
          <span>{{ error ?$t('modify.editpasswordtip') : $t('modify.editpasswordtip') }}</span>
        </div>
      </div>
      <div class="block input-password">
        <walletpass-input
          :error="error"
          @password="password => $emit('password', password)"
        />
        <!-- <div class="title">{{ $t('pay.payPassword') }}</div> -->
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
    error: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      userId: this.$store.getters['session/get']('userId') // 获取当前登陆用户的ID
    }
  },
  computed: {
    userInfo() {
      return this.$store.getters['jv/get'](`/users/${this.userId}`)
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
        font-size: 30px;
      }
      > .amount {
        height: 52px;
        line-height: 52px;
        position: relative;
        font-size: 14px;
        color: #777777;
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
