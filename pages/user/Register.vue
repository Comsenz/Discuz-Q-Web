<template>
  <div
    v-if="forums"
    v-loading="loading"
    class="register"
  >

    <h2 class="register-title">{{ $t('user.userregister') }}</h2>
    <el-tabs
      v-model="activeName"
      type="border-card"
      class="register-select"
      @tab-click="changeactive"
    >
      <!-- 用户名注册 -->
      <el-tab-pane
        label="用户名注册"
        name="0"
      >
        <form>
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
              show-password
              @keyup.enter.native="register"
            />
          </div>
          <div :class="passerror ?'rep passerr':'rep'">
            <span class="title2">重复密码</span>
            <el-input
              v-model="repeatPassWord"
              :placeholder="$t('user.password')"
              type="password"
              :class="passerror ? 'reg-input inputerr':'reg-input'"
              show-password
              @keyup.enter.native="register"
            />
            <div
              v-if="passerror"
              class="passerror"
            >{{ $t('modify.reenter') }}</div>
          </div>
          <div v-if="validate">
            <span class="title2">注册原因</span>
            <el-input
              v-model="Reason"
              :placeholder="$t('user.reason')"
              class="reg-input"
              @keyup.enter.native="register"
            />
          </div>

          <div class="agreement">
            <!-- <el-checkbox v-model="checked" /> -->
            <reg-agreement @check="check" />
            <!-- <div class="logorreg">
              <span
                v-if="register"
                @click="jump2Login"
              >已有帐号，立即<nuxt-link to="/user/login">{{ $t('user.login') }}</nuxt-link> </span>
            </div> -->
          </div>
          <el-button
            type="primary"
            class="r-button"
            @click="register"
          >{{ $t('user.register') }}</el-button>
          <div class="tologin">
            <span
              v-if="register"
              @click="jump2Login"
            >已有帐号，立即<nuxt-link to="/user/login">{{ $t('user.login') }}</nuxt-link> </span>
          </div>
        </form>

      </el-tab-pane>
      <!-- 手机号注册 -->
      <el-tab-pane
        :label="$t('user.phoneregister')"
        name="1"
      >
        <span class="title2">{{ $t('user.phonenumber') }}</span>
        <el-input
          v-model="phoneNumber"
          :placeholder="$t('user.phoneNumber')"
          class="phone-input"
          maxlength="11"
        />

        <el-button
          class="count-b"
          :class="{disabled: !canClick}"
          :disabled="!canClick"
          @click="phoneRegister"
        >{{ content }}</el-button>

        <span class="title">{{ $t('user.verification') }}</span>
        <el-input
          v-model="verifyCode"
          :placeholder="$t('user.verificationCode')"
          class="reg-input"
          @keyup.enter.native="PhoneLogin"
        />
        <div class="agreement">
          <!-- <el-checkbox v-model="checked" /> -->
          <reg-agreement @check="check" />
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
              <img src="@/assets/wechat.png">
              <span>微信扫码注册</span>
            </div>
            <div class="qrcode">
              <img :src="info.img">
            </div>
            <span class="qrtext">请用微信扫一扫扫码上方二维码</span>
          </div>
          <!-- <div class="quick-container">
            <div class="quick-title">
              <img src="@/assets/qq.png">
              <span>qq一键注册</span>
            </div>
            <div class="qrcode2">
              <img src="@/assets/qq-big.png">
            </div>
            <span>点击用QQ号码登陆注册</span>
          </div> -->
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import handleError from '@/mixin/handleError'
import { status } from '@/library/jsonapi-vuex/index'

