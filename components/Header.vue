<template>
  <div class="header">
    <div class="header-container">
      <div class="logo">
        <img
          :src="headImg != '' && headImg != null ? headImg : require('static/logo.png')"
          alt
        >
      </div>

      <el-input
        v-model="inputVal"
        size="medium"
        :placeholder="$t('search.search')"
        suffix-icon="el-icon-search"
        class="h-search"
      />

      <div
        v-if="!isLogin"
        v-cloak
        class="h-button"
      >
        <nuxt-link :to="'/user/login'">
          <el-button
            type="primary"
            plain
            size="small"
            class="h-button1"
          >{{ $t('user.login') }}</el-button>
        </nuxt-link>

        <nuxt-link to="/user/register">
          <el-button
            type="primary"
            size="small"
            class="h-button2"
          >{{ $t('user.register') }}</el-button>
        </nuxt-link>
      </div>
      <div
        v-else
        v-cloak
        class="h-button"
      >

        <el-button
          type="primary"
          plain
          size="small"
          class="h-button3"
          @click="ExitLogin"
        >{{ $t('user.logout') }}</el-button>

      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'Header',
  props: {
    headImg: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      inputVal: '',
      isLogin: ''

    }
  },
  mounted() {
    this.isLoginh()
  },
  methods: {
    isLoginh() {
      this.isLogin = !!window.localStorage.getItem('access_token')
      console.log(this.isLogin)
    },
    ExitLogin() {
      this.isLogin = window.localStorage.removeItem('access_token')
      this.$router.go(0)
    }
  }
}
</script>
<style lang="scss" scoped>
[v-cloak] {
  display: none;
}
.header {
  min-width: 1032px;
  height: 65px;
  background: rgba(255, 255, 255, 1);
  box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.03);
  opacity: 1;
  .header-container {
    margin: 0 auto;
    width: 1005px;
    height: 65px;
    padding: 15px 0;
    align-items: center;
    .logo {
      float: left;
      width: 150px;
      height: 35px;
      img {
        height: 100%;
      }
    }
    .h-search {
      margin-left: 30px;
      width: 298px;
      height: 36px;
      background: rgba(255, 255, 255, 1);
      border: 1px solid rgba(237, 237, 237, 1);
      opacity: 0.66;
      border-radius: 4px;
      float: left;
      /* background: yellow; */
    }
    .h-button {
      float: right;
      .h-button1 {
        width: 60px;
        height: 35px;
        color: #1878f3;
        background: #ffffff;
        border-color: #1878f3;
      }
      .h-button2 {
        width: 60px;
        height: 35px;
        color: #ffff;
        background: #1878f3;
        border-color: #1878f3;
      }
      .h-button3 {
        width: 60px;
        height: 35px;
        padding: 9px 6px;
        color: #1878f3;
        background: #ffffff;
        border-color: #1878f3;
      }
    }
  }
}

.h-search-input {
  width: 255px;
  border: none;
  height: 100%;
  /* outline-color: lightskyblue; */
  outline: none;
  padding-left: 16px;

  font-size: 14px;
  font-family: Microsoft YaHei;
  font-weight: 400;
  line-height: 19px;
  color: rgba(208, 212, 220, 1);
}
.search-logo {
  width: 14px;
  height: 14px;
  /* background: blue; */
  display: inline-block;
  vertical-align: middle;
}
/* .search-logo img{
  width: 100%;
  height: 100%;
  display: inline-block
} */
.log-r {
  float: right;
}
</style>
