<template>
  <div
    v-if="forums"
    v-loading="loading"
    class="register"
  >
    <h2 class="register-title">{{ $t('user.userlogin') }}</h2>
    <el-tabs
      v-model="activeName"
      type="border-card"
      class="register-select"
      @tab-click="changeActive"
    >
      <!-- 用户名登录 -->
      <el-tab-pane
        label="用户名登录"
        name="0"
      >
        <form>
          <span class="title">用户名</span>
          <el-input
            v-model="userName"
            :placeholder="$t('user.username')"
            class="reg-input"
          />
          <span class="title2">{{ $t('user.pwd') }}</span>
          <el-input
            v-model="passWord"
            :placeholder="$t('user.password')"
            type="password"
            class="reg-input"
            show-password
            @keyup.enter.native="UserLogin"
          />
          <div class="agreement">
            <el-checkbox v-model="checked" />
            <span class="agree">{{ $t('user.status') }} </span>
            <div class="logorreg">
              <span v-if="canReg">尚无帐号，立即
                <span
                  class="agreement_text"
                  @click="toRegister"
                > {{ $t('user.register') }}</span></span>
              <nuxt-link
                to="/modify/findpwd"
                :class="['findpass',iscanReg()]"
              >{{ $t('modify.findpawdtitle') }}</nuxt-link>
            </div>
          </div>
          <el-button
            type="primary"
            class="r-button"
            @click="UserLogin"
          >{{ $t('user.login') }}</el-button>
        </form>
      </el-tab-pane>
      <!-- 手机号登录 -->
      <el-tab-pane
        v-if="forums && forums.qcloud && forums.qcloud.qcloud_sms"
        :label="$t('user.phonelogin')"
        name="1"
      >
        <span class="title2">{{ $t('profile.mobile') }}</span>

        <el-input
          v-model="phoneNumber"
          :placeholder="$t('user.phoneNumber')"
          class="phone-input"
          maxlength="11"
        />

        <el-button
          class="count-b"
          :class="{disabled: !canClick}"
          size="middle"
          @click="sendVerifyCode"
        >{{ content }}</el-button>

        <span class="title3">{{ $t('user.verification') }}</span>
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
        >{{ $t('user.login') }}</el-button>
      </el-tab-pane>
      <!-- 快捷登录 -->
      <!-- <el-tab-pane
        :label="$t('user.quicklogin')"
        name="2"
      >
        <div class="quick">
          <div class="quick-container">
            <div class="quick-title">
              <img src="@/assets/wechat.png">
              <span>微信扫码登录</span>
            </div>
            <div class="qrcode">
              <img :src="wechatLogin.base64_img">
            </div>
            <span class="qrtext">请用微信扫一扫扫码上方二维码</span>
          </div>
           <div class="quick-container">
            <div class="quick-title">
              <img src="@/assets/qq.png">
              <span>qq一键登录</span>
            </div>
            <div
              class="qrcode2"
              @click="qqLogin"
            >
              <img src="@/assets/qq-big.png">
            </div>
            <span>点击用QQ号码登陆注册</span>
          </div>
        </div>
      </el-tab-pane> -->
    </el-tabs>
  </div>
</template>

<script>
import { status } from '@/library/jsonapi-vuex/index'
import handleError from '@/mixin/handleError'
import tencentCaptcha from '@/mixin/tencentCaptcha'

