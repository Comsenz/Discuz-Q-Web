<template>
  <div class="user-manage-container">
    <main>
      <el-tabs v-if="forums && forums.other" v-model="activeName">
        <!-- 没有查看成员列表或有查看列表权限，但是没有编辑用户组和状态的权限，就隐藏 -->
        <el-tab-pane
          v-if="forums.other.can_edit_user_group || forums.other.can_edit_user_status"
          :label="$t('manage.manageMembers')"
          name="manage"
        ><users-manage :group-invite-list="groupInviteList" /></el-tab-pane>
        <el-tab-pane
          v-if="forums.other.can_create_invite"
          :label="$t('manage.inviteMembers')"
          name="invite"
        ><invite-user v-if="activeName ==='invite'" :group-map="groupMap" /></el-tab-pane>
      </el-tabs>
    </main>
  </div>

</template>

<script>
import head from '@/mixin/head';
export default {
  layout: 'center_layout',
  name: 'UserManage',
  mixins: [head],
  data() {
    return {
      title: this.$t('manage.siteManagement'),
      loading: false,
      activeName: 'manage',
      groupMap: {},
      groupInviteList: []
    };
  },
  computed: {
    forums() {
      return this.$store.state.site.info.attributes;
    }
  },
  watch: {
    forums: {
      handler() {
        if (this.forums && this.forums.other) {
          if (!this.forums.other.can_edit_user_group && !this.forums.other.can_edit_user_status) {
            this.activeName = 'invite';
          }
        }
      },
      deep: true
    }
  },
  mounted() {
    this.getGroupList();
    // 没有编辑用户组和状态的权限，就显示另一个tab
    if (this.forums && this.forums.other) {
      if (!this.forums.other.can_edit_user_group && !this.forums.other.can_edit_user_status) {
        this.activeName = 'invite';
      }
    }
  },
  methods: {
    // 获取用户组 去除管理员和游客
    getGroupList() {
      const params = {
        'filter[type]': 'invite'
      };
      this.$store.dispatch('jv/get', ['groups', { params }]).then((res) => {
        if (res && res.length > 0) {
          const groupMap = {};
          this.groupInviteList = [];
          res.forEach((item) => {
            groupMap[item._jv.id] = item.name;
            this.groupInviteList.push({
              label: item.name,
              value: item._jv.id
            });
          });
          this.groupMap = groupMap;
        }
      }, (e) => {
        this.handleError(e);
      });
    }
  }
};
</script>
<style lang='scss' scoped>
@import '@/assets/css/variable/color.scss';
.user-manage-container{
  padding: 0 30px;
  @media screen and ( max-width: 1005px ) {
    padding: 0 15px;
  }
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
    .item-invite{
      text-align:right;
    }
  }
  .el-tabs ::v-deep{
    .el-tabs__active-bar, .el-tabs__nav-wrap::after {
      height: 0;
    }
    .el-tabs__nav-wrap{
      border-bottom: 1px solid $line-color-base;
      padding-bottom:5px;
    }
    .el-tabs__item{
      font-size: 16px;
      color: #B5B5B5;
      min-width: 92px;
      &.is-active{
        color:#000;
        font-size: 18px;
        font-weight:bold;
      }
    }
    .el-tabs__header .el-tabs__item:hover {
      color: $color-blue-deep;
    }
  }
}
</style>
