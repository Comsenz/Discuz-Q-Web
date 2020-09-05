<template>
  <div class="user-manage-container">
    <header v-if="forums" class="header flex">
      <div class="item">
        <div class="label">{{ $t('manage.userCount') }}</div>
        <div class="value">{{ forums.other && forums.other.count_users }}</div>
      </div>
      <div class="item">
        <div class="label">{{ $t('manage.disable') }}</div>
        <div class="value">75</div>
      </div>
      <div class="item">
        <div class="label">圈龄最高</div>
        <div class="value">75</div>
      </div>
      <div class="item">
        <div class="label">邀请加入率</div>
        <div class="value">75</div>
      </div>
    </header>
    <main>
      <el-tabs v-model="activeName">
        <el-tab-pane label="成员管理" name="manage"><users-manage /></el-tab-pane>
        <el-tab-pane label="邀请成员" name="invite"><invite-user /></el-tab-pane>
      </el-tabs>
    </main>
  </div>

</template>

<script>
export default {
  name: 'UserManage',
  data() {
    return {
      loading: false,
      activeName: 'manage'
    }
  },
  computed: {
    forums() {
      return this.$store.state.site.info.attributes
    }
  },
  mounted() {
    console.log('forums', this.forums)
  }
}
</script>
<style lang='scss' scoped>
@import '@/assets/css/variable/color.scss';
.user-manage-container{
  padding-right: 30px;
  .flex{
    display: flex;
    align-items: center;
  }
  .header{
    justify-content: space-between;
    .item{
      .label{
        font-size: 14px;
        color: #6D6D6D;
      }
      .value{
        font-size: 20px;
        margin-top: 10px;
      }
    }
  }
  .el-tabs ::v-deep{
    margin-top: 40px;
    .el-tabs__active-bar, .el-tabs__nav-wrap::after {
      height: 0;
    }
    .el-tabs__nav-wrap{
      border-bottom: 1px solid #E4E4E4;
      padding-bottom:5px;
    }
    .el-tabs__item{
      font-size: 18px;
      &.is-active{
        color:#000;
        font-size: 20px;
        font-weight:bold;
      }
    }
  }
}
</style>
