<template>
  <div class="page-find-pwd">
    <div class="title"> {{ $t('modify.forgetPassword') }}\{{ $t('modify.retrievePassword') }}</div>
    <div class="describe"> {{ $t('modify.retrievePasswordByPhone') }}</div>
    <div class="retrieve-inputs">
      <label>
        <input
          maxlength="11"
          type="text"
          :placeholder="$t('modify.placeEnterRegisteredPhone')"
          @input="onInput"
        >
        <button
          v-if="!canCountDown"
          :disabled="isVerifyDisabled"
          :class="{disabled: isVerifyDisabled}"
          @click="sendverify"
        >
          {{ $t('modify.sendVerifyCode') }}
        </button>
        <button
          v-else
          disabled
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
        :placeholder="$t('modify.enterNewRepeat')"
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

const tcaptchs = process.client ? require('@/utils/tcaptcha') : ''
export default {
  name: 'Findpwd',
  // middleware: 'auth',
  // meta: {
  //   requiresAuth: true
  // },
  mixins: [
    tcaptchs, handleError
  ],
  async asyncData({ params, store }) {
    const _params = {
      _jv: {
        type: 'forum'
      }
    }

    const data = await store.dispatch('jv/get', _params)
    // console.log('asyncData =>', data)
    return { forums: data }
  },
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
      forums: '',
      url: '', // 上一个页面的路径
      validate: false, // 默认不开启注册审核
      code: '', // 注册邀请码
      register_captcha: false, // 默认不开启注册验证码
      site_mode: '', // 站点模式
      isPaid: false, // 是否付费
      captcha: null, // 腾讯云验证码实例
      captcha_ticket: '', // 腾讯云验证码返回票据
      captcha_rand_str: '', // 腾讯云验证码返回随机字符串
      ticket: '',
      randstr: ''
    }
  },
  mounted() {
    const { url, validate, register, token, code } = this.$route.query
    console.log('query', this.$route.query)
    if (url) {
      this.url = url
    }
    if (validate) {
      this.validate = JSON.parse(validate)
    }
    if (register) {
      this.register = JSON.parse(register)
    }
    if (code !== 'undefined') {
      this.code = code
    }
    if (token) {
      this.token = token
    }
    console.log('----this.forums-----', this.forums)
    if (this.forums && this.forums.set_reg && this.forums.set_reg.register_captcha) {
      this.register_captcha = this.forums.set_reg.register_captcha
      console.log(this.register_captcha)
    }
    if (this.forums && this.forums.set_site && this.forums.set_site.site_mode) {
      this.site_mode = this.forums.set_site.site_mode
    }
    if (this.forums && this.forums.qcloud) {
      this.qcloud_sms = this.forums.qcloud.qcloud_sms
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
      const params = {
        _jv: { type: 'sms/send' },
        mobile: this.phoneNumber,
        type: 'reset_pwd'
      }
      if (this.forums && this.forums.qcloud && this.forums.qcloud.qcloud_captcha_app_id) {
        params.captcha_rand_str = this.randstr
        params.captcha_ticket = this.ticket
      }
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
        if (this.register_captcha) {
          params.captcha_ticket = this.ticket
          params.captcha_rand_str = this.randstr
        }
        status.run(() => this.$store.dispatch('jv/post', params))
          .then(res => {
            if (process.client) window.localStorage.setItem('username', res.username)
            this.$router.push('/modify/resetpwdsuccess')
          }, e => this.handleError(e))
      }
    },
    sendverify() {
      if (this.forums && this.forums.qcloud && this.forums.qcloud.qcloud_captcha) {
        this.toTCaptcha()
      } else {
        this.sendVerifyCode()
      }
    },
    // 验证码
    toTCaptcha() {
      console.log('---------验证码-------')
      if (this.forums && this.forums.qcloud && this.forums.qcloud.qcloud_captcha_app_id) {
        // eslint-disable-next-line no-undef
        this.captcha = new TencentCaptcha(this.forums.qcloud.qcloud_captcha_app_id, res => {
          console.log('h5验证码', res)
          if (res.ret === 0) {
            this.ticket = res.ticket
            this.randstr = res.randstr
            this.sendVerifyCode()
          }
        })
        // 显示验证码
        this.captcha.show()
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
    background-color: #EDEDED;
    border-color: #ddd;
    color: #57a3f3;
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
        color: $color-blue-base;
        width: 90px;
        border-left: 1px solid #dcdfe6;
      }

      > input {
        flex: 1;
        border: none;
        padding: 0 16px;
        color: #c0c4cc;
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
    border-radius: 0px;
  }
  ::v-deep.el-input__inner:focus {
    border-color: #dcdfe6;
  }
  ::v-deep.el-input__inner:hover {
    border-color: #dcdfe6;
  }
  ::v-deep.el-input__inner {
    border-radius: 0px;
    // border-right: none;
  }
}
</style>
