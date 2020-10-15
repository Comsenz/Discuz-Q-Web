<template>
  <div ref="head" class="header isFixed">
    <div class="header-container">
      <div class="flex">
        <div class="logo" @click="toIndex">
          <img
            v-show="forums && forums.set_site"
            :src="forums && forums.set_site && forums.set_site.site_logo ? forums.set_site.site_logo : require('@/assets/logo.png')"
            alt="头部logo"
          >
        </div>
        <el-input
          v-model="inputVal"
          autocomplete="off"
          size="medium"
          :placeholder="$t('search.search')"
          class="h-search"
          :disabled="siteClose"
          @keyup.enter.native="onClickSearch"
        >
          <svg-icon slot="suffix" type="search" class="el-input__icon" @click="onClickSearch" />
        </el-input>
      </div>
      <!-- 未登录 -->
      <div v-if="!userId || siteClose">
        <el-button :disabled="siteClose" size="small" class="h-button h-button1" @click="login">{{ $t('user.login') }}</el-button>
        <el-button :disabled="(forums && forums.set_reg && !forums.set_reg.register_close) || siteClose" size="small" class="h-button h-button2" @click="register">{{ $t('user.register') }}</el-button>
      </div>
      <!-- 已登录 -->
      <div v-if="userId && JSON.stringify(userInfo) !== '{}' && !siteClose" class="flex">
        <avatar
          :user="{ id: userInfo.id, username: userInfo.username, avatarUrl: userInfo.avatarUrl, isReal: userInfo.isReal}"
          :size="35"
          :round="true"
        />
        <nuxt-link v-if="userInfo.username && userInfo.id" :to="`/pages/profile/index?userId=${userInfo.id}`" class="menu-item user-name text-hidden">
          {{ userInfo.username }}
        </nuxt-link>
        <nuxt-link to="/pages/my/notice/" class="menu-item notice-btn">
          <span class="flex">
            {{ $t('home.tabsNews') }}
            <span
              v-if="userInfo.unreadNotifications && userInfo.unreadNotifications > 0"
              class="unread-notice"
            >{{ userInfo.unreadNotifications > 99 ? '99+' : userInfo.unreadNotifications }}</span>
          </span>
        </nuxt-link>
        <nuxt-link to="/pages/my/profile/" class="menu-item">{{ $t('profile.personalhomepage') }}</nuxt-link>
        <div class="menu-item" @click="logout">{{ $t('user.logout') }}</div>
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
      code: '', // 邀请码
      canReg: false,
      siteClose: false,
      userInfoTimer: null, // 定时器
      offsetTop: 0,
      imgurl: require('@/assets/logo.png')
    }
  },
  computed: {
    userId() {
      return this.$store.state.user.info.id
    },
    forums() {
      return this.$store.state.site.info.attributes || {}
    },
    userInfo() {
      return this.$store.state.user.info.attributes || {}
    }
  },
  watch: {
    $route(to, from) {
      if (to.path === '/pages/site/close') {
        this.siteClose = true
      } else {
        this.siteClose = false
      }
    }
  },
  mounted() {
    const { code } = this.$route.query
    if (code !== 'undefined') {
      this.code = code
    }
    if (process.client && this.$route.query.q) {
      this.inputVal = this.$route.query.q
    }
    if (process.client && this.$route.path !== '/pages/site/close') {
      window.setTimeout(this.reloadUserInfo(), 5000)
    }
    if (this.$route.path === '/pages/site/close') {
      this.siteClose = true
    }
  },
  destroyed() {
    if (process.client) {
      window.clearInterval(this.userInfoTimer)
    }
  },
  methods: {
    // 退出
    logout() {
      this.$store
        .dispatch('session/logout')
        .then(() => {
          location.href = `/`
        })
    },
    // 轮询获取用户信息，用于判断是否有新消息
    reloadUserInfo() {
      if (this.userInfo && this.userInfo.id) {
        window.clearInterval(this.userInfoTimer)
        this.userInfoTimer = window.setInterval(this.getUserInfo, 60000)
      }
    },
    async getUserInfo() {
      try {
        await this.$store.dispatch('user/getUserInfo', this.userId)
      } catch (err) {
        console.log('header getUserInfo err', err)
      }
    },
    register() {
      this.$router.push(
        `/pages/user/register?validate=${this.forums && this.forums.set_reg && this.forums.set_reg.register_validate}&code=${this.code}`
      )
    },
    login() {
      this.$router.push('/pages/user/login')
    },
    onClickSearch() {
      if (this.inputVal) {
        this.$router.push('/pages/site/search?q=' + this.inputVal)
      }
    },
    toIndex() {
      if (this.$route.path === '/') {
        window.location.href = '/'
      } else {
        this.$router.push('/')
      }
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/assets/css/variable/color.scss';
.header {
  height: 65px;
  background: rgba(255, 255, 255, 1);
  box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.03);
  opacity: 1;
  @media screen and (max-width: 1005px) {
    height: 50px;
    width: 100%;
    min-width: 768px;
  }
  .header-container {
    margin: 0 auto;
    width: 1005px;
    height: 65px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .flex {
      display: flex;
      align-items: center;
    }
    @media screen and (max-width: 1005px) {
      width: 100%;
      min-width: 768px;
      padding: 0 14px;
      height: 50px;
    }
    .logo {
      max-width: 280px;
      max-height: 35px;
      height: 24px;
      cursor: pointer;
      display: flex;
      @media screen and (max-width: 1005px) {
        max-width: 135px;
        max-height: 30px;
      }
      img {
        height: 24px;
        // width: 100%;
      }
    }
    .logo2 {
      background-position: center center;
      background-size: contain;
      background-repeat: no-repeat;
      height: 24px;
      width: 100%;
      max-width: 100%;
      cursor: pointer;
    }
    ::v-deep.h-search {
      margin-left: 30px;
      width: 298px;
      height: 36px;
      @media screen and (max-width: 1005px) {
        width: 180px;
        height: 30px;
      }
      .el-input__inner {
        border-radius: 2px;
        color: #000;
        border-color: rgba(237,237,237,0.66);
        @media screen and (max-width: 1005px) {
          height: 30px;
          line-height: 30px;
        }
      }
      .el-input__icon {
        width:14px;
        margin-right: 8px;
      }
      .el-input__suffix{
        line-height: 36px;
        @media screen and (max-width: 1005px) {
          line-height: 30px;
        }
      }
    }

    .h-button {
      width: 60px;
      height: 35px;
      border-color: $color-blue-base;
      font-size: 14px;
      border-radius: 2px;
      &.h-button1 {
        background: #ffffff;
        color: $color-blue-base;
        transition: all 0.2s ease-in-out;
        &:hover{
          background: #E5F2FF;
          border:1px solid #D4E6FC;
        }
      }
      &.h-button2 {
        color: #fff;
        background: $color-blue-base;
        color: #fff;
        &:hover{
          background:  $color-blue-deep;
          border-color: $color-blue-deep;
        }
      }
    }
    .menu-item {
      color: #6d6d6d;
      font-size: 16px;
      margin-left: 30px;
      cursor: pointer;
      @media screen and (max-width: 1005px) {
        font-size: 14px;
        margin-left: 15px;
      }
      &:hover{
        color: $color-blue-base;
      }
    }
    .user-name {
      margin-left: 10px;
      max-width: 120px;
    }
    .notice-btn {
      line-height: 1;
      .flex {
        display: flex;
        align-items: center;
      }
      .unread-notice {
        font-size: 12px;
        color: #fff;
        background: #ff0000;
        padding: 1px 6px;
        border-radius: 6px;
        margin-left: 2px;
      }
    }
    .avatar {
      width: 35px;
      height: 35px;
      border-radius: 50%;
      vertical-align: bottom;
      display: inline-block !important;
    }
  }
}
.isFixed{
  position: -webkit-sticky;
    position: sticky;
    top: 0;
    width: 100%;
    z-index: 8;
}
.search-logo {
  width: 14px;
  height: 14px;
  display: inline-block;
  vertical-align: middle;
}
</style>
