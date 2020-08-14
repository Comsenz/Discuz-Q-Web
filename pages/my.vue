<template>
  <div class="app-cont">
    <!-- 这里弄个侧边栏，其他路由就分别是一个大矩形 -->
    <!-- <nuxt-link to="/my/">
      index
    </nuxt-link>
    <nuxt-link to="/my/profile">
      index
    </nuxt-link> -->

    <el-menu default-active="1">

      <el-menu-item
        index="1"
        class="margtop padd"
      >
        <span slot="title">{{ $t('profile.myprofile') }}<span class="arrow">></span></span>
      </el-menu-item>
      <el-menu-item
        index="3"
        class="padd"
      >

        <span slot="title">{{ $t('profile.mywallet') }}<span class="arrow">></span></span>
      </el-menu-item>
      <el-menu-item
        index="2"
        class="padd"
      >

        <span slot="title">{{ $t('profile.myfavorite') }}<span class="arrow">></span></span>
      </el-menu-item>
      <el-menu-item
        index="3"
        class="padd"
      >
        <span slot="title">{{ $t('profile.notice') }}<span class="arrow">></span></span>
      </el-menu-item>
      <el-menu-item
        index="4"
        class="padd"
      >
        <span slot="title">{{ $t('manage.circleinfo') }}<span class="arrow">></span></span>
      </el-menu-item>
      <el-menu-item
        index="5"
        class="padd"
      >
        <span slot="title">{{ $t('manage.siteManagement') }}<span class="arrow">></span></span>
      </el-menu-item>
    </el-menu>

    <el-container>
      <nuxt-child />
    </el-container>

  </div>
</template>

<script>
export default {
  data() {
    return {

    }
  }
}
</script>
<style lang='scss' scoped>
//@import url(); 引入公共css类
.app-cont {
  justify-content: flex-start;
  margin: 0;
  min-height: 0px;
  .margtop {
    margin-top: 20px;
  }
  .padd {
    padding-left: 47px !important;
    padding: 0 47px;

  }
  .arrow {
    // margin-left: 55px;
    position: absolute;
    right: 20px;
  }
  ::v-deep.el-menu-item.is-active{
    color: black;
    font-weight: bold;
    background: white;
  //  visibility: hidden;
  }
  ::v-deep.el-menu-item:focus, .el-menu-item:hover{
  background:white;
}
}
</style>
