<template>
  <div class="register">
    <h2 class="register-title">{{ $t('user.userregister') }}</h2>
    <el-tabs
      type="border-card"
      class="register-select"
    >
      <!-- 用户名注册 -->
      <el-tab-pane :label="$t('user.userregister') ">
        <div>
          <span class="title">{{ $t('profile.username') }}</span>
          <el-input
            v-model="userName"
            :placeholder="$t('user.username')"
            class="reg-input"
          />
        </div>
        <div>
          <span class="title2">输入密码</span>
          <el-input
            v-model="passWord"
            :placeholder="$t('user.password')"
            type="password"
            class="reg-input"
            @keyup.enter.native="register"
          />
        </div>
        <!-- <div>
          <span class="title2">重复密码</span>
          <el-input
            v-model="repeatPassWord"
            :placeholder="$t('user.password')"
            type="password"
            class="reg-input"
          />
        </div> -->
        <div v-if="validate">
          <span class="title2">注册原因</span>
          <el-input
            v-model="Reason"
            :placeholder="$t('user.reason')"
            class="reg-input"
          />
        </div>

        <div class="agreement">
          <el-checkbox v-model="checked">
            <span class="agree">我已阅读并同意 </span>
            <nuxt-link
              to="agreement"
              class="agreement_text"
            >《用户服务隐私协议》</nuxt-link>
          </el-checkbox>
          <div class="logorreg">
            <span
              v-if="register"
              @click="jump2Login"
            >已有账号，立即<nuxt-link to="/user/login">{{ $t('user.login') }}</nuxt-link> </span>
          </div>
        </div>
        <el-button
          type="primary"
          class="r-button"
          @click="register"
        >{{ $t('user.register') }}</el-button>
      </el-tab-pane>
      <!-- 手机号注册 -->
      <el-tab-pane
        v-if="forums && forums.set_reg && forums.set_reg.register_type === 1"
        :label="$t('user.phoneregister')"
      >
        <span class="title2">{{ $t('user.phonenumber') }}</span>
        <el-input
          v-model="phoneNumber"
          :placeholder="$t('user.phoneNumber')"
          class="phone-input"
          maxlength="11"
          @input="changeinput"
        />

        <el-button
          class="count-b"
          :class="{disabled: !canClick}"
          @click="phoneRegister"
        >{{ content }}</el-button>

        <span class="title">{{ $t('user.verification') }}</span>
        <el-input
          v-model="verifyCode"
          :placeholder="$t('user.verificationCode')"
          class="reg-input"
        />
        <div class="agreement">
          <el-checkbox v-model="checked">
            <span class="agree">我已阅读并同意 </span>
            <nuxt-link
              to="agreement"
              class="agreement_text"
            >《用户服务隐私协议》</nuxt-link>
          </el-checkbox>
        </div>
        <el-button
          type="primary"
          class="r-button"
          @click="PhoneLogin"
        >{{ $t('user.register') }}</el-button>
      </el-tab-pane>
      <!-- 快速注册 -->
      <el-tab-pane label="快速注册">
        <div class="quick">
          <div class="quick-container">
            <div class="quick-title">
              <img
                src="@/assets/wechat.png"
                alt=""
              >
              <span>微信扫码注册</span>
            </div>

            <div class="qrcode">
              <img
                src="@/assets/qrcode.png"
                alt=""
              >

            </div>
            <span>请用微信扫一扫扫码上方二维码</span>
          </div>
          <div class="quick-container">
            <div class="quick-title">
              <img
                src="@/assets/qq.png"
                alt=""
              >
              <span>qq一键注册</span>
            </div>

            <div class="qrcode2">
              <img
                src="@/assets/qq-big.png"
                alt=""
              >

            </div>
            <span>点击用QQ号码登陆注册</span>
          </div>

        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import forums from '@/mixin/forums'
import handleError from '@/mixin/handleError'
import { status } from '@/library/jsonapi-vuex/index'
import { SITE_PAY } from '@/common/const'

const tcaptchs = process.client ? require('@/utils/tcaptcha') : ''

