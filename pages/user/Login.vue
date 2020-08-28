<template>
  <div
    v-loading="loading"
    class="register"
  >
    <h2 class="register-title">{{ $t('user.userlogin') }}</h2>
    <el-tabs
      v-model="activeName"
      type="border-card"
      class="register-select"
      @tab-click="changeactive"
    >
      <!-- 用户名登录 -->
      <el-tab-pane
        :label="$t('user.userlogin')"
        name="0"
      >
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
          @keyup.enter.native="UserLogin"
        />
        <div class="agreement">
          <el-checkbox v-model="checked">
            <span class="agree">{{ $t('user.status') }} </span>
          </el-checkbox>
          <div class="logorreg">
            <span v-if="register">尚无账号，立即<nuxt-link to="/user/register">{{ $t('user.register') }}</nuxt-link></span>
            <nuxt-link
              to="/modify/findpwd"
              class="findpass"
            >{{ $t('modify.findpawdtitle') }}</nuxt-link>
          </div>
        </div>
        <el-button
          type="primary"
          class="r-button"
          @click="UserLogin"
        >{{ $t('user.login') }}</el-button>
      </el-tab-pane>
      <!-- 手机号登录 -->
      <el-tab-pane
        :label="$t('user.phonelogin')"
        name="1"
      >
        <span class="title2">{{ $t('profile.mobile') }}</span>

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
          size="middle"
          @click="phoneRegister"
        >{{ content }}</el-button>

        <span class="title3">{{ $t('user.verification') }}</span>
        <el-input
          v-model="verifyCode"
          :placeholder="$t('user.verificationCodeLogin')"
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
        >{{ $t('user.login') }}</el-button>
      </el-tab-pane>
      <!-- 快捷登录 -->
      <el-tab-pane
        :label="$t('user.quicklogin')"
        name="2"
      >
        <div class="quick">
          <div class="quick-container">
            <div class="quick-title">
              <img
                src="@/assets/wechat.png"
                alt=""
              >
              <span>微信扫码登录</span>
            </div>

            <div class="qrcode">
              <img
                :src="info.img"
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
              <span>qq一键登录</span>
            </div>

            <div
              class="qrcode2"
              @click="qqLogin"
            >
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
import { status } from '@/library/jsonapi-vuex/index'
// import forums from '@/mixin/forums'
import handleError from '@/mixin/handleError'
import { SITE_PAY } from '@/common/const'

const tcaptchs = process.client ? require('@/utils/tcaptcha') : ''

// let QuickLogin = null
export default {
  name: 'Login',
  mixins: [handleError, tcaptchs],
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
      userName: '',
      passWord: '',
      phoneNumber: '',
      forums: '',
      checked: true,
      content: this.$t('modify.sendVerifyCode'),
      canClick: false,
      activeName: '0', // 默认激活tab
      verifyCode: '',
      canClickNum: false,
      info: '', // 微信二维码数据
      scene_str: '',
      loginStatus: false, // 登录状态
      register: true, // 默认展示注册链接
      validate: false, // 开启注册审核
      site_mode: '', // 站点模式
      isPaid: false, // 是否付费
      qcloud_sms: false, // 默认不开启短信功能
      code: '', // 注册邀请码
      token: '', // token,
      loading: false

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
    if (this.forums && this.forums.set_site && this.forums.set_site.site_mode) {
      this.site_mode = this.forums.set_site.site_mode
    }
    if (this.forums && this.forums.qcloud) {
      this.qcloud_sms = this.forums.qcloud.qcloud_sms
    }
    console.log(this.forums)
    this.QRcode()
    this.changeactive()
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
    changeactive() {
      this.activeName = this.forums ? this.forums.set_reg.register_type.toString() : ''
      this.canClickNum = this.activeName !== '1'
      console.log(this.canClickNum)
    },
    // 用户名登录
    UserLogin() {
      this.loading = true
      if (this.username === '') {
        this.$message.error('用户名不能为空')
      } else if (this.password === '') {
        this.$message.error('密码不能为空')
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
              res.data.errors[0].status === '422'
            ) {
              this.$message.error(
                res.data.errors[0].detail[0]
              )
            }
            if (
              res &&
              res.data &&
              res.data.errors &&
              res.data.errors[0].code === 'register_validate'
            ) {
              this.$message.error('账号审核中，请等管理员审核通过')
              this.$router.push('/')
            }
            this.$message.error(
              res.data.errors[0].detail[0]
            )
          })
          .catch(err => {
            console.log(err)
          })
      }
    },
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
            }
          }
        })
        // 显示验证码
        this.captcha.show()
      }
      // #endif
    },
    sendVerifyCode() {
      // this.loading = true
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
    // 微信二维码
    QRcode() {
      const _params = {
        _jv: {
          type: 'oauth/wechat/web/user'
        }
      }
      this.$store.dispatch('jv/get', _params).then(data => {
        // console.log('user data => ', data)
        if (data) {
          this.info = data
          this.scene_str = data.scene_str
          console.log(this.scene_str)
          // QuickLogin = setInterval(() => {
          //   if (this.loginStatus) {
          //     clearInterval(QuickLogin)
          //     return
          //   }
          //   this.getLoginStatus(this.scene_str)
          // }, 3000)
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
      this.$store.dispatch('jv/get', `oauth/wechat/web/user/search?scene_str=${scene_str}`).then(data => {
        console.log('user data => ', data)
      })
    },
    // qq登录
    qqLogin() {
      const params = {
        _jv: { type: `/oauth/qq` }
      }
      this.$store.dispatch('jv/get', params).then(res => {
        console.log('qq登陆', res)
      })
    }

  }
}
</script>
<style lang='scss' scoped>
//@import url(); 引入公共css类
::v-deep.disable {
  pointer-events: none;
}
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
      // margin-right: 15px;
      // margin-left: 15px;
    }
    .title3 {
      margin-left: 12px;
      margin-right: 12px;
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
    // margin-left: 90px;
    margin-left: 70px;
    margin-top: 5px;
    font-size: 14px;
    a {
      color: #1878f3;
    }
    .findpass {
      float: right;
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
    // margin-left: 90px;
    margin-left: 70px;
    margin-top: 15px;
    background: #1878f3;
  }
  .phone-input {
    width: 209px;
    margin-bottom: 20px;
    ::v-deep.el-input__inner {
      border-right: none;
    }
  }
  .count-b {
    width: 90px;
    height: 40px;
    // padding: 15.5px 10px;
    padding: 0;
    margin-left: -4px;
    // font-size: 10px;
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
  .el-input__inner {
    border-radius: 0px;
  }
  .el-button {
    border-radius: 0px;
  }
  .el-input__inner:focus {
    border-color: #dcdfe6;
  }
  .el-input__inner:hover {
    border-color: #dcdfe6;
  }
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
</style>
