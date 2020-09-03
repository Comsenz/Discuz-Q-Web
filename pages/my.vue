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
    <nuxt-child style="margin-top:40px;margin-left:30px; width:100%;min-height:800px; " />

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
      menuList: [
        { index: '/my/profile', classname: 'padd', content: 'profile.myprofile' },
        { index: '/my/wallet', classname: 'padd', content: 'profile.mywallet' },
        { index: '/my/favorite', classname: 'padd', content: 'profile.myfavorite' },
        { index: '/my/notice', classname: 'padd', content: 'profile.notice' },
        { index: '/my/circleinfo', classname: 'padd divided', content: 'manage.circleinfo' },
        { index: '/my/sitemanagement', classname: 'padd', content: 'manage.siteManagement' }]

    }
  },
  created() {
    this.setCurrentRoute()
  },
  methods: {
    setCurrentRoute() {
      console.log('routtttt', this.$route)
      this.currentNumber = this.switchCase(this.$route.path)
    },
    currentInfo(index) {
      this.currentNumber = index
    },
    isActive(index) {
      // console.log('ddddd', index)
      return [this.currentNumber === index ? 'show' : 'hide']
    },
    switchCase(id) {
      switch (id) {
        case '/my/profile': return 0
        case '/my/wallet': return 1
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
</style>
