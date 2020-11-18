<template>
  <div v-if="forums" v-loading="loading" class="register">
    <el-tabs v-model="activeName" type="border-card" class="register-select">
      <!-- 用户名注册 -->
      <el-tab-pane :label="$t('user.registerBindPhone')" name="0">
        <form>
          <div class="bindtext">
            <div>{{ $t('user.phoneuser') }} <b>{{ phoneNumber }}</b> {{ $t('user.user') }}</div>
            <div>{{ $t('user.yourPhone') }}<b>{{ $t('user.withoutBind') }}</b>，<b>{{ $t('user.register') }}</b>{{ $t('user.readyBInd') }}</div>
          </div>
          <div>
            <span class="title">{{ $t('profile.username') }}</span>
            <el-input v-model="userName" :placeholder="$t('user.username')" class="reg-input" />
          </div>
          <div>
            <span class="title2">{{ $t('user.passwd') }}</span>
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
            <span class="title2">{{ $t('user.repeatpasswd') }}</span>
            <el-input
              v-model="repeatPassWord"
              :placeholder="$t('user.password')"
              type="password"
              :class="passerror ? 'reg-input inputerr':'reg-input'"
              show-password
              @input="notsame"
              @keyup.enter.native="register"
            />
            <div v-if="passerror" class="passerror">{{ $t('modify.reenter') }}</div>
          </div>
          <div v-if="validate">
            <span class="title2">{{ $t('user.registerReason') }}</span>
            <el-input
              v-model="Reason"
              :placeholder="$t('user.reason')"
              class="reg-input"
              @keyup.enter.native="register"
            />
          </div>
          <div class="agreement">
            <reg-agreement @check="check" />
          </div>
          <el-button type="primary" class="r-button" @click="register">注册并绑定</el-button>
          <div class="tologin">
            <span
              @click="jump2Login"
            >{{ $t('user.exist') }}<nuxt-link to="/user/login-bind-phone">登录并绑定</nuxt-link> </span>
          </div>
        </form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import head from '@/mixin/head'
import handleError from '@/mixin/handleError'
import loginAbout from '@/mixin/loginAbout'
const tcaptchs = process.client ? require('@/utils/tcaptcha') : ''

export default {
  mixins: [
    head, handleError, tcaptchs, loginAbout
  ],
  data() {
    return {
      title: this.$t('profile.register'),
      userName: '',
      passWord: '',
      repeatPassWord: '',
      activeName: '0', // 默认激活tab
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
      loading: false,
      passerror: false,
      mobileToken: '',
      phoneNumber: '',
      preurl: '/'
    }
  },
  computed: {
    forums() {
      return this.$store.state.site.info.attributes || {}
    }
  },
  mounted() {
    const { validate, code, phoneNumber, preurl } = this.$route.query
    if (preurl) {
      this.preurl = preurl
    }
    if (process.client) {
      this.mobileToken = localStorage.getItem('mobileToken')
    }
    if (phoneNumber) {
      this.phoneNumber = phoneNumber
    }
    if (validate) {
      this.validate = JSON.parse(validate)
    }
    if (code !== 'undefined') {
      this.code = code
    }
    if (this.forums && this.forums.set_reg && this.forums.set_reg.register_captcha) {
      this.register_captcha = this.forums.set_reg.register_captcha
    }
    if (this.forums && this.forums.set_site && this.forums.set_site.site_mode) {
      this.site_mode = this.forums.set_site.site_mode
    }

    if (this.forums && this.forums.set_reg) {
      this.validate = this.forums.set_reg.register_validate
    }
  },
  methods: {
    notsame() {
      if (this.passWord !== this.repeatPassWord) {
        this.passerror = true
      } else {
        this.passerror = false
      }
    },
    check(value) {
      this.ischeck = value
    },
    // 用户名注册
    register() {
      if (this.userName === '') {
        this.$message.error('用户名不能为空')
      } else if (this.passWord === '') {
        this.$message.error('密码不能为空')
      } else if (this.passWord !== this.repeatPassWord) {
        this.$message.error('两次输入的密码不一致,请重新输入')
        this.passWord = ''
        this.repeatPassWord = ''
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
    // 验证码
    toTCaptcha() {
      if (this.forums && this.forums.qcloud && this.forums.qcloud.qcloud_captcha_app_id) {
        // eslint-disable-next-line no-undef
        this.captcha = new TencentCaptcha(this.forums.qcloud.qcloud_captcha_app_id, (res) => {
          if (res.ret === 0) {
            this.ticket = res.ticket
            this.randstr = res.randstr
            this.registerClick()
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
            password: this.passWord,
            mobileToken: this.mobileToken
          }
        }
      }
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
        .then((res) => {
          this.loading = false
          if (res && res.data && res.data.data && res.data.data.id) {
            this.logind()
            this.$message.success(this.$t('user.registerSuccess'))
          }
          if (
            res &&
            res.data &&
            res.data.errors &&
            res.data.errors[0].code === 'register_validate'
          ) {
            // this.$message.error('帐号审核中，请等管理员审核通过')
            this.$router.push(`/user/warning?username=${this.userName}`)
            return
          }
          if (
            res &&
            res.data &&
            res.data.errors &&
            res.data.errors[0].code === 'content_banned'
          ) {
            this.$message.error('当前用户名包含禁止注册的词语')
            return
          }
          if (
            res &&
            res.data &&
            res.data.errors &&
            res.data.errors[0]
          ) {
            const error = res.data.errors[0].detail ? res.data.errors[0].detail[0] : res.data.errors[0].code
            const errorText = res.data.errors[0].detail ? res.data.errors[0].detail[0] : this.$t(`core.${error}`)
            this.$message.error(errorText)
          }
        })
        .catch((err) => {
          this.loading = false
          this.passWord = ''
          this.repeatPassWord = ''
          console.log(err)
        })
    },
    jump2Login() {
      this.$router.push(`/user/login-bind-phone?&validate=${this.validate}&code=${this.code}&phoneNumber=${this.phoneNumber}&preurl=${this.preurl}`)
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
  flex-direction: column;
  .register-title {
    height: 35px;
    font-size: 26px;
  }
  .register-select {
    display: flex;
    flex-direction: column;
    margin-top: 62px;
    border: none;
    background: transparent;
    box-shadow: none;
    .bindtext{
      font-size: 16px;
      margin-bottom: 40px;
    }
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
  }
  .agreement {
    margin-left: 70px;
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
    font-size: 26px;
    margin-bottom: 19px;
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
