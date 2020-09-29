<template>
  <div v-if="dataInfo" class="mywallet">
    <!-- 钱包信息 -->
    <div class="mywallet-top">
      <div class="mywallet-topitem">
        <div class="margbtm">{{ $t('profile.availableamount') }}</div>
        <div
          v-if="dataInfo.available_amount > 0"
          class="amount"
          style="color:#1878F3;"
        >{{ `¥ ${dataInfo && dataInfo.available_amount || 0.0}` }}
          <span
            v-if="forums && forums.qcloud && forums.qcloud.qcloud_sms"
            class="availmount"
            @click="showWithdraw"
          >{{ $t('modify.withdratitle') }}</span>
        </div>
        <div
          v-else
          class="amount"
        >{{ `¥ ${dataInfo && dataInfo.available_amount || 0.0}` }}
          <span
            v-if="forums && forums.qcloud && forums.qcloud.qcloud_sms"
            class="availmount"
            @click="showWithdraw"
          >{{ $t('modify.withdratitle') }}</span>
        </div>
      </div>
      <div class="mywallet-topitem mymarg">
        <div class="margbtm">{{ $t('profile.freezeamount') }}</div>
        <div
          v-if="dataInfo.freeze_amount > 0"
          class="amount"
          style="color:#FA5151;"
        >{{ `¥ ${dataInfo && dataInfo.freeze_amount || 0.0}` }}</div>
        <div
          v-else
          class="amount"
        >{{ `¥ ${dataInfo && dataInfo.freeze_amount || 0.0}` }}</div>
      </div>
      <div class="mywallet-topitem mywallet-r">
        <div class="margbtm">{{ $t('pay.payPassword') }}</div>
        <div
          v-if="hasPassword"
          class="changepas"
          @click="changePassword"
        >
          <svg-icon
            type="shield"
            class="shield-icon"
          />{{ $t('profile.walletpasset') }}
        </div>
        <div
          v-else
          style="cursor: pointer;"
          @click="setPassword"
        >
          <svg-icon
            type="warning"
            class="shield-icon"
          />{{ $t('profile.setpaypassword') }}
        </div>
      </div>
      <!-- 设置钱包密码 -->
      <div v-if="hasPassword">
        <wallet-password
          v-if="showPasswordInput"
          ref="walletpass"
          :error="passError"
          @close="showPasswordInput = false"
          @password="validatePass"
          @findpaypwd="findPaypwd"
        />
        <set-newpassword
          v-if="showNewverify"
          :error="codeError"
          @close="showNewverify = false"
          @password="checkpass"
        />
        <repeat-newpassword
          v-if="showNewverify2"
          ref="repeatnewpass"
          :error="codeError"
          @close="showNewverify2 = false"
          @password="checkpass2"
        />
      </div>
      <div v-else>
        <set-password
          v-if="setPasswordInput"
          @close="setPasswordInput = false"
          @password="setPass"
        />
        <repeat-password
          v-if="repPasswordInput"
          ref="repeatpass"
          :error="codeError"
          @close="repPasswordInput = false"
          @password="setPass2"
        />
      </div>
      <!-- <phone-code v-if="issendcode" :mobile="dataInfo.user.mobile" :phonenum="dataInfo.user.originalMobile" @password="checkCode" @close="issendcode = false" /> -->
      <find-paypwd v-if="isfindpwd" :mobile="dataInfo.user.mobile" :phonenum="dataInfo.user.originalMobile" @close="isfindpwd = false" />
      <without-phone v-if="isWithoutphone" @close=" isWithoutphone = false" />
    </div>
    <el-tabs
      type="border-card"
      class="register-select"
    >
      <!-- 提现记录 -->
      <el-tab-pane :label="$t('profile.withdrawalslist')">
        <cash-dialog ref="cash" />
      </el-tab-pane>
      <!-- 冻结金额 -->
      <el-tab-pane :label="$t('profile.freezeamount')">
        <freeze-amount />
      </el-tab-pane>
      <!-- 钱包明细 -->
      <el-tab-pane :label="$t('profile.walletlist')">
        <wallet-detail />
      </el-tab-pane>
      <!-- 订单明细 -->
      <el-tab-pane :label="$t('profile.orderlist')">
        <order-detail />
      </el-tab-pane>
    </el-tabs>
    <withdrawal
      v-if="isWithdraw"
      @close="updateWithdraw"
    />
  </div>

</template>

<script>
import { status } from '@/library/jsonapi-vuex/index'

import handleError from '@/mixin/handleError'

