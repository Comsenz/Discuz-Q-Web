<template>
  <message
    :title="$t('modify.authontitle')"
    @close="$emit('close')"
  >
    <div class="container">
      <div class="block show-amount">
        <div class="title">{{ `请收入手机 ${mobile} 的验证码` }}</div>
        <div class="amount">
          <span>{{ $t('modify.editphonewordtip') }}</span>
        </div>
      </div>
      <div class="block input-password">
        <wallet-password-input
          ref="walletinput"
          :error="error"
          @password="password => $emit('password', password)"
        />
        <div
          v-if="error"
          class="amount"
        >{{ passwordErrorTip ? passwordErrorTip : $t('core.sms_verify_error') }}</div>
      </div>
    </div>
  </message>
</template>

<script>

export default {
  name: 'VerifyPhone',
  props: {
    error: {
      type: Boolean,
      default: false
    },
    passwordErrorTip: {
      type: String,
      default: ''
    },
    mobile: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
    };
  },
  computed: {
    forums() {
      return this.$store.state.site.info.attributes || {};
    }
  },
  mounted() {
    this.$emit('sendsms');
  },
  methods: {
    empty() {
      this.$refs.walletinput.deleat();
    },
    findpaypwd() {
      this.$emit('close');
      this.$emit('findpaypwd');
    }
  }
};
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
