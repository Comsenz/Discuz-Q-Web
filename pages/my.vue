<template>
  <div class="app-cont">
    <!-- 这里弄个侧边栏，其他路由就分别是一个大矩形 -->
    <el-menu
      :default-active="$route.path"
      :router="true"
    >
      <el-menu-item
        v-for="(item,index) in menuList"
        :key="item.index"
        :index="item.index"
        :class="item.classname"
        @click="currentInfo(index)"
      >
        <span
          slot="title"
          class="menu-title"
        >
          {{ $t(item.content) }}
          <span
            v-if="item.index === '/my/notice' && userInfo.unreadNotifications > 0"
            class="unread-notice"
          >{{ userInfo.unreadNotifications > 99 ? '99+' : userInfo.unreadNotifications }}</span>
        </span>
        <span :class="['arrow',isActive(index)]"><i class="el-icon-arrow-right icon" /></span>
      </el-menu-item>

    </el-menu>
    <nuxt-child class="my-main" />

  </div>
</template>

<script>
export default {
  name: 'UserCenter',
  data() {
    return {
      currentNumber: 0,
      menuList: [
        { index: '/my/profile', classname: 'padd', content: 'profile.myprofile' },
        { index: '/my/wallet', classname: 'padd', content: 'profile.mywallet' },
        { index: '/my/favorite', classname: 'padd', content: 'profile.myfavorite' },
        { index: '/my/shield', classname: 'padd', content: 'profile.myshield' },
        { index: '/my/notice', classname: 'padd', content: 'profile.notice' },
        { index: '/my/circleinfo', classname: 'padd divided', content: 'manage.circleinfo' }]
    }
  },
  computed: {
    forums() {
      return this.$store.state.site.info.attributes || {}
    },
    userId() {
      return this.$store.state.user.info.id
    },
    userInfo() {
      return this.$store.state.user.info.attributes || {}
    }
  },
  mounted() {
    this.initMenu()
    this.setCurrentRoute()
  },
  methods: {
    initMenu() {
      // 判断是否登录
      if (!this.userId) {
        this.$message.error(this.$t('core.not_authenticated'))
        this.$router.push('/')
      }
      const _other = this.forums && this.forums.other
      // 有成员列表和邀请的权限才显示成员管理
      if (_other.can_view_user_list || _other.can_create_invite) {
        this.menuList.push({ index: '/my/sitemanagement', classname: 'padd', content: 'manage.siteManagement' })
      } else {
        if (this.$route.path === '/my/sitemanagement') {
          this.$router.push({ path: '/my/profile' })
        }
      }
      // 有推广邀请的权限才显示
      if (_other.can_invite_user_scale) {
        this.menuList.push({ index: '/my/invite', classname: 'padd', content: 'invite.invite' })
      } else {
        if (this.$route.path === '/my/invite') {
          this.$router.push({ path: '/my/profile' })
        }
      }
    },
    setCurrentRoute() {
      this.currentNumber = this.switchCase(this.$route.path)
    },
    currentInfo(index) {
      this.currentNumber = index
      if (this.$route.path === this.menuList[index].index) {
        window.location.href = this.$route.path
      }
    },
    isActive(index) {
      this.currentNumber = this.switchCase(this.$route.path)
      return [this.currentNumber === index ? 'show' : 'hide']
    },
    switchCase(id) {
      switch (id) {
        case '/my/profile': return 0
        case '/my/wallet': return 1
        case '/my/favorite': return 2
        case '/my/shield': return 3
        case '/my/notice': return 4
        case '/my/circleinfo': return 5
        case '/my/sitemanagement': return 6
        case '/my/invite': return 7
        default: return 0
      }
    }
  }
}
</script>
<style lang='scss' scoped>
@import "@/assets/css/variable/color.scss";
.show {
  visibility: initial;
}
.hide {
  visibility: hidden;
}
.margtop {
  margin-top: 30px;
}
.app-cont {
  justify-content: flex-start;
  margin: 0;
  min-height: 0px;
  .el-menu {
    padding-top: 20px;
    border-radius: 5px 0;
    width:150px;
  }
  .padd {
    padding-left: 30px !important;
    padding: 0 65px;
    color:#6d6d6d;
    position: relative;
    @media screen and (max-width: 1005px) {
      padding: 0 40px;
    }
    &:hover{
      color:#00479b;
    }
  }
  .divided {
    border-top: 1px solid $border-color-base;
    margin-top: 15px;
    padding-top: 32px !important;
  }
  .arrow {
    position: absolute;
    // top:50%;
    right: 20px;
    // transform: translateY(-50%);
    color: #6d6d6d;
    @media screen and (max-width: 1005px) {
      right: 10px;
    }
    .icon {
      font-size: 12px;
    }
  }
  ::v-deep.el-menu-item {
    height: auto;
    line-height: 1;
    padding-top: 17px;
    padding-bottom: 17px;
  }
  ::v-deep.el-menu-item.is-active {
    color: black;
    font-weight: bold;
    background: white;
  }
  ::v-deep.el-menu-item:focus,
  .el-menu-item:hover {
    background: white;
  }
}
.menu-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  .unread-notice {
    font-size: 12px;
    color: #fff;
    background: #ff0000;
    padding: 1px 6px;
    margin-left: 2px;
    border-radius: 6px;
    font-weight: normal;
  }
}
.my-main {
  margin-top: 40px;
  width: 100%;
  min-height: 800px;
  flex: 1;
  overflow-x: auto;
  @media screen and (max-width: 1005px) {
    margin-top: 20px;
  }
}
</style>
