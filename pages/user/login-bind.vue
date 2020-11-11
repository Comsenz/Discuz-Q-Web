<template>
  <div v-if="forums" v-loading="loading" class="register">
    <el-tabs v-model="activeName" type="border-card" class="register-select">
      <!-- 用户名登录 login register phone-login   -->
      <el-tab-pane :label="$t('user.loginBindWechat')" name="0">
        <form>
          <div class="bindtext">
            <div>{{ $t('user.dear') }}
              <avatar
                :user="{
                  username: nickname,
                  avatarUrl: headimgurl
                }"
                :size="20"
                :round="true"
                style="display:inline-block;
                vertical-align:text-top;"
              />
              <b>{{ nickname || '' }}</b> {{ $t('user.user') }}</div>
            <div>{{ $t('user.changeWechat') }}</div>
          </div>
          <span class="title">{{ $t('user.usrname') }}</span>
          <el-input v-model="userName" :placeholder="$t('user.username')" class="reg-input" />
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
          </div>
          <el-button type="primary" class="r-button" @click="UserLogin">{{ $t('user.loginbind') }}</el-button>
          <div class="logorreg">
            <span v-if="canReg">
              {{ $t('user.noexist') }}
              <span class="agreement_text" @click="toRegister"> {{ $t('user.registerbind') }}</span></span>
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

export default {
  mixins: [head, handleError, loginAbout],
  data() {
    return {
      title: this.$t('user.login'),
      userName: '',
      passWord: '',
      checked: true,
      activeName: '0', // 默认激活tab
      site_mode: '', // 站点模式
      isPaid: false, // 是否付费
      code: '', // 注册邀请码
      loading: false,
      canReg: false,
      ischeck: true,
      nickname: '',
      headimgurl: '',
      token: '', // 微信绑定token
      preurl: ''
    }
  },
  computed: {
    forums() {
      return this.$store.state.site.info.attributes || {}
    },
    userInfo() {
      return this.$store.state.user.info.attributes || {}
    }
  },
  mounted() {
    const { code, nickname, headimgurl, preurl } = this.$route.query
    if (preurl) {
      this.preurl = preurl
    }
    if (process.client) this.token = localStorage.getItem('wechat')
    if (nickname) {
      this.nickname = nickname
    }
    if (headimgurl) {
      this.headimgurl = headimgurl
    }
    if (code !== 'undefined') {
      this.code = code
    }
    if (this.forums && this.forums.set_site && this.forums.set_site.site_mode) {
      this.site_mode = this.forums.set_site.site_mode
    }
    if (this.forums && this.forums.set_reg && this.forums.set_reg.register_close) {
      this.canReg = true
    }
  },
  methods: {
    check(value) {
      this.ischeck = value
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
              password: this.passWord,
              token: this.token
            }
          }
        }
        this.$store.dispatch('session/h5Login', params)
          .then((res) => {
            this.loading = false
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
              res.data.errors[0].code === 'register_validate'
            ) {
              this.$router.push(`/user/warning?username=${this.userName}`)
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
            console.log(err)
          })
      }
    },
    toRegister() {
      this.$router.push(`/user/register-bind?nickname=${this.nickname}&headimgurl=${this.headimgurl}&preurl=${this.preurl}`)
    },
    iscanReg() {
      return [this.canReg ? '' : 'noreg']
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
    .bindtext{
      font-size: 16px;
      margin-bottom: 40px;
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
  }
  .agreement {
    margin-left: 70px;
    font-size: 12px;
    .agree {
      color: #6d6d6d;
      font-size: 12px;
    }
  }
  .logorreg {
    width: 300px;
    margin-top: 10px;
    margin-left: 70px;
    display: flex;
    justify-content: space-between;
    .agreement_text {
      color: $color-blue-base;
      cursor: pointer;
      margin-left: -3px;
    }
    .findpass {
      margin-left: 105px;
      color: $color-blue-base;
    }
    .noreg {
      margin-left: 240px;
    }
  }
  .otherlogin {
    font-size:50px;
    margin-top:40px;
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
::v-deep .el-checkbox__input.is-checked .el-checkbox__inner,
.el-checkbox__input.is-indeterminate .el-checkbox__inner {
  background-color: $color-blue-base;
  border-color: $color-blue-base;
}
</style>
