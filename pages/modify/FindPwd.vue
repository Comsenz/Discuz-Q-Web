<template>
  <div class="page-find-pwd">
    <div class="title"> {{ $t('modify.forgetPassword') }}\{{ $t('modify.retrievePassword') }}</div>
    <div class="describe"> {{ $t('modify.retrievePasswordByPhone') }}</div>
    <div class="retrieve-inputs">
      <label>
        <input maxlength="11" type="text" @input="onInput" :placeholder="$t('modify.placeEnterRegisteredPhone')">
        <button @click="sendVerifyCode" :disabled="isVerifyDisabled" v-if="!canCountDown">
          {{$t('modify.sendVerifyCode')}}
        </button>
        <button disabled v-else>{{countDownSecond + $t('modify.retransmission')}}</button>
      </label>
      <el-input maxlength="6" v-model="verifyCode" :placeholder="$t('modify.placeEnterCode')"></el-input>
      <el-input v-model="newPassword" :placeholder="$t('modify.enterNew')" show-password></el-input>
      <el-input v-model="newPasswordRepeat" :placeholder="$t('modify.enterNewRepeat')" show-password></el-input>
    </div>
    <button @click="submit" class="submit">{{$t('modify.submit')}}</button>
  </div>
</template>

<script>
  // import retrievePassword from '@/api/v1/retrievePassword'
  import {status} from '@/library/jsonapi-vuex/index'

  export default {
    name: 'findpwd',
    data() {
      return {
        phoneNumber: '',
        isVerifyDisabled: true,
        canCountDown: false,
        countDownSecond: 60,
        verifyCode: '',
        newPassword: '',
        newPasswordRepeat: '',
        username: ''
      }
    },
    methods: {
      onInput(e) {
        this.phoneNumber = e.target.value.replace(/[^\d]/g, '')
        this.isVerifyDisabled = this.phoneNumber.length !== 11
      },
      countDown(interval) {
        this.canCountDown = true
        this.countDownSecond = interval
        const countDownInterval = setInterval(() => {
          this.countDownSecond -= 1
          if (this.countDownSecond === 0) {
            this.canCountDown = false
            clearInterval(countDownInterval)
          }
        }, 1000)
      },
      async sendVerifyCode() {
        const params = {
          _jv: {type: 'sms/send',},
          mobile: this.phoneNumber,
          type: 'reset_pwd',
        }
        status.run(() => this.$store.dispatch('jv/post', params))
          .then(res => {
            if (res.interval) this.countDown(res.interval)
          }, e => {
            const {response: {data: {errors}}} = e
            if (errors[0]) return this.$message.error(errors[0].detail[0])
          })
      },
      submit() {
        if (!this.verifyCode) return this.$message.warning('验证码不能为空')
        if (this.newPassword !== this.newPasswordRepeat) return this.$message.warning('两次输入密码不同')
        const params = {
          _jv: {type: 'sms/verify',},
          mobile: this.phoneNumber,
          code: this.verifyCode,
          password: this.newPassword,
          type: 'reset_pwd',
        }
        status.run(() => this.$store.dispatch('jv/post', params))
          .then(res => {
            window.localStorage.setItem('username', res.username)
            this.$router.push('/modify/resetpwdsuccess')
          }, e => {
            const {response: {status}} = e
            if (status === 500) return this.$message.error('验证码不正确')
          })
      }
    }
  }
</script>

<style lang="scss" scoped>
  ::-webkit-input-placeholder { /* Chrome/Opera/Safari */
    color: #C0C4CC;
  }

  ::-moz-placeholder { /* Firefox 19+ */
    color: #C0C4CC;
  }

  :-ms-input-placeholder { /* IE 10+ */
    color: #C0C4CC;
  }

  :-moz-placeholder { /* Firefox 18- */
    color: #C0C4CC;
  }

  .page-find-pwd {
    margin: 60px auto 0;
    height: 300px;
    width: 300px;

    > .title {
      font-weight: bold;
      color: #343434;
      font-size: 26px;
    }

    > .describe {
      color: #000;
      margin-top: 50px;
      font-size: 18px;
    }

    > .retrieve-inputs {
      margin-top: 40px;

      > .el-input {
        margin-bottom: 20px;
        color: #C0C4CC;
      }

      > label {
        width: 100%;
        height: 40px;
        display: flex;
        justify-content: space-between;
        border: 1px solid #DCDFE6;
        margin-bottom: 20px;

        > button {
          color: #1878F3;
          width: 90px;
          border-left: 1px solid #DCDFE6;
        }

        > input {
          flex: 1;
          border: none;
          padding: 0 16px;
          color: #C0C4CC;
        }

      }
    }

    > .submit {
      width: 100%;
      height: 40px;
      background: #1878F3;
      text-align: center;
      line-height: 40px;
      color: white;
      font-size: 14px;
    }
  }

</style>
