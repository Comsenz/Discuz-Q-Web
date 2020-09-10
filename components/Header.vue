<template>
  <div class="header">
    <div class="header-container">
      <div class="flex">
        <div
          class="logo"
          @click="home"
        >
          <img
            :src="headImg != '' && headImg != null ? headImg : require('static/logo.png')"
            alt="头部logo"
          >
        </div>
        <el-input
          v-model="inputVal"
          autocomplete="off"
          size="medium"
          :placeholder="$t('search.search')"
          class="h-search"
          @keyup.enter.native="onClickSearch"
        >
          <i
            slot="suffix"
            class="el-icon-search el-input__icon"
            @click="onClickSearch"
          />
        </el-input>
      </div>
      <div
        v-if="!isLogin"
        v-cloak
        class="h-button"
      >
        <el-button
          type="primary"
          plain
          size="small"
          class="h-button1"
          @click="loginurl"
        >{{ $t('user.login') }}</el-button>

        <el-button
          :disabled="canReg"
          type="primary"
          size="small"
          class="h-button2"
          @click="registerurl"
        >{{ $t('user.register') }}</el-button>

      </div>
      <div
        v-else
        v-cloak
        class="h-button"
      >
        <Avatar
          :user="userInfo"
          :size="35"
          :round="true"
          class="avatar"
          :is-real="userInfo.isReal"
        />
        <el-button
          v-if="userInfo.username"
          type="primary"
          size="small"
          class="h-button4 marleft"
          @click="jumptoperson"
        >{{ userInfo?userInfo.username:'' }}</el-button>

        <el-button
          type="primary"
          size="small"
          class="h-button4 notice-btn"
          @click="jumptoNews"
        >
          <div class="flex">{{ $t('home.tabsNews') }}
            <span v-if="userInfo.unreadNotifications > 0" class="unread-notice">{{ userInfo.unreadNotifications > 99 ? '99+' : userInfo.unreadNotifications }}</span>
          </div>
        </el-button>

        <el-button
          type="primary"
          size="small"
          class="h-button4"
          @click="jumpprofile"
        >{{ $t('profile.personalhomepage') }}</el-button>

        <el-button
          type="primary"
          size="small"
          class="h-button4"
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
      isLogin: this.$store.getters['session/get']('isLogin'),
      activeIndex: '1',
      userId: this.$store.getters['session/get']('userId'),
      code: '', // 邀请码
      canReg: '',
      forums: '',
      timer: null // 定时器
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.user.info.attributes || {}
    }
  },
  mounted() {
    this.userinfo()
    const { code } = this.$route.query
    if (code !== 'undefined') {
      this.code = code
    }
    this.forumh()
    if (this.$route.query.q) {
      this.inputVal = this.$route.query.q
    }
    this.reloadUserInfo()
  },
  destroyed() {
    this.tiemr = null
    clearInterval(this.timer)
  },
  methods: {
    forumh() {
      console.log('userinfo', this.userInfo)
      this.$store.dispatch('site/getSiteInfo').then(res => {
        this.forums = res.attributes
        if (this.forums && this.forums.set_reg && this.forums.set_reg.register_close) {
          console.log('register c', this.forums.set_reg.register_close)
          this.canReg = false
        } else {
          this.canReg = true
        }
      })
    },
    ExitLogin() {
      this.$store.dispatch('session/logout').then(() => window.location.reload())
    },
    // 轮询获取用户信息，用于判断是否有新消息
    reloadUserInfo() {
      if (this.userInfo && this.userInfo.id) {
        clearInterval(this.timer)
        this.timer = setInterval(this.getUserInfo, 30000)
      }
    },
    async getUserInfo() {
      try {
        await this.$store.dispatch('user/getUserInfo', this.userId)
      } catch (err) {
        console.log('header getuUserInfo err', err)
      }
    },
    userinfo() {
      this.userInfo.groupsName = this.userInfo.groups ? this.userInfo.groups[0].name : ''
    },
    registerurl() {
      this.$router.push(`/user/register?url='/'&validate=${this.forums.set_reg.register_validate}&code=${this.code}`)
    },
    jumptoperson() {
      this.$router.push(`/profile?userId=${this.userId}`)
    },
    jumptoNews() {
      this.$router.push('/my/notice')
    },
    loginurl() {
      this.$router.push('/user/login')
    },
    home() {
      this.$router.push('/')
    },
    jumpprofile() {
      this.$router.push('/my/profile')
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
[v-cloak] {
  display: none !important;
}
.header {
  // min-width: 1032px;
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
      float: left;
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
      float: left;
      @media screen and (max-width: 1005px) {
        width: 200px;
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
      height: 35px;
      float: right;
      .h-button1 {
        width: 60px;
        height: 35px;
        color: #1878f3;
        background: #ffffff;
        border-color: #1878f3;
        font-size: 14px;
        border-radius: 0px;
      }
      .h-button2 {
        width: 60px;
        height: 35px;
        color: #ffff;
        background: #1878f3;
        border-color: #1878f3;
        font-size: 14px;
        border-radius: 0px;
      }
      .h-button3 {
        // width: 60px;
        // height: 35px;
        padding: 9px 15px;
        color: #6d6d6d;
        background: #ffffff;
        // border-color: #1878f3;
      }
      .h-button4 {
        // width: 60px;
        height: 35px;
        padding: 0;
        border: none;
        background-color: #ffffff;
        color: #6d6d6d;
        font-size: 16px;
        /* margin-top: -5px; */
        margin-left: 30px;
        @media screen and (max-width: 1005px) {
          font-size: 14px;
        }
      }
      .marleft {
        margin-left: 5px;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 120px;
      }
      .h-button4:hover {
        background: none;
        background-color: none;
        color: black;
      }
      .h-button4:active {
        background: none;
        background-color: none;
        color: black;
      }
      ::v-deep .el-menu--horizontal > .el-menu-item {
        float: right;
        height: 40px;
        line-height: unset;
        /* margin: 0; */
        //  border-bottom: 2px solid transparent;
        // color: #909399;
      }

      ::v-deep.el-menu.el-menu--horizontal {
        border-bottom: none;
      }
      ::v-deep.el-menu--horizontal > .el-menu-item.is-active {
        border-bottom: none;
      }
      .notice-btn{
        .flex{
          display: flex;
          align-items: center;
        }
        .unread-notice{
          font-size:12px;
          color: #fff;
          background: #FF0000;
          padding:1px 6px;
          border-radius:6px;
        }
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
/* .search-logo img{
  width: 100%;
  height: 100%;
  display: inline-block
} */
.log-r {
  float: right;
}
</style>
