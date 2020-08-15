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
      >{{ $t(item.content) }}
        <span :class="['arrow',isActive(index)]">></span>
      </el-menu-item>

    </el-menu>
    <nuxt-child style="margin-top:40px;margin-left:30px; width:100%" />

  </div>
</template>

<script>
export default {
  data() {
    return {
      currentNumber: 0,
      menuList: [
        { index: '/my/profile', classname: 'margtop padd', content: 'profile.myprofile' },
        { index: '/my/wallet', classname: 'padd', content: 'profile.mywallet' },
        { index: '/my/favorite', classname: 'padd', content: 'profile.myfavorite' },
        { index: '/my/notice', classname: 'padd', content: 'profile.notice' },
        { index: '/my/circleinfo', classname: 'margtop padd', content: 'manage.circleinfo' },
        { index: '/my/sitemanagement', classname: 'padd', content: 'manage.siteManagement' }]

    }
  },

  methods: {
    currentInfo(index) {
      this.currentNumber = index
    },
    isActive(index) {
      // console.log('ddddd', index)
      return [this.currentNumber === index ? 'show' : 'hide']
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
.margtop{
  margin-top: 30px;
}
.app-cont {
  justify-content: flex-start;
  margin: 0;
  min-height: 0px;
  .margtop {
    margin-top: 20px;
  }
  .padd {
    padding-left: 30px !important;
    padding: 0 65px;
  }
  .arrow {
    // margin-left: 55px;
    position: absolute;
    right: 20px;
    font-weight: 100;
    line-height: 57px;
    font-size: large;
    color: #303133;
  }
  ::v-deep.el-menu-item.is-active {
    color: black;
    font-weight: bold;
    background: white;
    font-family: MicrosoftYaHei-Bold;
    //  visibility: hidden;
  }
  ::v-deep.el-menu-item:focus,
  .el-menu-item:hover {
    background: white;
  }
}
</style>