export default {
  layout: 'center_layout',
  mixins: [
    handleError
  ],
  data() {
    return {
      isWithdraw: false,
      inputpas: '', // 第一次新密码
      usertokenid: '', // 原密码验证成功id
      showNewverify: false, // 新密码验证码框
      showNewverify2: false, // 新密码验证码框
      setPasswordInput: false, // 设置密码框
      repPasswordInput: false, // 设置重复密码框
      showPasswordInput: false, // 修改密码框
      passError: false, // 修改原密码
      codeError: false, // 再次输入密码错误判断
      loadingType: '', // 读取状态
      dataInfo: '', // 钱包信息
      hasPassword: false,
      issendcode: false,
      isfindpwd: false,
      isWithoutphone: false,
      userId: this.$store.getters['session/get']('userId') // 获取当前登陆用户的ID
    }
  },
  computed: {
    forums() {
      return this.$store.state.site.info.attributes || {}
    }
  },
  mounted() {
    this.getInfo()
  },
  methods: {
    // 提现成功后的数据更新
    updateWithdraw() {
      this.isWithdraw = false
      this.$refs.cash.getList()
    },
    // 提现
    showWithdraw() {
      this.isWithdraw = true
    },
    // 设置密码框展示
    setPassword() {
      this.setPasswordInput = true
    },
    // 修改密码框展示
    changePassword() {
      this.showPasswordInput = true
    },
    // 原密码判断
    validatePass(password = '') {
      const params = {
        _jv: {
          type: 'users/pay-password/reset'
        },
        pay_password: password
      }
      const postphon = status.run(() => this.$store.dispatch('jv/post', params))
      postphon
        .then(res => {
          console.log('原支付密码验证', res)
          if (res._jv.json.data.id) {
            this.passError = false
            this.showPasswordInput = false
            this.$message.success(
              this.$t('modify.authensucceeded')
            )
            this.showNewverify = true
            this.usertokenid = res._jv.json.data.id
          }
        })
        .catch(err => {
          // this.$message.error(this.$t('modify.authenfailed'))
          this.$refs.walletpass.empty()
          this.passError = true
          this.handleError(err)
          console.log('error', err)
        })
    },
    // 新密码
    checkpass(num) {
      if (num.length >= 6) {
        console.log('hhhhhhh')

        this.inputpas = num
        console.log('新密码', this.inputpas)
        this.showNewverify = false
        this.showNewverify2 = true
      }
    },
    // 重复输入新密码
    checkpass2(sum) {
      if (sum.length >= 6) {
        this.validateVerify(sum)
      }
    },

    // 获取初始化密码
    setPass(password) {
      if (password.length >= 6) {
        this.inputpas = password

        this.setPasswordInput = false
        this.repPasswordInput = true
      }
    },
    // 重复初始化密码
    setPass2(password) {
      if (password.length >= 6) {
        this.validateVerify(password)
      }
    },
    // 初始密码判断
    validateVerify(password = '') {
      console.log('password', password)
      const params = {
        _jv: {
          type: 'users',
          id: this.userId
        },
        pay_password_token: this.usertokenid, // 初始化密码不需要
        payPassword: this.inputpas,
        pay_password_confirmation: password
      }
      const postphon = status.run(() => this.$store.dispatch('jv/patch', params))
      postphon
        .then(res => {
          this.inputpas = ''
          console.log('初始密码设置成功', res)
          if (res) {
            this.repPasswordInput = false
            this.showNewverify2 = false
            this.$message.success(this.$t('modify.paymentsucceed'))
            // this.$router.go(0)
            this.getInfo()
          }
        })
        .catch(err => {
          console.log(err)
          if (this.$refs.repeatnewpass) {
            this.$refs.repeatnewpass.empty()
          }
          if (this.$refs.repeatpass) {
            this.$refs.repeatpass.empty()
          }
          this.codeError = true
          this.handleError(err)
        })
    },
    // 获取钱包信息
    getInfo() {
      status
        .run(() => this.$store.dispatch('jv/get', `wallet/user/${this.userId}`))
        .then(res => {
          console.log('钱包信息', res)
          this.dataInfo = res
          this.hasPassword = res.user.canWalletPay
        }, e => this.handleError(e))
    },
    // 找回密码
    findPaypwd() {
      if (this.dataInfo.user.mobile) {
        this.isfindpwd = true
      } else {
        this.isWithoutphone = true
      }
      console.log('hhhhhhhhhhhhh', this.dataInfo)
    }
  },
  head() {
    return {
      title: this.$t('profile.mywallet')
    }
  }

}
</script>
<style lang='scss' scoped>
@import "@/assets/css/variable/color.scss";

.mywallet {
  padding-left: 30px;
   margin-top: 40px !important;
  @media screen and (max-width: 1005px) {
    padding-left: 0 15px;
  }
  .mywallet-top {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    .mymarg {
      text-align: center;
    }
    .mywallet-topitem {
      // display: flex;
      // flex-direction: column;
      flex: 1;
      color: #6d6d6d;
      .shield-icon {
        width: 16px;
        height: 16px;
        margin-right: 5px;
        vertical-align: sub;
      }
      .amount {
        font-size: 20px;
        color: #000000;
        min-width: 115px;
      }
      .availmount {
        font-size: 14px;
        color: #1878f3;
        line-height: 23px;
        vertical-align: top;
        margin-left: 10px;
        cursor: pointer;
      }
      .margbtm {
        margin-bottom: 10px;
      }
    }
    .mywallet-r {
      margin-right: 30px;
      text-align: right;
      .changepas {
        cursor: pointer;
        color: #8590a6;
      }
    }
  }
  .register-select {
    margin-top: 63px;
    border: none;
    background: transparent;
    box-shadow: none;
    padding-right: 30px;
    // @media screen and (max-width: 1005px) {
    //   width: 100%;
    //   max-width: 750px;
    // }
    // @media screen and (max-width: 900px) {
    //   width: 100%;
    //   max-width: 700px;
    // }
    // @media screen and (max-width: 850px) {
    //   width: 100%;
    //   max-width: 650px;
    // }
  }
  .margleft {
    margin-left: 30px;
    @media screen and (max-width: 850px) {
      margin-left: 0px;
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
    padding: 0 52px 0 2px;
    font-size: 16px;
    transition: none;
  }
  .el-tabs__content {
    padding: 10px 0;
  }
  .el-tabs__header .el-tabs__item:nth-child(2) {
    padding-left: 0px;
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
    height: 40px;
  }
  .el-input__inner {
    border-radius: 2px;
  }
  .el-button {
    border-radius: 2px;
  }
  .el-input__inner:focus {
    border-color: #dcdfe6;
  }
  .el-input__inner:hover {
    border-color: #dcdfe6;
  }
}
::v-deep .el-tabs--border-card > .el-tabs__header .el-tabs__item:hover {
  color: #00479b;
}
</style>
