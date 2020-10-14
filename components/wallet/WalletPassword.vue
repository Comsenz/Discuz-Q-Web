<template>
  <message
    :title="$t('profile.editpaypassword')"
    @close="$emit('close')"
  >
    <div class="container">
      <div class="block show-amount">
        <div class="title">{{ $t('profile.orignpassword') }}</div>
        <div class="amount">
          <span>{{ $t('modify.editpasswordtip') }}</span>
        </div>
      </div>
      <div class="block input-password">
        <walletpass-input
          ref="walletinput"
          :error="error"
          @password="password => $emit('password', password)"
        />
        <div
          v-if="error"
          class="amount"
        >{{ passwordErrorTip ? passwordErrorTip : $t('modify.passwordinputerro') }}</div>
      </div>
      <div v-if="forums && forums.qcloud && forums.qcloud.qcloud_sms" class="findpaypwd" @click="findpaypwd">
        {{ $t('modify.forgetpaypassword') }}
      </div>
    </div>
  </message>
</template>

<script>
export default {
  name: 'WalletPassword',
  props: {
    error: {
      type: Boolean,
      default: false
    },
    passwordErrorTip: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
    }
  },
  computed: {
    forums() {
      return this.$store.state.site.info.attributes || {}
    }
  },
  methods: {
    empty() {
      this.$refs.walletinput.deleat()
    },
    findpaypwd() {
      this.$emit('close')
      this.$emit('findpaypwd')
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
  .findpaypwd{
    font-size:12px;
    color:#8590a6;
    position: absolute;
    right: 22px;
    bottom: 21px;
    cursor: pointer;
  }
}
</style>
