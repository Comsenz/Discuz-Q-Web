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
        <span slot="title">{{ $t(item.content) }}</span>
        <span :class="['arrow',isActive(index)]"><i class="el-icon-arrow-right icon" /></span>
      </el-menu-item>

    </el-menu>
    <nuxt-child class="my-main" />

  </div>
</template>

<script>
export default {
  name: 'UserCenter',
  // meta: {
  //   requiresAuth: true
  // },
  data() {
    return {
      currentNumber: 0,
      menuList: [{ index: '/my/profile', classname: 'padd', content: 'profile.myprofile' },
        { index: '/my/wallet', classname: 'padd', content: 'profile.mywallet' },
        { index: '/my/favorite', classname: 'padd', content: 'profile.myfavorite' },
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
    },
    setCurrentRoute() {
      console.log('routtttt', this.$route)
      this.currentNumber = this.switchCase(this.$route.path)
    },
    currentInfo(index) {
      this.currentNumber = index
    },
    isActive(index) {
      // console.log('ddddd', index)
      this.currentNumber = this.switchCase(this.$route.path)
      return [this.currentNumber === index ? 'show' : 'hide']
    },
    switchCase(id) {
      switch (id) {
        case '/my/profile': return 0
        case '/my/wallet': return 1
        case '/my/favorite': return 2
        case '/my/notice': return 3
        case '/my/circleinfo': return 4
        case '/my/sitemanagement': return 5
        default: return 0
      }
    }
  }
}
</script>
<style lang='scss' scoped>
//@import url(); 引入公共css类
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
  .el-menu{
    padding-top: 20px;
  }
  .padd {
    padding-left: 30px !important;
    padding: 0 65px;
    position: relative;
    @media screen and ( max-width: 1005px ) {
      padding: 0 40px;
    }
  }
  .divided{
    border-top:1px solid #EFEFEF;
    margin-top:15px;
  }
  .arrow {
    position: absolute;
    top:50%;
    right: 20px;
    transform: translateY(-50%);
    color: #6D6D6D;
    @media screen and ( max-width: 1005px ) {
      right: 10px;
    }
    .icon{
      font-size:12px;
    }
  }
  ::v-deep.el-menu-item {
    height: 46px;
    line-height: 46px;
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
.my-main{
  margin-top:40px;
  width:100%;
  min-height:800px;
  flex: 1;
  overflow-x: auto;
  @media screen and ( max-width: 1005px ) {
    margin-top:20px;
  }
}
</style>
