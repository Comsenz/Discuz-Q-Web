<template>
  <div class="header">
    <div class="header-container">
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
          class="h-button4"
        >{{ $t('home.tabsNews') }}</el-button>

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
      isLogin: '',
      activeIndex: '1',
      userInfo: '',
      userId: '',
      code: '', // 邀请码
      canReg: '',
      forums: ''

    }
  },
  // 从store中获取userid获取userinfo，但getters这个方法没起作用
  //
  computed: {
    // userId() {
    //   return this.$store.getters['session/get']('userId')
    // },
    // userInfo() {
    //   console.log(this.userId)
    //   const userInfo = this.$store.getters['jv/get'](`/users/${this.userId}`)
    //   console.log('userInfo', userInfo)
    //   userInfo.groupsName = userInfo.groups ? userInfo.groups[0].name : ''
    //   // this.setNum(userInfo)
    //   return userInfo
    // }
  },
  mounted() {
    this.isLoginh()
    this.userinfo()
    const { code } = this.$route.query
    if (code !== 'undefined') {
      this.code = code
    }
    this.forumh()
  },
  methods: {
    async forumh() {
      const params = {
        _jv: {
          type: 'forum'
        }
      }
      await this.$store.dispatch('jv/get', params).then(data => {
        console.log('forum data => ', data)
        this.forums = data
        if (this.forums && this.forums.set_reg && this.forums.set_reg.register_close) {
          this.canReg = false
        } else {
          this.canReg = true
        }
      })
    },
    isLoginh() {
      if (process.client) this.isLogin = !!window.localStorage.getItem('access_token')
      console.log(this.isLogin)
      console.log('userinfo', this.userInfo)
    },
    ExitLogin() {
      this.isLogin = window.localStorage.removeItem('access_token')
      this.$store.dispatch('session/logout').then(() => window.location.reload())
    },
    async userinfo() {
      this.userId = this.$store.getters['session/get']('userId')
      console.log('userid', this.userId)
      const params = {
        _jv: { type: `/users/${this.userId}` }
      }
      await this.$store.dispatch('jv/get', params).then(res => {
        console.log('userinfo', res)
        this.userInfo = res
        this.userInfo.groupsName = this.userInfo.groups ? this.userInfo.groups[0].name : ''
      })
    },
    registerurl() {
      this.$router.push(`/user/register?url='/'&validate=${this.forums.set_reg.register_validate}&code=${this.code}`)
    },
    jumptoperson() {
      this.$router.push(`/profile?userId=${this.userId}`)
    },
    loginurl() {
      this.$router.push('/user/login')
    },
    home() {
      this.$router.push('/')
    },
    jumpprofile() {
      this.$router.push('/my/profile')
    }
  }
}
</script>
<style lang="scss" scoped>
[v-cloak] {
  display: none !important;
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
    // display: flex;
    .logo {
      float: left;
      width: 150px;
      height: 35px;
      img {
        height: 100%;
      }
    }
    ::v-deep.h-search {
      margin-left: 30px;
      width: 298px;
      height: 36px;
      // border-radius: 0px;
      float: left;
      .el-input__inner {
        border-radius: 0px;
      }
      /* background: yellow; */
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
        width: 60px;
        height: 35px;
        padding: 0;
        border: none;
        background-color: #ffffff;
        color: #6d6d6d;
        font-size: 16px;
        /* margin-top: -5px; */
        margin-left: 30px;
      }
      .marleft {
        margin-left: 10px;
        overflow: hidden;
        text-overflow: ellipsis;
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
