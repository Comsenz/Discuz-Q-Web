<template>
  <div class="register">
    <h2 class="register-title">{{ $t('user.userlogin') }}</h2>
    <el-tabs
      type="border-card"
      class="register-select"
    >
      <!-- 用户名登录 -->
      <el-tab-pane :label="$t('user.userlogin')">
        <span class="title">用户名/邮箱</span>
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
            <span>尚无账号，立即<nuxt-link to="/user/register">{{ $t('user.register') }}</nuxt-link></span>
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
      <el-tab-pane :label="$t('user.phonelogin')">
        <span class="title2">{{ $t('profile.mobile') }}</span>

        <el-input
          v-model="phoneNumber"
          :placeholder="$t('user.phoneNumber')"
          class="phone-input"
        />

        <el-button
          class="count-b"
          :class="{disabled: !canClick}"
          size="middle"
          @click="sendVerifyCode"
        >{{ content }}</el-button>

        <!-- <div class="retrieve-inputs">
          <label>
            <input
              v-model="phoneNumber"
              maxlength="11"
              type="text"
              :placeholder="$t('user.phoneNumber')"
            >
            <button
              :class="{disabled: !canClick}"
              @click="sendVerifyCode"
            >
              {{ content }}
            </button>
          </label>
        </div> -->

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
      <el-tab-pane :label="$t('user.quicklogin')">
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
import { status } from '@/library/jsonapi-vuex/index'
export default {
  name: 'Login',
  data() {
    return {
      userName: '',
      passWord: '',
      phoneNumber: '',
      Reason: '',
      checked: true,
      content: '获取验证码',
      canClick: true,
      verifyCode: '',
      info: '',
      scene_str: ''

    }
  },
  mounted() {
    this.QRcode()
  },
  methods: {
    countDown(interval) {
      if (!this.canClick) return
      this.canClick = false
      this.content = interval + 's后重发'
      const clock = window.setInterval(() => {
        interval--
        this.content = interval + 's后发送'
        if (interval < 0) {
          window.clearInterval(clock)
          this.content = '重发验证码'
          // this.totalTime = 60
          this.canClick = true
        }
      }, 1000)
    },
    async UserLogin() {
      console.log(this.userName)
      console.log(this.passWord)
      const params = {
        _jv: { type: '/login' },
        username: this.userName,
        password: this.passWord
      }
      await status.run(() => this.$store.dispatch('jv/post', params))
        .then(res => {
          console.log(res)
          if (res.access_token !== '') {
            this.userName = ''
            this.passWord = ''
            window.localStorage.setItem('access_token', res.access_token)
            this.$message.success('登录成功')
            // 先存参考session.js和api-request
            // const setUserInfoStore = (context, results, resolve) => {
            //   const resData = utils.jsonapiToNorm(results.data.data);
            //   context.commit(SET_USER_ID, resData._jv.id);
            //   context.commit(CHECK_SESSION, true);
            //   context.commit(SET_ACCESS_TOKEN, resData.access_token);
            //   uni.$emit('logind');
            //   resolve(resData);
            // };
            this.$router.go(-1)
          }
        }, e => {
          const {
            response: {
              data: { errors }
            }
          } = e
          if (errors[0]) return this.$message.error(errors[0].detail[0])
        })
    },
    async sendVerifyCode() {
      const params = {
        _jv: { type: 'sms/send' },
        mobile: this.phoneNumber,
        type: 'login'
      }
      await status.run(() => this.$store.dispatch('jv/post', params))
        .then(res => {
          if (res.interval) this.countDown(res.interval)
        }, e => {
          const {
            response: {
              data: {
                errors }
            }
          } = e
          if (errors[0]) return this.$message.error(errors[0].detail[0])
        })
    },
    async PhoneLogin() {
      const params = {
        _jv: { type: 'sms/verify' },
        mobile: this.phoneNumber,
        code: this.verifyCode,
        type: 'login'
      }
      await status.run(() => this.$store.dispatch('jv/post', params))
        .then(res => {
          window.localStorage.setItem('access_token', res.access_token)
          this.$message.success('登录成功')
          this.$router.go(-1)
        }, e => {
          const {
            response: { status }
          } = e
          if (status === 500) return this.$message.error('验证码不正确')
        })
    },
    async QRcode() {
      const _params = {
        _jv: {
          type: 'oauth/wechat/web/user'
        }
      }
      await this.$store.dispatch('jv/get', _params).then(data => {
        // console.log('user data => ', data)
        this.info = data
        this.scene_str = data.scene_str
        console.log(this.scene_str)
      })

      const params = {
        _jv: {
          type: encodeURI(`oauth/wechat/web/user/search?scene_str="${this.scene_str}"`)

        }
      }
      console.log(params)
      await this.$store.dispatch('jv/get', params).then(data => {
        console.log('user data => ', data)
      })
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
    .retrieve-inputs {
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
          color: #1878f3;
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
    .title {
      margin-left: 10px;
    }
    .title2 {
      margin-right: 15px;
      margin-left: 15px;
    }
    .title3 {
      margin-left: 31px;
      margin-right: 12px;
    }
    .title:first-child {
      margin-right: 2px;
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
    margin-left: 85px;
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
    margin-left: 85px;
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
    padding:0;
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
}
::v-deep .el-tabs__content {
  padding: 15px 5px;
}
</style>
