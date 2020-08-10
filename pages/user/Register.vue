<template>
  <div class="register">
    <h2 class="register-title">注册新用户</h2>
    <el-tabs
      type="border-card"
      class="register-select"
    >
      <el-tab-pane label="用户名注册">
        <span class="title">用户名&nbsp;&nbsp;&nbsp;</span>
        <el-input
          v-model="userName"
          placeholder="请输入内容"
          class="reg-input"
        />
        <span class="title2">输入密码</span>
        <el-input
          v-model="passWord"
          placeholder="请输入内容"
          type="password"
          class="reg-input"
          @keyup.enter.native="Register"
        />
        <span class="title2">重复密码</span>
        <el-input
          v-model="repeatPassWord"
          placeholder="请输入内容"
          type="password"
          class="reg-input"
        />
        <span class="title2">注册原因</span>
        <el-input
          v-model="Reason"
          placeholder="请输入内容"
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
        >{{ $t('user.register') }}</el-button>
      </el-tab-pane>
      <el-tab-pane label="手机号码注册">
        <span class="title2">手机号码</span>
        <el-input
          v-model="repeatPassWord"
          placeholder="请输入内容"
          type="password"
          class="phone-input"
        />

        <el-button
          class="count-b"
          :class="{disabled: !canClick}"
          @click="coutDown"
        >{{ content }}</el-button>

        <span class="title">验证码&nbsp;&nbsp;&nbsp;</span>
        <el-input
          v-model="userName"
          placeholder="请输入内容"
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
        >{{ $t('user.register') }}</el-button>
      </el-tab-pane>
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
export default {
  name: 'Register',
  data() {
    return {
      userName: '',
      passWord: '',
      repeatPassWord: '',
      Reason: '',
      checked: true,
      content: '获取验证码',
      totalTime: 60,
      canClick: true

    }
  },
  methods: {
    coutDown() {
      if (!this.canClick) return
      this.canClick = false
      this.content = this.totalTime + 's后重新发送'
      const clock = window.setInterval(() => {
        this.totalTime--
        this.content = this.totalTime + 's后重新发送'
        if (this.totalTime < 0) {
          window.clearInterval(clock)
          this.content = '重新发送验证码'
          this.totalTime = 60
          this.canClick = true
        }
      }, 1000)
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
      margin-left: 10px;
    }
    .title2 {
      margin-right: 10px;
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
        img{
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
    padding: 16px 10px;
    margin-left: -5px;
    font-size: 10px;
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
</style>