const tcaptchs = process.client ? require('@/utils/tcaptcha') : ''
let QuickLogin = null
export default {
  name: 'Register',
  mixins: [
    handleError, tcaptchs
  ],
  data() {
    return {
      userName: '',
      passWord: '',
      repeatPassWord: '',
      phoneNumber: '',
      verifyCode: '',
      activeName: '0', // 默认激活tab
      info: '', // 微信二维码数据
      Reason: '', // 注册原因
      validate: false, // 默认不开启注册审核
      code: '', // 注册邀请码
      register_captcha: false, // 默认不开启注册验证码
      site_mode: '', // 站点模式
      isPaid: false, // 是否付费
      captcha: null, // 腾讯云验证码实例
      ticket: '',
      randstr: '',
      ischeck: true,
      content: this.$t('modify.sendVerifyCode'),
      canClick: true,
      loading: false,
      passerror: false,
      loginStatus: false

    }
  },
  computed: {
    forums() {
      return this.$store.state.site.info.attributes || {}
    }
  },
  mounted() {
    const { validate, register, code } = this.$route.query
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
    if (this.forums && this.forums.set_reg && this.forums.set_reg.register_captcha) {
      this.register_captcha = this.forums.set_reg.register_captcha
    }
    if (this.forums && this.forums.set_site && this.forums.set_site.site_mode) {
      this.site_mode = this.forums.set_site.site_mode
    }

    if (this.forums && this.forums.set_reg) {
      this.validate = this.forums.set_reg.register_validate
    }
    this.QRcode()
    this.changeactive()
  },
  destroyed() {
    clearInterval(QuickLogin)
  },
  methods: {
    check(value) {
      this.ischeck = value
    },
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
      const params = {
        include: 'groups,wechat'
      }
      // 登录成功重新获取一下站点信息
      this.$store.dispatch('site/getSiteInfo')
      this.$store.dispatch('jv/get', [`users/${userId}`, { params }]).then(val => {
        this.user = val
        if (this.user && this.user.paid) {
          this.isPaid = this.user.paid
        }
        console.log('----this.user-----', this.user)
        if (this.site_mode !== 'pay' || this.isPaid) {
          this.$router.push('/')
        }
        if (this.site_mode === 'pay' && !this.isPaid) {
          this.$router.push('/site/info')
        }
      })
    },
    // tab激活
    changeactive() {
      // if (this.activeName === '2') {
      //   this.QRcode()
      // }
      this.activeName = this.forums ? this.forums.set_reg.register_type.toString() : ''
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
      } else if (this.passWord !== this.repeatPassWord) {
        this.$message.error('两次输入的密码不一致,请重新输入')
        this.passerror = true
      } else if (!this.ischeck) {
        this.$message.error('请同意协议')
      } else if (this.forums && this.forums.set_reg && this.forums.set_reg.register_captcha) {
        if (this.validate && this.Reason === '') {
          this.$message.error('注册原因不能为空')
        } else {
          this.toTCaptcha()
        }
      } else {
        this.registerClick()
      }
    },
    // 手机号
    phoneRegister() {
      if (this.phoneNumber === '') {
        this.$message.error('手机号不能为空')
      } else if (this.forums && this.forums.qcloud && this.forums.qcloud.qcloud_captcha) {
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
            if (this.passWord) {
              this.registerClick()
            } else {
              this.sendVerifyCode()
            }
          }
        })
        // 显示验证码
        this.captcha.show()
      }
    },
    // 用户名注册
    registerClick() {
      this.loading = true
      const params = {
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
          this.loading = false
          if (res && res.data && res.data.data && res.data.data.id) {
            console.log('注册成功', res)
            this.logind()
            this.$message.success(this.$t('user.registerSuccess'))
          }
          if (
            res &&
            res.data &&
            res.data.errors &&
            res.data.errors[0]
          ) {
            const error = res.data.errors[0].detail ? res.data.errors[0].detail[0] : res.data.errors[0].code
            const errorText = res.data.errors[0].detail ? res.data.errors[0].detail[0] : this.$t(`core.${error}`)
            console.log('error', error)
            this.$message.error(errorText)
          }
          if (
            res &&
            res.data &&
            res.data.errors &&
            res.data.errors[0].code === 'register_validate'
          ) {
            this.$message.error('帐号审核中，请等管理员审核通过')
            this.$router.push(`/user/warning?username=${this.userName}`)
          }
        })
        .catch(err => {
          this.loading = false
          console.log(err)
        })
    },
    // 手机号注册
    sendVerifyCode() {
      const params = {
        _jv: { type: 'sms/send' },
        mobile: this.phoneNumber,
        type: 'login'
      }

      if (this.forums && this.forums.qcloud && this.forums.qcloud.qcloud_captcha_app_id) {
        params.captcha_rand_str = this.randstr
        params.captcha_ticket = this.ticket
      }
      status.run(() => this.$store.dispatch('jv/post', params))
        .then(res => {
          if (res.interval) this.countDown(res.interval)
        }, e => this.handleError(e))
    },
    PhoneLogin() {
      this.loading = true
      if (this.phoneNumber === '') {
        this.$message.error('手机号不能为空')
        this.loading = false
      } else if (this.verifyCode === '') {
        this.$message.error('验证码不能为空')
        this.loading = false
      } else if (!this.ischeck) {
        this.$message.error('请同意协议')
        this.loading = false
      } else {
        const params = {
          data: {
            attributes: {
              mobile: this.phoneNumber,
              code: this.verifyCode,
              type: 'login'
            }
          }
        }
        if (this.register_captcha && this.validate) {
          params.data.attributes.register_reason = this.reason
          params.data.attributes.captcha_ticket = this.ticket
          params.data.attributes.captcha_rand_str = this.randstr
        }
        if (this.validate) {
          params.data.attributes.register_reason = this.reason
        }
        if (this.register_captcha) {
          params.data.attributes.captcha_ticket = this.ticket
          params.data.attributes.captcha_rand_str = this.randstr
        }
        if (this.code && this.code !== 'undefined') {
          params.data.attributes.inviteCode = this.code
        }
        this.$store
          .dispatch('session/verificationCodeh5Login', params)
          .then(res => {
            this.loading = false
            console.log('手机号验证成功', res)
            if (res && res.data && res.data.data && res.data.data.id) {
              console.log('注册成功', res)
              this.logind()
              this.$message.success(this.$t('user.registerSuccess'))
            }
            if (
              res &&
              res.data &&
              res.data.errors &&
              res.data.errors[0]
            ) {
              const error = res.data.errors[0].detail ? res.data.errors[0].detail[0] : res.data.errors[0].code
              const errorText = res.data.errors[0].detail ? res.data.errors[0].detail[0] : this.$t(`core.${error}`)
              console.log('error', error)
              this.$message.error(errorText)
            }
            if (
              res &&
              res.data &&
              res.data.errors &&
              res.data.errors[0].code === 'register_validate'
            ) {
              this.$message.error('帐号审核中，请等管理员审核通过')
              this.$router.push(`/user/warning?username=${this.phoneNumber}`)
            }
          })
          .catch(err => {
            this.loading = false
            console.log(err)
          })
      }
    },
    // 微信二维码
    QRcode() {
      const _params = {
        _jv: {
          type: '/oauth/wechat/web/user'
        }
      }
      this.$store.dispatch('jv/get', _params).then(data => {
        // console.log('user data => ', data)
        if (data) {
          this.info = data
          this.scene_str = data.scene_str
          console.log(this.scene_str)
          QuickLogin = setInterval(() => {
            if (this.loginStatus) {
              clearInterval(QuickLogin)
              return
            }
            this.getLoginStatus(this.scene_str)
          }, 10000)
        }
      })
    },
    // 微信扫码登录状态
    getLoginStatus(scene_str) {
      const params = {
        _jv: {
          type: `oauth/wechat/web/user/search`
        },
        scene_str: scene_str
      }
      console.log(params)
      this.$store.dispatch('jv/get', `/oauth/wechat/web/user/search?scene_str=${scene_str}`).then(data => {
        console.log('user data => ', data)
        if (data.id) {
          this.loginStatus = true
        }
      })
    },
    jump2Login() {
      console.log('跳转到登录页面')
      this.$router.push(
        `/user/login?&validate=${this.validate}`
      )
    }
  },
  head() {
    return {
      title: this.$t('profile.register')
    }
  }
}
</script>
<style lang='scss' scoped>
@import "@/assets/css/variable/color.scss";
::v-deep input::-ms-reveal {
  display: none;
}
.register {
  display: flex;
  width: 415px;
  margin-top: 62px;
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
    .rep {
      position: relative;
      .passerror {
        position: absolute;
        bottom: 0px;
        left: 85px;
        color: #fa5151;
      }
    }
    .passerr {
      height: 66px;
      margin-bottom: 10px;
    }
    .title {
      width: 66px;
      text-align: center;
      display: inline-block;
      color: #606266;
    }
    .title2 {
      margin-right: 10px;
      color: #606266;
    }
    .title:first-child {
      margin-right: 0px;
    }
    .reg-input {
      width: 299px;
      margin-bottom: 20px;
    }
    .inputerr {
      ::v-deep .el-input__inner {
        border: 1px solid #fa5151;
        color: #fa5151;
      }
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
        .qrtext {
          margin-top: 5px;
        }
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
        img {
          width: 100%;
        }
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
    /* width: 310px; */
    margin-left: 70px;
    /* margin-top: 5px; */
    font-size: 12px;
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
  .tologin {
    margin-left: 70px;
    font-size: 12px;
    margin-bottom: 160px;
    margin-top: 10px;
    a {
      color: $color-blue-base;
    }
  }
  .phone-input {
    width: 209px;
    margin-bottom: 20px;
    ::v-deep.el-input__inner {
      border-right: none;
    }
    ::v-deep.el-input__inner:focus {
      border-color: #dcdfe6;
    }
  }
  .count-b {
    width: 90px;
    height: 40px;
    // padding: 15.5px 10px;
    color: #000000;
    padding: 0;
    margin-left: -4px;
  }
  .disabled {
    background-color: #ededed;
    border-color: #ddd;
    color: #b5b5b5;
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
    margin-bottom: 6px;
    transition: none;
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
  .el-tabs__header .el-tabs__item:hover {
    color: $color-blue-deep;
  }
  .el-tabs__nav-wrap {
    margin-bottom: 0px;
  }
  .el-input__inner {
    border-radius: 2px;
    // border-right: none;
  }
  .el-button {
    border-radius: 2px;
  }
  // .el-input__inner:focus {
  //   border-color: #dcdfe6;
  // }
  // .el-input__inner:hover {
  //   border-color: #dcdfe6;
  // }
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
::v-deep .el-tabs--border-card > .el-tabs__content {
  margin-top: 7px;
}
::v-deep .el-checkbox__input.is-checked .el-checkbox__inner,
.el-checkbox__input.is-indeterminate .el-checkbox__inner {
  background-color: $color-blue-base;
  border-color: $color-blue-base;
}
</style>
