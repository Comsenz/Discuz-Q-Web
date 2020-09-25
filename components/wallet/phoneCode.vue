<template>
  <message
    :title="$t('profile.editpaypassword')"
    @close="$emit('close')"
  >
    <div class="container">
      <div class="block show-amount">
        <div class="title">{{ $t('modify.editphonecode')+mobile+$t('user.verification') }}</div>
        <div class="amount">
          <span>{{ $t('modify.editphonewordtip') }}</span>
        </div>
      </div>
      <div class="block input-password">
        <walletpass-input
          :error="error"
          @password="password => $emit('password', password)"
        />
        <div
          v-if="error"
          class="amount"
        >{{ $t('core.sms_verify_error') }}</div>
      </div>
    </div>
  </message>
</template>

<script>
import { status } from '@/library/jsonapi-vuex/index'
import handleError from '@/mixin/handleError'
import tencentCaptcha from '@/mixin/tencentCaptcha'
export default {
  name: 'Phonecode',
  mixins: [
    tencentCaptcha, handleError
  ],
  props: {
    price: {
      type: [Number, String],
      default: ''
    },
    error: {
      type: Boolean,
      default: false
    },
    mobile: {
      type: String,
      default: ''
    },
    phonenum: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      userId: this.$store.getters['session/get']('userId') // 获取当前登陆用户的ID
    }
  },
  mounted() {
    console.log(this.mobile)
    console.log(this.phonenum)
  },
  methods: {
    async sendCode() {
      let params = {
        _jv: { type: 'sms/send' },
        mobile: this.phonenum,
        type: 'reset_pay_pwd'
      }
      params = await this.checkCaptcha(params)
      status.run(() => this.$store.dispatch('jv/post', params))
        .then(res => {
          // if (res.interval) this.countDown(res.interval)
        }, e => {
          const { response:
            {
              data: { errors }
            }
          } = e
          if (errors[0]) return this.$message.error(errors[0].detail[0])
        })
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
