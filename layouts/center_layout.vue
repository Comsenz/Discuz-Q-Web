<template>
  <div class="global">
    <Header :key="this.$route.path" />
    <div class="app-container">
      <div class="app-cont">
        <el-menu :default-active="$route.path" :router="true">
          <template v-for="(item,index) in menuList">
            <template v-if="item.index === '/manage/index'">
              <el-menu-item
                v-if="forums && forums.other && (forums.other.can_view_user_list || forums.other.can_create_invite)"
                :key="item.index"
                :index="item.index"
                :class="item.classname"
                @click="currentInfo(index)"
              >
                <span slot="title" class="menu-title">{{ $t(item.content) }}</span>
                <span class="arrow"><i class="el-icon-arrow-right icon" /></span>
              </el-menu-item>
            </template>
            <template v-else-if="item.index === '/invite/index'">
              <el-menu-item
                v-if="forums && forums.other && forums.other.can_invite_user_scale"
                :key="item.index"
                :index="item.index"
                :class="item.classname"
                @click="currentInfo(index)"
              >
                <span slot="title" class="menu-title">{{ $t(item.content) }}</span>
                <span class="arrow"><i class="el-icon-arrow-right icon" /></span>
              </el-menu-item>
            </template>
            <template v-else>
              <el-menu-item
                v-if="!item.hidden"
                :key="item.index"
                :index="item.index"
                :class="item.classname"
                @click="currentInfo(index)"
              >
                <span slot="title" class="menu-title">{{ $t(item.content) }}
                  <span v-if="item.index === '/my/notice' && userInfo.unreadNotifications > 0" class="unread-notice">
                    {{ userInfo.unreadNotifications > 99 ? '99+' : userInfo.unreadNotifications }}
                  </span>
                </span>
                <span class="arrow"><i class="el-icon-arrow-right icon" /></span>
              </el-menu-item>
            </template>
          </template>
        </el-menu>
        <Nuxt class="my-main" />
      </div>
    </div>
    <Footer />
  </div>
</template>

<script>
export default {
  name: 'CenterLayout',
  data() {
    return {
      currentNumber: 0,
      menuList: [
        { index: '/my/profile', classname: 'padd', content: 'profile.myprofile', hidden: false },
        { index: '/my/wallet', classname: 'padd', content: 'profile.mywallet', hidden: false },
        { index: '/my/favorite', classname: 'padd', content: 'profile.myfavorite', hidden: false },
        { index: '/my/shield', classname: 'padd', content: 'profile.myshield', hidden: false },
        { index: '/my/notice', classname: 'padd', content: 'profile.notice', hidden: false },
        { index: '/site/index', classname: 'padd divided', content: 'manage.circleinfo', hidden: false },
        { index: '/manage/index', classname: 'padd', content: 'manage.siteManagement', hidden: false },
        { index: '/invite/index', classname: 'padd', content: 'invite.invite', hidden: false }
      ]
    }
  },
  computed: {
    forums() {
      const _forums = this.$store.state.site.info.attributes
      return _forums
    },
    userId() {
      return localStorage.getItem('user_id') || ''
    },
    userInfo() {
      return this.$store.state.user.info.attributes || {}
    }
  },
  mounted() {
    this.initMenu()
  },
  methods: {
    initMenu() {
      // 判断是否登录
      if (!this.userId) {
        this.$message.error(this.$t('core.not_authenticated'))
        this.$router.push('/')
        return
      }
    },
    currentInfo(index) {
      this.currentNumber = index
      if (this.$route.path === this.menuList[index].index) {
        window.location.href = this.$route.path
      }
    }
  },
  head() {
    return {
      link: [
        { rel: 'icon', type: 'image/x-icon', href: this.forums && this.forums.set_site && this.forums.set_site.site_favicon || '/favicon.ico' }
      ]
    }
  }
}
</script>
<style lang="scss" scoped>
@import "@/assets/css/variable/color.scss";
  .app-container {
    width: 1005px;
    background: #F4F5F6;
    margin: 15px auto 0;
    @media screen and ( max-width: 1005px ) {
      width: 100%;
      min-width: 768px;
      padding: 0 14px;
    }
    .app-cont {
      width: 100%;
      min-height: calc(100vh - 65px - 80px - 15px);
      display: flex;
      background: rgba(255, 255, 255, 1);
      box-shadow: 0 3px 3px rgba(0, 0, 0, 0.03);
      border-radius: 5px;
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
        display:none;
        @media screen and (max-width: 1005px) {
          right: 10px;
        }
        .icon {
          font-size: 12px;
        }
      }
      .is-active .arrow{
        display: block;
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
    }
  }

</style>