export default {
  name: 'Register',
  mixins: [
    forums, handleError, tcaptchs
  ],
  data() {
    return {
      userName: '',
      passWord: '',
      phoneNumber: '',
      verifyCode: '',
      Reason: '', // 注册原因
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
      randstr: '',
      checked: true,
      content: this.$t('modify.sendVerifyCode'),
      canClick: false

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
    // this.QRcode()
  },
  methods: {
    countDown(interval) {
      if (!this.canClick) return
      this.canClick = false
      this.content = interval + this.$t('modify.retransmission')
      const clock = window.setInterval(() => {
        interval--
        this.content = interval + this.$t('modify.retransmission')
        if (interval < 0) {
          window.clearInterval(clock)
          this.content = this.$t('modify.sendVerifyCode')
          // this.totalTime = 60
          this.canClick = true
        }
      }, 1000)
    },
    // 注册成功后
    logind() {
      const userId = this.$store.getters['session/get']('userId')
      if (!userId) return
      console.log('hhhhhhhhhh')
      // this.$store.dispatch('jv/get', [
      //   'forum',
      //   {
      //     params: {
      //       include: 'users',
      //     },
      //   },
      // ]);

      const params = {
        include: 'groups,wechat'
      }

      this.$store.dispatch('jv/get', [`users/${userId}`, { params }]).then(val => {
        this.user = val
        if (this.user && this.user.paid) {
          this.isPaid = this.user.paid
        }
        console.log('----this.user-----', this.user)
        if (this.site_mode !== SITE_PAY || this.isPaid) {
          this.$router.push('/')
        }
        if (this.site_mode === SITE_PAY && !this.isPaid) {
          this.$router.push('/site/info')
        }
      })
      this.$store.dispatch('forum/setError', { loading: false })
    },
    changeinput() {
      setTimeout(() => {
        this.phoneNumber = this.phoneNumber.replace(/[^\d]/g, '')
      }, 30)
      if (this.phoneNumber.length === 11) {
        this.canClick = true
      } else {
        this.canClick = false
      }
    },
    // 用户名注册
    register() {
      if (this.userName === '') {
        this.$message.error('用户名不能为空')
      } else if (this.passWord === '') {
        this.$message.error('密码不能为空')
      } else if (this.forums && this.forums.set_reg && this.forums.set_reg.register_captcha) {
        this.toTCaptcha()
      } else {
        this.registerClick()
      }
    },
    // 手机号
    phoneRegister() {
      if (this.phoneNumber === '') {
        this.$message.error('手机号不能为空')
      } else if (this.forums && this.forums.set_reg && this.forums.set_reg.register_captcha) {
        this.toTCaptcha()
      } else {
        this.sendVerifyCode()
      }
    },

    // 验证码
    toTCaptcha() {
      // #ifdef H5
      console.log('---------验证码-------')
      if (this.forums && this.forums.qcloud && this.forums.qcloud.qcloud_captcha_app_id) {
        // eslint-disable-next-line no-undef
        this.captcha = new TencentCaptcha(this.forums.qcloud.qcloud_captcha_app_id, res => {
          console.log('h5验证码', res)
          if (res.ret === 0) {
            this.ticket = res.ticket
            this.randstr = res.randstr
            if (this.forums && this.forums.set_reg && this.forums.set_reg.register_type === 1) {
              this.sendVerifyCode()
            } else {
              this.registerClick()
            }
          }
          // if (res.ret === 2) {
          //   uni.hideLoading()
          // }
        })
        // 显示验证码
        this.captcha.show()
      }
      // #endif
    },
    registerClick() {
      const params = {
        // _jv: { type: '/register' },
        // username: this.userName,
        // password: this.passWord
        data: {
          attributes: {
            username: this.userName,
            password: this.passWord
          }
        }
      }
      console.log(params)
      if (this.register_captcha && this.validate) {
        params.data.attributes.register_reason = this.Reason
        params.data.attributes.captcha_ticket = this.ticket
        params.data.attributes.captcha_rand_str = this.randstr
      }
      if (this.validate) {
        params.data.attributes.register_reason = this.Reason
      }
      if (this.register_captcha) {
        params.data.attributes.captcha_ticket = this.ticket
        params.data.attributes.captcha_rand_str = this.randstr
      }
      if (this.code !== '') {
        params.data.attributes.code = this.code
      }
      this.$store
        .dispatch('session/h5Register', params)
        .then(res => {
          console.log('注册成功', res)
          if (res && res.data && res.data.data && res.data.data.id) {
            console.log('注册成功', res)
            this.logind()
            this.$t('user.registerSuccess')
          }
          if (
            res &&
            res.data &&
            res.data.errors &&
            res.data.errors[0].status === '422'
          ) {
            this.$message.error(res.data.errors[0].detail[0])
          }
        })
        .catch(err => {
          console.log(err)
        })

      // status.run(() => this.$store.dispatch('jv/post', params)).then(res => {
      //   console.log('注册', res)
      //   if (res && res.data && res.data.data && res.data.data.id) {
      //     console.log('注册成功', res)
      //     this.logind()
      //     this.$message.success(this.$t('user.registerSuccess'))
      //   }
      // }, e => this.handleError(e))
    },
    // 手机号注册
    sendVerifyCode() {
      const params = {
        _jv: { type: 'sms/send' },
        mobile: this.phoneNumber,
        type: 'login'
      }
      status.run(() => this.$store.dispatch('jv/post', params))
        .then(res => {
          if (res.interval) this.countDown(res.interval)
        }, e => this.handleError(e))
    },
    PhoneLogin() {
      if (this.phoneNumber === '') {
        this.$message.error('手机号不能为空')
      } else if (this.verifyCode === '') {
        this.$message.error('验证码不能为空')
      } else {
        // const params = {
        //   _jv: { type: 'sms/verify' },
        //   mobile: this.phoneNumber,
        //   code: this.verifyCode,
        //   type: 'login'
        // }
        // status.run(() => this.$store.dispatch('jv/post', params))
        //   .then(res => {
        //     window.localStorage.setItem('access_token', res.access_token)
        //     this.$message.success('登录成功')
        //     this.$router.go(-1)
        //   }, e => this.handleError(e))

        const params = {
          data: {
            attributes: {
              mobile: this.phoneNumber,
              code: this.verifyCode,
              type: 'login'
            }
          }
        }
        if (this.token && this.token !== '') {
          params.data.attributes.token = this.token
        }
        if (this.code && this.code !== 'undefined') {
          params.data.attributes.inviteCode = this.code
        }
        this.$store
          .dispatch('session/verificationCodeh5Login', params)
          .then(res => {
            console.log('手机号验证成功', res)
            this.logind()
            this.$message.$t('user.loginSuccess')
          })
          .catch(err => {
            console.log(err)
          })
      }
    },
    jump2Login() {
      console.log('跳转到登录页面')
      this.$router.push(
        `/user/login?url=${this.url}&validate=${this.validate}`
      )
    }

  }
}
</script>
<style lang='scss' scoped>
//@import url(); 引入公共css类
.register {
  display: flex;
  width: 400px;
  margin-top: 62px;
  // margin-bottom: 178px;
  // height: 466px;
  // background: red;
  flex-direction: column;
  .register-title {
    width: 130px;
    height: 35px;
    font-size: 26px;
  }
  .register-select {
    display: flex;
    flex-direction: column;
    margin-top: 58px;
    border: none;
    background: transparent;
    box-shadow: none;
    .title {
      width: 66px;
      text-align: center;
      display: inline-block;
    }
    .title2 {
      margin-right: 10px;
    }
    .title:first-child {
      margin-right: 0px;
    }
    .reg-input {
      width: 300px;
      margin-bottom: 20px;
    }
    .quick {
      display: flex;
      flex-direction: row;
      align-content: space-between;
      // justify-content: center;
      // align-items: center;
      .quick-container {
        flex: 1;
        text-align: center;
        span {
          display: inline-block;
          width: 111px;
        }
      }
      .quick-title {
        margin-top: 10px;
        font-size: 14px;
        // text-align: left;
        span {
          margin-left: -10px;
          line-height: 25px;
        }
        img {
          width: 26px;
          height: 26px;
          vertical-align: middle;
        }
      }
      .qrcode {
        margin: 0 auto;
        width: 155px;
        height: 155px;
        border: 1px dashed black;
        margin-top: 26px;
      }
      .qrcode2 {
        margin: 0 auto;
        width: 155px;
        height: 155px;
        border: 1px solid #ededed;
        margin-top: 26px;
        img {
          width: 40px;
          margin: 50px;
        }
      }
    }
  }
  .agreement {
    width: 300px;
    margin-left: 70px;
    margin-top: 5px;
    font-size: 14px;
    a {
      color: #1878f3;
    }
    .logorreg {
      margin-top: 28px;
    }
    .agree {
      color: #6d6d6d;
    }
    .agreement_text {
      color: #1878f3;
    }
  }
  .r-button {
    width: 300px;
    margin-left: 70px;
    margin-top: 15px;
    background: #1878f3;
  }
  .phone-input {
    width: 209px;
    margin-bottom: 20px;
  }
  .count-b {
    width: 90px;
    height: 40px;
    // padding: 15.5px 10px;
    padding: 0;
    margin-left: -4px;
  }
  .disabled {
    background-color: #ddd;
    border-color: #ddd;
    color: #57a3f3;
    cursor: not-allowed; // 鼠标变化
  }
}
::v-deep.el-tabs {
  .el-tabs__header {
    background: transparent;
  }
  .el-tabs__header .el-tabs__item {
    border: none;
    color: #b5b5b5;
    padding: 0 45px 0 10px;
    font-size: 16px;
  }
  .el-tabs__header .el-tabs__item:last-child {
    padding-right: 0px;
    padding-left: 25px;
  }
  .el-tabs__header .el-tabs__item.is-active {
    color: black;
    background: transparent;
    border: none;
    font-weight: bold;
    font-size: 18px;
  }
  .el-tabs__nav-wrap {
    margin-bottom: 0px;
  }
  // .el-input__inner {
  //   border-radius: 0px;
  //   border-right: none;
  // }
  .el-button {
    border-radius: 0px;
  }
  .el-input__inner:focus {
    border-color: #dcdfe6;
  }
  .el-input__inner:hover {
    border-color: #dcdfe6;
  }
  //  .el-button:focus{
  //   background: #FFF;
  //   border: 1px solid #DCDFE6;
  //   color: #606266;
  // }
  //  .el-button:hover{
  //   background: #FFF;
  //   border: 1px solid #DCDFE6;
  //   color: #606266;
  // }
  //  .el-button:active{
  //   background: #FFF;
  //   border: 1px solid #DCDFE6;
  //   color: #606266;
  // }
}
</style>
