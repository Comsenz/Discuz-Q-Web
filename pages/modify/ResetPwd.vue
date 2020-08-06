<template>
  <div class="page-findpwd">
    <div class="title"> {{ $t('modify.newPwdTitle') }} </div>
    <div class="describe"> {{ $t('modify.user') }} "特朗普" {{ $t('modify.resetPassword') }}</div>
    <div class="retrieve-inputs">
      <label>
        <input type="text" :placeholder="$t('modify.enterNew')">
      </label>
      <label>
        <input type="text" :placeholder="$t('modify.enterNewRepeat')">
      </label>
    </div>
    <button class="submit">{{$t('modify.submit')}}</button>
  </div>
</template>

<script>
  export default {
    name: 'ResetPassword',
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

  .page-findpwd {
    margin: 60px auto 0;
    height: 300px;
    width: 300px;

    > .title {
      font-weight: bold;
      color: #343434;
      font-size: 26px;
    }

    > .describe {
      width: 200%;
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