export default {
  name: 'Login',
  mixins: [handleError, tencentCaptcha],
  data() {
    return {
      userName: '',
      passWord: '',
      phoneNumber: '',
      checked: true,
      content: this.$t('modify.sendVerifyCode'),
      canClick: true,
      activeName: '0', // 默认激活tab
      verifyCode: '',
      info: '', // 微信二维码数据
      scene_str: '',
      loginStatus: false, // 登录状态
      register: true, // 默认展示注册链接
      validate: false, // 开启注册审核
      site_mode: '', // 站点模式
      isPaid: false, // 是否付费
      code: '', // 注册邀请码
      loading: false,
      canReg: false,
      ischeck: true,
      wechatLogin: {}, // 微信扫码登录信息
      wehcatLoginTimer: null // 微信登录定时器
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
    console.log(this.forums)
    if (this.forums && this.forums.set_site && this.forums.set_site.site_mode) {
      this.site_mode = this.forums.set_site.site_mode
    }
    if (this.forums && this.forums.set_reg && this.forums.set_reg.register_close) {
      this.canReg = true
    }
    // this.QRcode()
    // 获取配置优先的登录方式
    this.activeName = this.forums && this.forums.set_reg ? this.forums.set_reg.register_type.toString() : ''
    // 微信登录初始化
    if (this.activeName === '2' || this.forums && this.forums.qcloud && !this.forums.qcloud.qcloud_sms) {
      this.activeName = '0'
      // this.createQRcode()
    }
  },
  destroyed() {
    window.clearInterval(this.wehcatLoginTimer)
  },
  methods: {
    check(value) {
      this.ischeck = value
    },
    countDown(interval) {
      if (!this.canClick) return
      this.canClick = false
      this.content = interval + this.$t('modify.retransmission')
      const clock = setInterval(() => {
        interval--
        this.content = interval + this.$t('modify.retransmission')
        if (interval < 0) {
          clearInterval(clock)
          this.content = this.$t('modify.sendVerifyCode')
          this.canClick = true
        }
      }, 1000)
    },
    // 简单判断
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
    // tab激活
    changeActive() {
      window.clearInterval(this.wehcatLoginTimer)
      if (this.activeName === '2') {
        this.createQRcode()
      }
    },

    logind() {
      const userId = this.$store.getters['session/get']('userId')
      if (!userId) return
      console.log('hhhhhhhhhh')
      const params = {
        include: 'groups'
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
    // 用户名登录
    UserLogin() {
      this.loading = true
      if (this.userName === '') {
        this.$message.error('用户名不能为空')
        this.loading = false
      } else if (this.passWord === '') {
        this.$message.error('密码不能为空')
        this.loading = false
      } else {
        const params = {
          data: {
            attributes: {
              username: this.userName,
              password: this.passWord
            }
          }
        }
        this.$store.dispatch('session/h5Login', params)
          .then(res => {
            this.loading = false
            console.log('登录成功', res)
            if (res && res.data && res.data.data && res.data.data.id) {
              this.logind()
              this.userName = ''
              this.passWord = ''
              this.$message.success('登录成功')
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
              this.$router.push('/')
            }
          })
          .catch(err => {
            this.loading = false
            console.log(err)
          })
      }
    },
    async sendVerifyCode() {
      // this.loading = true
      let params = {
        _jv: { type: 'sms/send' },
        mobile: this.phoneNumber,
        type: 'login'
      }
      params = await this.checkCaptcha(params)
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
        if (this.code && this.code !== 'undefined') {
          params.data.attributes.inviteCode = this.code
        }
        this.$store
          .dispatch('session/verificationCodeh5Login', params)
          .then(res => {
            this.loading = false
            console.log('手机号验证成功', res)
            if (res && res.data && res.data.data && res.data.data.id) {
              this.logind()
              this.$message.success(this.$t('user.loginSuccess'))
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
              this.$router.push('/')
            }
          })
          .catch(err => {
            this.loading = false
            console.log(err)
          })
      }
    },
    // qq登录
    qqLogin() {
      const params = {
        _jv: { type: `/oauth/qq` }
      }
      this.$store.dispatch('jv/get', params).then(res => {
        console.log('qq登陆', res)
      })
    },
    toRegister() {
      this.$router.push(`/user/register?code=${this.code}`)
    },
    iscanReg() {
      return [this.canReg ? '' : 'noreg']
    },
    // PC扫码登陆-生成二维码
    createQRcode() {
      this.$store.dispatch('jv/get', `/oauth/wechat/pc/qrcode`).then(res => {
        console.log('user data => ', res)
        if (res) {
          this.wechatLogin = res
          const _this = this
          this.wehcatLoginTimer = setInterval(_this.getLoginStatus, 3000)
        }
      }, e => this.handleError(e))
    },
    // 轮询查询微信是否登录成功
    getLoginStatus() {
      if (this.wechatLogin && !this.wechatLogin.session_token) return
      this.$store.dispatch('jv/get', `/oauth/wechat/pc/login/${this.wechatLogin.session_token}`).then(res => {
        console.log('查询是否登录 ', res)
        if (res.pc_login) {
          clearInterval(this.wehcatLoginTimer)
          this.$store.commit('session/SET_USER_ID', res._jv.id)
          this.$store.commit('session/CHECK_SESSION', true)
          this.$store.commit('session/SET_ACCESS_TOKEN', res.access_token)
          this.logind()
          this.$message.success('登录成功')
        }
      }, e => {
        clearInterval(this.wehcatLoginTimer)
        this.handleError(e)
        this.createQRcode()
      })
    }
  },
  head() {
    return {
      title: this.$t('user.login')
    }
  }
}
</script>
<style lang='scss' scoped>
@import "@/assets/css/variable/color.scss";
::v-deep input::-ms-reveal {
  display: none;
}
::v-deep.disable {
  pointer-events: none;
}
.register {
  display: flex;
  width: 415px;
  margin-top: 62px;
  flex-direction: column;
  .register-title {
    // width: 130px;
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
      color: #606266;
    }
    .title2 {
      margin-right: 10px;
      // margin-right: 15px;
      // margin-left: 15px;
      color: #606266;
    }
    .title3 {
      margin-left: 12px;
      margin-right: 12px;
      color: #606266;
    }
    .title:first-child {
      margin-right: 0px;
    }
    .reg-input {
      width: 299px;
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
        margin-top: 22px;
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
    // width: 310px;
    margin-left: 70px;
    // margin-top: 5px;
    font-size: 12px;
    .findpass {
      margin-left: 105px;
      color: $color-blue-base;
    }
    .logorreg {
      width:300px;
      margin-top: 28px;
      display: flex;
      justify-content: space-between;
      .noreg {
        position: absolute;
        top: 140px;
        margin-left: 235px;
      }
    }
    .agree {
      color: #6d6d6d;
      font-size: 12px;
    }
    .agreement_text {
      color: $color-blue-base;
      cursor: pointer;
      margin-left: -3px;
    }
  }
  .r-button {
    width: 300px;
    // margin-left: 90px;
    margin-left: 70px;
    margin-top: 15px;
    background: $color-blue-base;
    transition: all 0.2s ease-out;
    &:hover {
      border: 1px solid $color-blue-deep;
      background: $color-blue-deep;
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
    // font-size: 10px;
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
  // .el-button:focus {
  //   background: #fff;
  //   border: 1px solid #dcdfe6;
  //   color: #606266;
  // }
  // .el-button:hover {
  //   background: #fff;
  //   border: 1px solid #dcdfe6;
  //   color: #606266;
  // }
  // .el-button:active {
  //   background: #fff;
  //   border: 1px solid #dcdfe6;
  //   color: #606266;
  // }
}
// ::v-deep .el-tabs__content {
//   padding: 15px 5px;
// }
::v-deep .el-tabs--border-card > .el-tabs__content {
  margin-top: 7px;
}
::v-deep .el-checkbox__input.is-checked .el-checkbox__inner,
.el-checkbox__input.is-indeterminate .el-checkbox__inner {
  background-color: $color-blue-base;
  border-color: $color-blue-base;
}
</style>
