<template>
  <message
    :title="`${$t('modify.forgetPassword') +'/'+ $t('modify.retrievePassword')} `"
    @close="$emit('close')"
  >
    <div class="container">
      <div class="retrieve-inputs">
        <label>
          <input
            v-model="phoneNumber"
            maxlength="11"
            type="text"
            :placeholder="$t('modify.placeEnterRegisteredPhone')"
          >
          <button
            v-if="!canCountDown"
            class="sendbtn"
            @click="sendVerifyCode"
          >
            {{ $t('modify.sendVerifyCode') }}
          </button>
          <button
            v-else
            :disabled="canCountDown"
            :class="{disabled: canCountDown}"
          >{{ countDownSecond + $t('modify.retransmission') }}</button>
        </label>
        <el-input
          v-model="verifyCode"
          maxlength="6"
          :placeholder="$t('modify.placeEnterCode')"
        />
        <el-input
          v-model="newPassword"
          placeholder="请输入新支付密码"
          show-password
        />
        <el-input
          v-model="newPasswordRepeat"
          placeholder="请重新输入新支付密码"
          show-password
          @keyup.enter.native="submit"
        />
      </div>
      <button
        class="submit"
        @click="submit"
      >{{ $t('modify.newPayPwdTitle') }}</button>
    </div>
  </message>
</template>

<script>
import { status } from '@/store/modules/jsonapi-vuex/index';
import handleError from '@/mixin/handleError';
import tencentCaptcha from '@/mixin/tencentCaptcha';
export default {
  name: 'FindPaypwd',
  mixins: [
    tencentCaptcha, handleError
  ],
  props: {
    mobile: {
      type: String,
      default: ''
    },
    phonenum: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      phoneNumber: '',
      isVerifyDisabled: true,
      canCountDown: false,
      countDownSecond: 60,
      loading: false,
      verifyCode: '',
      newPassword: '',
      newPasswordRepeat: '',
      username: '',
      realphoneNumber: '',
      userId: this.$store.getters['session/get']('userId') // 获取当前登陆用户的ID
    };
  },
  mounted() {
    this.phoneNumber = this.mobile;
    this.realphoneNumber = this.phonenum;
  },
  methods: {
    onInput(e) {
      this.phoneNumber = e.target.value.replace(/[^\d]/g, '');
      this.isVerifyDisabled = this.phoneNumber.length !== 11;
    },
    countDown(interval) {
      this.canCountDown = true;
      this.countDownSecond = interval;
      const countDownInterval = setInterval(() => {
        this.countDownSecond -= 1;
        if (this.countDownSecond === 0) {
          this.canCountDown = false;
          clearInterval(countDownInterval);
        }
      }, 1000);
    },
    async sendVerifyCode() {
      let params = {
        _jv: { type: 'sms/send' },
        mobile: this.realphoneNumber,
        type: 'reset_pay_pwd'
      };
      params = await this.checkCaptcha(params);
      status.run(() => this.$store.dispatch('jv/post', params))
        .then((res) => {
          if (res.interval) this.countDown(res.interval);
        }, (e) => {
          const { response:
            {
              data: { errors }
            }
          } = e;
          if (errors[0]) return this.$message.error(errors[0].detail[0]);
        });
    },
    submit() {
      if (this.verifyCode === '') {
        this.$message.error('验证码不能为空');
      } else if (this.newPassword === '') {
        this.$message.error('新密码不能为空');
      } else if (this.newPasswordRepeat === '') {
        this.$message.error('重复密码不能为空');
      } else if (this.newPassword !== this.newPasswordRepeat) {
        this.$message.error('二次密码输入不一致');
      } else {
        const params = {
          _jv: { type: 'sms/verify' },
          mobile: this.realphoneNumber,
          code: this.verifyCode,
          pay_password: this.newPassword,
          pay_password_confirmation: this.newPasswordRepeat,
          type: 'reset_pay_pwd'
        };
        status.run(() => this.$store.dispatch('jv/post', params))
          .then(() => {
            this.$message.success(this.$t('modify.paymentsucceed'));
            this.$emit('close');
          }, e => this.handleError(e));
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/variable/color.scss";

.container {
  height: 370px;
  width: 300px;
  margin: 0 auto;
  > .block {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 40px;
    &.show-amount {
      > .title {
        font-size: 30px;
      }
      > .amount {
        height: 52px;
        line-height: 52px;
        position: relative;
        font-size: 14px;
        color: #777777;
        > .icon {
          line-height: 20px;
          position: absolute;
          top: 10px;
          left: -20px;
          font-size: 20px;
        }
      }
    }
  }
  .retrieve-inputs {
    margin-top: 40px;

    .disabled {
      background-color: #ededed;
      // border-color: #ddd;
      color: #b5b5b5;
      cursor: not-allowed; // 鼠标变化
    }
    > .el-input {
      margin-bottom: 10px;
      color: #c0c4cc;
    }

    > label {
      width: 100%;
      height: 40px;
      display: flex;
      justify-content: space-between;
      border: 1px solid #dcdfe6;
      margin-bottom: 10px;

      > button {
        color: #000000;
        width: 90px;
        border-left: 1px solid #dcdfe6;
        &:hover{
          color:#595959;
          background-color:#e5f2ff;
        }
      }

      > input {
        flex: 1;
        border: none;
        /* padding: 0 16px; */
        color: #000000;
        font-size: 16px;
        font-weight: bold;
        padding-left: 16px;
        width: 209px;
      }
    }
  }

  > .submit {
    width: 100%;
    height: 40px;
    background: $color-blue-base;
    text-align: center;
    line-height: 40px;
    color: white;
    font-size: 14px;
    margin-top: 10px;
  }
  ::v-deep.el-button {
    border-radius: 2px;
  }
  // ::v-deep.el-input__inner:focus {
  //   border-color: #dcdfe6;
  // }
  // ::v-deep.el-input__inner:hover {
  //   border-color: #dcdfe6;
  // }
  ::v-deep.el-input__inner {
    border-radius: 2px;
    // border-right: none;
  }
}
</style>
