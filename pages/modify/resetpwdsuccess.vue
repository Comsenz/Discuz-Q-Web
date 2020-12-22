<template>
  <div class="page-findpwd">
    <div class="title"> {{ $t('modify.resetPasswordSuccess') }}</div>
    <div class="describe">
      {{ $t('modify.user') + ' “' + username + '” ' + $t('modify.resetPasswordSuccessRepeat') }} !</div>
    <div class="detail"> {{ $t('modify.resetPasswordLoginTip') }}</div>
    <nuxt-link
      to="/user/login"
      class="login"
    >
      <el-button
        type="primary"
        class="btn"
      >
        {{ $t('user.login') }}
      </el-button>
    </nuxt-link>
  </div>
</template>

<script>
import head from '@/mixin/head';
export default {
  name: 'ResetPwdSuccess',
  mixins: [head],
  data() {
    return {
      title: this.$t('modify.resetPasswordSuccess')
    };
  },
  computed: {
    username() {
      if (process.client) return window.localStorage.getItem('username') || '';
      return '';
    }
  }
};
</script>

<style lang="scss" scoped>
.page-findpwd {
  margin: 60px auto 0;
  height: 300px;
  width: 300px;
  .btn {
    color: #1878f3;
    background: #ffffff !important;
    border: 1px solid #1878f3 !important;
    border-color: #1878f3 !important;
    border-radius: 2px;
  }
  // .btn :hover{
  // }
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
    color: #909399;
  }

  > .login {
    display: block;
    margin-top: 20px;
  }
}
</style>
