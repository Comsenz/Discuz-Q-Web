<template>
  <div v-if="forums" v-loading="loading" class="register">
    <el-tabs v-model="activeName" type="border-card" class="register-select">
      <!-- 手机号登录/注册 -->
      <el-tab-pane v-if="forums && forums.qcloud && forums.qcloud.qcloud_sms" :label="$t('user.phonelogin')+'/注册'" name="0">
        <span class="title2">{{ $t('profile.mobile') }}</span>
        <el-input v-model="phoneNumber" :placeholder="$t('user.phoneNumber')" class="phone-input" maxlength="11" />
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
        <div class="agreement"><reg-agreement @check="check" /></div>
        <el-button type="primary" class="r-button" @click="PhoneLogin">{{ $t('user.login') }}</el-button>
        <div class="otherlogin">
          <svg-icon v-if="forums && forums.passport && forums.passport.oplatform_close" class="wechat-icon" type="wechatlogin" @click="toWechat" />
          <svg-icon class="wechat-icon" type="userlogin" @click="toUserlogin" />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { status } from '@/library/jsonapi-vuex/index'
import handleError from '@/mixin/handleError'
import tencentCaptcha from '@/mixin/tencentCaptcha'
import countDown from '@/mixin/countDown'
import loginAbout from '@/mixin/loginAbout'

export default {
  mixins: [handleError, tencentCaptcha, countDown, loginAbout],
  data() {
    return {
      phoneNumber: '',
      content: this.$t('modify.sendVerifyCode'),
      activeName: '0', // 默认激活tab
      verifyCode: '',
      code: '', // 注册邀请码
      site_mode: '', // 站点模式
      isPaid: false, // 是否付费
      canClick: true,
      ischeck: true,
      loading: false
    }
  },
  computed: {
    forums() {
      return this.$store.state.site.info.attributes || {}
    }
  },
  mounted() {
    const { code } = this.$route.query
    if (code !== 'undefined') {
      this.code = code
    }
    if (this.forums && this.forums.set_site && this.forums.set_site.site_mode) {
      this.site_mode = this.forums.set_site.site_mode
    }
  },
  methods: {
    check(value) {
      this.ischeck = value
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
    async sendVerifyCode() {
      let params = {
        _jv: { type: 'sms/send' },
        mobile: this.phoneNumber,
        type: 'login'
      }
      params = await this.checkCaptcha(params)
      status.run(() => this.$store.dispatch('jv/post', params))
        .then((res) => {
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
          .then((res) => {
            this.loading = false
            if (res && res.data && res.data.data && res.data.data.id) {
              this.logind()
              this.$message.success(this.$t('user.loginSuccess'))
            }
            if (
              res &&
              res.data &&
              res.data.errors &&
              res.data.errors[0].code === 'no_bind_user'
            ) {
              this.$router.push(`/pages/user/register-bind-phone?mobileToken=${res.data.errors[0].token}&phoneNumber=${this.phoneNumber}`)
              return
            }
            if (
              res &&
              res.data &&
              res.data.errors &&
              res.data.errors[0].code === 'register_validate'
            ) {
              this.$router.push(`/pages/user/warning?username=${this.phoneNumber}`)
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
            this.handleError(err)
          })
      }
    },
    toWechat() {
      this.$router.push(`/pages/user/wechat?code=${this.code}`)
    },
    toUserlogin() {
      this.$router.push(`/pages/user/login?code=${this.code}`)
    }
  },
  head() {
    return {
      title: '手机号登录/注册'
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
    .title2 {
      margin-right: 10px;
      color: #606266;
    }
    .title3 {
      margin-left: 12px;
      margin-right: 12px;
      color: #606266;
    }
    .reg-input {
      width: 299px;
      margin-bottom: 20px;
    }
  }
  .agreement {
    margin-left: 70px;
    font-size: 12px;
    .agree {
      color: #6d6d6d;
      font-size: 12px;
    }
  }
  .otherlogin {
    font-size:50px;
    margin-top:30px;
    margin-left: 70px;
    .wechat-icon {
      cursor: pointer;
    }
    .phone-icon {
      cursor: pointer;
    }
  }
  .r-button {
    width: 300px;
    margin-left: 70px;
    margin-top: 29px;
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
      border-bottom-right-radius: 0px;
      border-top-right-radius: 0px;
    }
    ::v-deep.el-input__inner:focus {
      border-color: #dcdfe6;
    }
  }
  .count-b {
    width: 90px;
    height: 40px;
    color: #000000;
    padding: 0;
    margin-left: -4px;
    border-bottom-left-radius: 0px !important;
    border-top-left-radius: 0px !important;
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
</style>
