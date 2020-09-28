<template>
  <div class="page-find-pwd">
    <div class="title"> {{ $t('modify.forgetPassword') }}\{{ $t('modify.retrievePassword') }}</div>
    <div class="describe"> {{ $t('modify.retrievePasswordByPhone') }}</div>
    <div class="retrieve-inputs">
      <label>
        <input
          v-model="phoneNumber"
          maxlength="11"
          type="text"
          :placeholder="$t('modify.placeEnterRegisteredPhone')"
        >
        <button
          v-if="!canCountDown"
          @click="sendVerifyCode"
        >
          {{ $t('modify.sendVerifyCode') }}
        </button>
        <button
          v-else
          :disabled="canCountDown"
          :class="{disabled: canCountDown}"
        >{{ countDownSecond + $t('modify.retransmission') }}</button>
      </label>
      <el-input
        v-model="verifyCode"
        maxlength="6"
        :placeholder="$t('modify.placeEnterCode')"
      />
      <el-input
        v-model="newPassword"
        :placeholder="$t('modify.enterNew')"
        show-password
      />
      <el-input
        v-model="newPasswordRepeat"
        :placeholder="$t('modify.resetrepeatpass')"
        show-password
        @keyup.enter.native="submit"
      />
    </div>
    <button
      class="submit"
      @click="submit"
    >{{ $t('modify.submit') }}</button>
  </div>
</template>

<script>
import { status } from '@/library/jsonapi-vuex/index'
import handleError from '@/mixin/handleError'
import tencentCaptcha from '@/mixin/tencentCaptcha'

export default {
  name: 'Findpwd',
  mixins: [
    tencentCaptcha, handleError
  ],
  data() {
    return {
      phoneNumber: '',
      isVerifyDisabled: true,
      canCountDown: false,
      countDownSecond: 60,
      loading: false,
      verifyCode: '',
      newPassword: '',
      newPasswordRepeat: '',
      username: '',
      validate: false, // 默认不开启注册审核
      code: '', // 注册邀请码
      site_mode: '', // 站点模式
      isPaid: false // 是否付费''
    }
  },
  computed: {
    forums() {
      return this.$store.state.site.info.attributes || {}
    }
  },
  mounted() {
    const { validate, register, code } = this.$route.query
    console.log('query', this.$route.query)
    if (validate) {
      this.validate = JSON.parse(validate)
    }
    if (register) {
      this.register = JSON.parse(register)
    }
    if (code !== 'undefined') {
      this.code = code
    }
    console.log('----this.forums-----', this.forums)

    if (this.forums && this.forums.set_site && this.forums.set_site.site_mode) {
      this.site_mode = this.forums.set_site.site_mode
    }
    if (this.forums && this.forums.set_reg) {
      this.validate = this.forums.set_reg.register_validate
    }
  },
  methods: {
    onInput(e) {
      this.phoneNumber = e.target.value.replace(/[^\d]/g, '')
      this.isVerifyDisabled = this.phoneNumber.length !== 11
    },
    countDown(interval) {
      this.canCountDown = true
      this.countDownSecond = interval
      const countDownInterval = setInterval(() => {
        this.countDownSecond -= 1
        if (this.countDownSecond === 0) {
          this.canCountDown = false
          clearInterval(countDownInterval)
        }
      }, 1000)
    },
    async sendVerifyCode() {
      let params = {
        _jv: { type: 'sms/send' },
        mobile: this.phoneNumber,
        type: 'reset_pwd'
      }
      params = await this.checkCaptcha(params)
      status.run(() => this.$store.dispatch('jv/post', params))
        .then(res => {
          if (res.interval) this.countDown(res.interval)
        }, e => {
          const { response:
            {
              data: { errors }
            }
          } = e
          if (errors[0]) return this.$message.error(errors[0].detail[0])
        })
    },
    submit() {
      if (this.verifyCode === '') {
        this.$message.error('验证码不能为空')
      } else if (this.newPassword === '') {
        this.$message.error('新密码不能为空')
      } else if (this.newPasswordRepeat === '') {
        this.$message.error('重复密码不能为空')
      } else if (this.newPassword !== this.newPasswordRepeat) {
        this.$message.error('二次密码输入不一致')
      } else {
        const params = {
          _jv: { type: 'sms/verify' },
          mobile: this.phoneNumber,
          code: this.verifyCode,
          password: this.newPassword,
          type: 'reset_pwd'
        }
        status.run(() => this.$store.dispatch('jv/post', params))
          .then(res => {
            if (process.client) window.localStorage.setItem('username', res.username)
            this.$router.push('/modify/resetpwdsuccess')
          }, e => this.handleError(e))
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/css/variable/color.scss";
.page-find-pwd {
  margin: 60px auto;
  width: 300px;
  .disabled {
    background-color: #ededed;
    border-color: #ddd;
    color: #b5b5b5;
    cursor: not-allowed; // 鼠标变化
  }

  > .title {
    font-weight: bold;
    color: #343434;
    font-size: 26px;
  }

  > .describe {
    color: #000;
    margin-top: 50px;
    font-size: 18px;
  }

  > .retrieve-inputs {
    margin-top: 40px;

    > .el-input {
      margin-bottom: 20px;
      color: #c0c4cc;
    }

    > label {
      width: 100%;
      height: 40px;
      display: flex;
      justify-content: space-between;
      border: 1px solid #dcdfe6;
      margin-bottom: 20px;

      > button {
        color: #000000;
        width: 90px;
        border-left: 1px solid #dcdfe6;
          &:hover{
          color:#595959;
          background-color:#e5f2ff;
        }
      }

      > input {
        flex: 1;
        border: none;
        padding: 0 16px;
        color: #606266;
      }
    }
  }

  > .submit {
    width: 100%;
    height: 40px;
    background: $color-blue-base;
    text-align: center;
    line-height: 40px;
    color: white;
    font-size: 14px;
  }
  ::v-deep.el-button {
    border-radius: 2px;
  }
  // ::v-deep.el-input__inner:focus {
  //   border-color: #dcdfe6;
  // }
  // ::v-deep.el-input__inner:hover {
  //   border-color: #dcdfe6;
  // }
  ::v-deep.el-input__inner {
    border-radius: 2px;
    // border-right: none;
  }
}
</style>
