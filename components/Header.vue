<template>
  <div class="header">
    <div class="header-container">
      <div class="flex">
        <nuxt-link to="/" class="logo">
          <img
            :src="forums && forums.set_site && forums.set_site.site_header_logo ? forums.set_site.site_header_logo : require('static/logo.png')"
            alt="头部logo"
          >
        </nuxt-link>
        <el-input
          v-model="inputVal"
          autocomplete="off"
          size="medium"
          :placeholder="$t('search.search')"
          class="h-search"
          @keyup.enter.native="onClickSearch"
        >
          <i slot="suffix" class="el-icon-search el-input__icon" @click="onClickSearch" />
        </el-input>
      </div>
      <!-- 未登录 -->
      <div v-if="!userId">
        <el-button size="small" class="h-button h-button1" @click="login">{{ $t('user.login') }}</el-button>
        <el-button :disabled="forums && forums.set_reg && !forums.set_reg.register_close" size="small" class="h-button h-button2" @click="register">{{ $t('user.register') }}</el-button>
      </div>
      <!-- 已登录 -->
      <div v-if="userId && JSON.stringify(userInfo) !== '{}'" class="flex">
        <avatar
          :user="{ id: userInfo.id, username: userInfo.username, avatarUrl: userInfo.avatarUrl}"
          :size="35"
          :round="true"
          :is-real="userInfo.isReal"
        />
        <nuxt-link v-if="userInfo.username && userInfo.id" :to="`/profile?userId=${userInfo.id}`" class="menu-item user-name">
          {{ userInfo.username }}
        </nuxt-link>
        <nuxt-link to="/my/notice" class="menu-item notice-btn">
          <span class="flex">
            {{ $t('home.tabsNews') }}
            <span
              v-if="userInfo.unreadNotifications && userInfo.unreadNotifications > 0"
              class="unread-notice"
            >{{ userInfo.unreadNotifications > 99 ? '99+' : userInfo.unreadNotifications }}</span>
          </span>
        </nuxt-link>
        <nuxt-link to="/my/profile" class="menu-item">{{ $t('profile.personalhomepage') }}</nuxt-link>
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
      userInfoTimer: null // 定时器
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
      return process.client ? this.$store.state.user.info.attributes || {} : {}
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
    if (process.client) {
      this.reloadUserInfo()
    }
  },
  destroyed() {
    if (process.client) {
      this.userInfoTimer = null
      clearInterval(this.userInfoTimer)
    }
  },
  methods: {
    // 退出
    logout() {
      this.$store
        .dispatch('session/logout')
        .then(() => {
          this.$router.push('/')
        })
    },
    // 轮询获取用户信息，用于判断是否有新消息
    reloadUserInfo() {
      if (this.userInfo && this.userInfo.id) {
        clearInterval(this.userInfoTimer)
        const _this = this
        this.userInfoTimer = setInterval(_this.getUserInfo, 30000)
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
        `/user/register?url='/'&validate=${this.forums && this.forums.set_reg && this.forums.set_reg.register_validate}&code=${this.code}`
      )
    },
    login() {
      this.$router.push('/user/login')
    },
    onClickSearch() {
      if (this.inputVal) {
        this.$router.push('/search?q=' + this.inputVal)
      }
    }
  }
}
</script>
<style lang="scss" scoped>
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
      width: 150px;
      height: 35px;
      cursor: pointer;
      @media screen and (max-width: 1005px) {
        width: 135px;
        height: 30px;
      }
      img {
        height: 100%;
      }
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
        border-radius: 0px;
        color: #000;
        @media screen and (max-width: 1005px) {
          height: 30px;
          line-height: 30px;
        }
      }
      @media screen and (max-width: 1005px) {
        .el-input__icon {
          line-height: 30px;
        }
      }
    }

    .h-button {
      width: 60px;
      height: 35px;
      border-color: #1878f3;
      font-size: 14px;
      border-radius: 0px;
      &.h-button1 {
        background: #ffffff;
        color: #1878f3;
      }
      &.h-button2 {
        color: #fff;
        background: #1878f3;
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
        color: black;
      }
    }
    .user-name {
      margin-left: 5px;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 120px;
    }
    .notice-btn {
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
.search-logo {
  width: 14px;
  height: 14px;
  display: inline-block;
  vertical-align: middle;
}
</style>
