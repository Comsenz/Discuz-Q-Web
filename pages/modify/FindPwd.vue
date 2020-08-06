<template>
  <div class="page-find-pwd">
    <div class="title"> {{ $t('modify.forgetPassword') }}\{{ $t('modify.retrievePassword') }}</div>
    <div class="describe"> {{ $t('modify.retrievePasswordByPhone') }}</div>
    <div class="retrieve-inputs">
      <label>
        <input type="text" @input="onInput" :placeholder="$t('modify.placeEnterRegisteredPhone')">
        <button @click="getVerifyCode" :disabled="isVerifyDisabled" v-if="!canCountDown" >{{$t('modify.sendVerifyCode')}}</button>
        <button disabled v-else >{{countDownSecond + $t('modify.retransmission')}}</button>
      </label>
      <label>
        <input type="text" :placeholder="$t('modify.placeEnterCode')">
      </label>
    </div>
    <button class="submit">{{$t('modify.submit')}}</button>
  </div>
</template>

<script>
  export default {
    name: 'findpwd',
    data() {
      return {
        phoneNumber: '',
        isVerifyDisabled: true,
        canCountDown: false,
        countDownSecond: 10
      }
    },
    methods: {
      // onLoad(sing) {
      //   this.sendtype = sing.pas;
      //   this.userid = Number(sing.user) || '';
      //   if (this.userid) {
      //     this.inptdisplay = true;
      //   } else {
      //     this.inptdisplay = false;
      //   }
      //   this.personaldata();
      // },
      onInput(e) {
        this.phoneNumber = e.target.value.replace(/[^\d]/g, '')
        this.isVerifyDisabled = this.phoneNumber.length !== 11
      },
      getVerifyCode() {
        this.canCountDown = true
        const countDownInterval = setInterval(() => {
          this.countDownSecond -= 1
          if (this.countDownSecond === 0) {
            this.canCountDown = false
            this.countDownSecond = 10
            clearInterval(countDownInterval)
          }
        }, 1000)
      },
      sendOut() {
        const params = {
          _jv: {
            type: 'sms/send',
          },
          mobile: this.phoneNumber,
          type: 'reset_pwd',
        }
        const sendphon = status.run(() => this.$store.dispatch('jv/post', params))
        sendphon.then(res => {
          if (res) {
            this.num -= 1
          }
        })
      },

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

      > label {
        width: 100%;
        height: 40px;
        display: flex;
        justify-content: space-between;
        border: 1px solid #DCDFE6;
        margin-bottom: 20px;

        > button {
          width: 90px;
          border-left: 1px solid #DCDFE6;
        }

        > input {
          color: #C0C4CC;
          padding: 0 16px;
          border: none;
        }

        > input[placeholder], [placeholder], *[placeholder] {
          color: red !important;
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
