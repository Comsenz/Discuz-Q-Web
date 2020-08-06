<template>
  <div class="page-findpwd">
    <div class="title"> {{ $t('modify.resetPasswordSuccess') }}</div>
    <div class="describe"> {{ $t('modify.user') }} ”特朗普“ {{ $t('modify.resetPasswordSuccessRepeat') }} !</div>
    <div class="detail"> {{ $t('modify.resetPasswordLoginTip') }}</div>
    <el-button class="login">登录</el-button>
  </div>
</template>

<script>
  export default {
    name: 'ResetPwdSuccess',
  }
</script>

<style lang="scss" scoped>
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
      color: #000;
      margin-top: 50px;
      font-size: 18px;
    }

    > .detail {
      margin-top: 20px;
      color: #909399
    }

    > .login {
      margin-top: 20px;
    }

  }

</style>
