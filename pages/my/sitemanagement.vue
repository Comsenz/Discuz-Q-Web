<template>
  <div class="user-manage-container">
    <header v-if="forums" class="header flex">
      <div class="item">
        <div class="label">{{ $t('manage.userCount') }}</div>
        <div class="value">{{ forums.other && forums.other.count_users }}</div>
      </div>
      <!-- <div class="item">
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
      </div> -->
      <div v-if="forums && forums.other && forums.other.can_create_invite" class="item item-invite">
        <div class="label">{{ $t('manage.inviteMembers') }}</div>
        <el-dropdown class="handle-dropdown" placement="bottom" trigger="click" disabled @command="handleCommand">
          <el-button type="text" size="medium" class="create-url">{{ $t('manage.generateInvitationUrl') }}</el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-for="(item,index) in Object.keys(groupMap)" :key="index" :command="item">{{ groupMap[item] + $t('manage.invitationUrl') }}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </header>
    <main>
      <el-tabs v-model="activeName">
        <el-tab-pane v-if="forums && forums.other && forums.other.can_view_user_list" :label="$t('manage.manageMembers')" name="manage"><users-manage /></el-tab-pane>
        <el-tab-pane v-if="forums && forums.other && forums.other.can_create_invite" :label="$t('manage.inviteMembers')" name="invite"><invite-user v-if="activeName === 'invite'" :group-map="groupMap" /></el-tab-pane>
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
      activeName: 'manage',
      groupMap: {}
    }
  },
  computed: {
    forums() {
      return this.$store.state.site.info.attributes
    }
  },
  mounted() {
    this.getGroupList()
    this.reloadForums()
  },
  methods: {
    async reloadForums() {
      try {
        await this.$store.dispatch('site/getSiteInfo')
      } catch (err) {
        console.log('getuUserInfo err', err)
      }
    },
    // 获取用户组
    getGroupList() {
      const params = {
        'filter[type]': 'invite'
      }
      this.$store.dispatch('jv/get', ['groups', { params }]).then(res => {
        if (res && res.length > 0) {
          const groupMap = {}
          res.forEach(item => {
            groupMap[item._jv.id] = item.name
          })
          this.groupMap = groupMap
        }
      }, e => {
        this.handleError(e)
      })
    },
    handleCommand(command) {
      this.createAdminInvite(command)
    },
    // 管理员创建邀请链接
    createAdminInvite(groupId) {
      if (this.loading) return
      this.loading = true
      const params = {
        data: {
          attributes: {
            group_id: groupId
          }
        }
      }
      this.$store.dispatch('jv/post', [{ _jv: { type: 'invite' }}, { data: params }]).then((res) => {
        this.$message.success(this.$t('discuzq.msgBox.createSuccess'))
        if (res) {
          this.copyLink(res.code)
        }
      }, e => {
        this.handleError(e)
      }).finally(() => {
        this.loading = false
      })
    },
    copyLink(code) {
      const oInput = document.createElement('input')
      if (process.client) {
        oInput.value = window.location.host + '/site/partner-invite?code=' + code
        oInput.id = 'copyInput'
        document.body.appendChild(oInput)
        oInput.select()
        document.execCommand('Copy')
      }
      // this.$message.success(this.$t('discuzq.msgBox.copySuccess'))
      setTimeout(() => {
        oInput.remove()
      }, 100)
    }
  }
}
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
    margin-top: 40px;
    .el-tabs__active-bar, .el-tabs__nav-wrap::after {
      height: 0;
    }
    .el-tabs__nav-wrap{
      border-bottom: 1px solid #E4E4E4;
      padding-bottom:5px;
    }
    .el-tabs__item{
      font-size: 16px;
      color: #B5B5B5;
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
  ::v-deep .el-dropdown-menu__item:not(.is-disabled):hover {
    background-color: transparent;
    color: $color-blue-base;
  }
}
</style>
