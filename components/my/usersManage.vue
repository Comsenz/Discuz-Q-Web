<template>
  <div class="user-manage">
    <div class="filter-cont">
      <!-- 筛选 -->
      <el-select
        v-model="selectedGroup"
        :placeholder="$t('profile.pleaseselect')"
        size="medium"
        @change="onChangeFilter"
      >
        <el-option
          :label="$t('manage.allIdentity')"
          value=""
        />
        <el-option
          v-for="item in groupList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <div class="content">
        <template v-if="!loading">
          <!-- <template v-if="searchText">{{ $t('manage.find') }}<span class="text-bold">"{{ searchText }}"</span>{{ $t('manage.searchResult', { total }) }}</template> -->
          {{ $t('manage.userTotal', { total }) }}
        </template>
      </div>
      <!-- 搜索 -->
      <el-input
        v-model="searchText"
        :placeholder="$t('manage.pleaseInputUserName')"
        class="search"
        size="medium"
        @keyup.enter.native="onClickSearch"
        @input="onClickSearch"
      >
        <i
          slot="suffix"
          class="el-icon-search el-input__icon"
        />
      </el-input>
      <!-- 批量操作 -->
      <el-select
        v-if="forums && forums.other && forums.other.can_edit_user_group"
        v-model="handleValue"
        :placeholder="$t('manage.batchOperate')"
        size="medium"
        class="el-select-margin"
        @change="onChangeGroup"
      >
        <el-option
          v-for="item in groupInviteList"
          :key="item.value"
          :label="$t('manage.set') + item.label"
          :value="item.value"
        />
      </el-select>
      <!-- 邀请链接 -->
      <el-dropdown v-if="forums && forums.other && forums.other.can_create_invite" class="handle-dropdown" placement="bottom" trigger="click" @command="handleCommand">
        <el-button type="primary" size="medium" class="create-url">{{ $t('manage.generateInvitationUrl') }}</el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-for="(item,index) in groupInviteList" :key="index" :command="item.value">{{ item.label + $t('manage.invitationUrl') }}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <el-table
      ref="multipleTable"
      v-loading="loading"
      :data="userList"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        width="35"
      />
      <el-table-column
        :label="$t('manage.userName')"
        min-width="100"
      >
        <template slot-scope="scope">
          <div class="flex">
            <avatar
              :user="{ id: scope.row.id, username: scope.row.username, avatarUrl: scope.row.avatarUrl}"
              :size="30"
              :round="true"
            />
            <nuxt-link
              :to="`/pages/profile/index?userId=${scope.row.id}`"
              class="user-name"
            >{{ scope.row.username }}</nuxt-link>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('manage.identity')">
        <template slot-scope="scope">{{ scope.row.groups && scope.row.groups.length > 0 && scope.row.groups[0] ? scope.row.groups[0].name : '' }}</template>
      </el-table-column>
      <el-table-column
        :label="$t('profile.status')"
        min-width="60"
      >
        <template slot-scope="scope">
          <template v-if="scope.row.status === 0">{{ $t('manage.normal') }}</template>
          <span
            v-else
            class="red"
          >{{ $t('manage.disable') }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('manage.circleAge')">
        <template slot-scope="scope">
          {{ scope.row.createdAt | formatDateDay }}
        </template>
      </el-table-column>
      <!-- <el-table-column
        :label="$t('manage.lastUpdateAt')"
        width="140"
      >
        <template slot-scope="scope">{{ scope.row.updatedAt | formatDate }}</template>
      </el-table-column> -->
      <el-table-column
        v-if="forums && forums.other && (forums.other.can_edit_user_group || forums.other.can_edit_user_status)"
        fixed="right"
        :label="$t('manage.operate')"
        width="80"
      >
        <template slot-scope="scope">
          <el-dropdown
            class="handle-dropdown"
            placement="bottom"
            trigger="click"
            @command="handleCommand"
          >
            <span class="el-dropdown-link">
              {{ $t('manage.modifyRole') }}
            </span>
            <el-dropdown-menu slot="dropdown">
              <template v-if="forums && forums.other && forums.other.can_edit_user_group">
                <el-dropdown-item
                  v-for="(item,index) in groupInviteList"
                  :key="index"
                  :command="{'userId':scope.row._jv.id, 'command':item.value}"
                >{{ $t('manage.set') + item.label }}</el-dropdown-item>
              </template>
              <el-dropdown-item
                v-if="forums && forums.other && forums.other.can_edit_user_status && scope.row.status === 0"
                :command="{'userId':scope.row._jv.id, 'command':'disable'}"
              >{{ $t('manage.disable') }}</el-dropdown-item>
              <el-dropdown-item
                v-else-if="forums && forums.other && forums.other.can_edit_user_status && scope.row.status === 1"
                :command="{'userId':scope.row._jv.id, 'command':'normal'}"
              >{{ $t('manage.cancelDisable') }}</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>
    <!-- <div v-if="!loading && userList.length <= 0" class="no-more">
      <svg-icon type="empty" class="empty-icon" />{{ $t('discuzq.list.noData') }}
    </div> -->
    <div class="pagination">
      <el-pagination
        background
        hide-on-single-page
        :pager-count="5"
        :current-page="pageNum"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        :layout="layout"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>
<script>
import handleError from '@/mixin/handleError'
import { time2MinuteOrHour, dateDay } from '@/utils/time'
export default {
  filters: {
    formatDate(date) {
      return time2MinuteOrHour(date)
    },
    formatDateDay(date) {
      return dateDay(date)
    }
  },
  mixins: [handleError],
  props: {
    groupInviteList: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      loading: false,
      selectedGroup: '', // 筛选项 选中的用户组
      groupId: [], // 用于接口的用户组数组
      groupList: [], // 用户组列表
      handleValue: '',
      pageNum: 1,
      pageSize: 10,
      total: 0,
      searchText: '',
      userList: [], // 用户列表
      selectedHandle: '', //  配置身份 选中的操作
      multipleSelection: [], // 多选
      layout: 'total, sizes, prev, pager, next, jumper',
      isPad: false
    }
  },
  computed: {
    forums() {
      return this.$store.state.site.info.attributes || {}
    },
    userInfo() {
      return this.$store.state.user.info.attributes || {}
    }
  },
  mounted() {
    this.getUserList()
    this.getGroupList()
  },
  methods: {
    // 获取用户组
    getGroupList() {
      this.$store.dispatch('jv/get', ['groups', { }]).then(res => {
        if (res && Array.isArray(res) && res.length > 0) {
          res.forEach(item => {
            this.groupList.push({
              label: item.name,
              value: item._jv.id
            })
          })
        }
      })
    },
    getUserList() {
      this.loading = true
      const params = {
        include: 'groups',
        'page[number]': this.pageNum,
        'page[limit]': this.pageSize,
        'filter[group_id][]': this.groupId,
        'filter[username]': `*${this.searchText}*`
      }
      this.$store.dispatch('jv/get', ['users', { params }]).then((res) => {
        if (res) {
          this.total = res._jv.json.meta.total
          this.userList = res
          this.reloadForums()
        }
      }, e => {
        this.handleError(e)
      }).finally(() => {
        this.loading = false
      })
    },
    // 刷新一下站点信息
    async reloadForums() {
      try {
        await this.$store.dispatch('site/getSiteInfo')
      } catch (err) {
        console.log('getuUserInfo err', err)
      }
    },
    onClickSearch() {
      this.reloadList()
    },
    // 过滤用户组
    onChangeFilter(e) {
      if (e) {
        this.groupId = [e]
      } else {
        this.groupId = []
      }
      this.reloadList()
    },
    reloadList() {
      this.pageNum = 1
      this.getUserList()
    },
    handleSizeChange(val) {
      this.pageNum = 1
      this.pageSize = val
      this.getUserList()
    },
    handleCurrentChange(val) {
      this.pageNum = val
      this.getUserList()
    },
    // 配置身份下拉框
    handleCommand(e) {
      if (e.command === 'disable' || e.command === 'normal') {
        const status = e.command === 'disable' ? 1 : 0
        this.modifyUserStatus(status, e.userId)
      } else {
        this.modifyUserGroup(e.command, e.userId)
      }
    },
    // 多选操作
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    // 批量操作
    onChangeGroup(val) {
      this.modifyUserGroup(val)
      this.handleValue = ''
    },
    // 编辑用户身份
    modifyUserGroup(groupId, userId) {
      if (this.forums && this.forums.other && !this.forums.other.can_edit_user_group) {
        return this.$message.error(this.$t('core.permission_denied'))
      }
      const data = []
      if (userId && groupId) {
        data.push({
          attributes: {
            id: userId,
            groupId: parseInt(groupId, 10)
          }
        })
      } else {
        if (this.multipleSelection && this.multipleSelection.length > 0) {
          for (let i = 0; i < this.multipleSelection.length; i += 1) {
            data.push({
              attributes: {
                id: this.multipleSelection[i].id,
                groupId: parseInt(groupId, 10)
              }
            })
          }
        } else {
          this.$message.error(this.$t('manage.selectUser'))
          return
        }
      }
      const params = [
        {
          _jv: {
            type: 'users'
          }
        },
        {
          data: {
            data
          }
        }
      ]
      this.loading = true
      this.$store.dispatch('jv/patch', params).then(res => {
        if (res) {
          if (res._jv && res._jv.json && res._jv.json.data && res._jv.json.data.length > 0 && res._jv.json.data[0].attributes && res._jv.json.data[0].attributes.error === 'Permission Denied') {
            return this.$message.error(this.$t('manage.modifyFail'))
          }
          this.$message.success(this.$t('discuzq.msgBox.modifySuccess'))
          this.getUserList()
        }
      }, e => {
        this.handleError(e)
      }).finally(() => {
        this.loading = false
      })
    },
    // 修改用户状态
    modifyUserStatus(status, userId) {
      // 是否有编辑用户的权限
      if (this.forums && this.forums.other && !this.forums.other.can_edit_user_status) {
        return this.$message.error(this.$t('core.permission_denied'))
      }
      // 不可以编辑自己
      if (+this.userInfo.id === +userId) {
        return this.$message.error(this.$t('core.no_edit_self'))
      }
      const params = {
        data: {
          attributes: {
            status: status
          }
        }
      }
      this.loading = true
      this.$store.dispatch('jv/patch', [{ _jv: { type: `users/${userId}` }}, { data: params }]).then(res => {
        if (res) {
          this.$message.success(this.$t('discuzq.msgBox.modifySuccess'))
          this.getUserList()
        }
      }, e => {
        this.handleError(e)
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>
<style lang="scss" scoped>
@import "@/assets/css/variable/color.scss";
.user-manage {
  overflow-x: auto;
}
.filter-cont {
  display: flex;
  align-items: center;
  .content {
    flex: 1;
    margin-left: 30px;
    @media screen and (max-width: 1005px) {
      margin-left: 5px;
      font-size: 12px;
    }
    .text-bold {
      font-weight: bold;
    }
  }
  .el-select {
    width: 120px;
    @media screen and (max-width: 1005px) {
      width: 110px;
    }
  }
  .el-select-margin{
    margin-left: 10px;
  }
  .el-input {
    width: 220px;
    @media screen and (max-width: 1005px) {
      width: 120px;
    }
  }
  .search {
    margin-left: 10px;
  }
}
.red {
  color: #fa5151;
}
.el-table {
  margin-top: 10px;
  ::v-deep thead th {
    color: #303133;
    background-color: #fafafa;
  }
}
.pagination {
  text-align: right;
  padding-top: 20px;
  padding-bottom: 20px;
  @media screen and (max-width: 1005px) {
    ::v-deep .el-pagination__sizes {
      display: none;
    }
  }
}
.handle-dropdown {
  .el-dropdown-link {
    color: #8590a6;
    cursor: pointer;
    &:hover {
      color: $color-blue-base;
    }
  }
}
.disable {
  cursor: no-drop;
  color: #8590a6;
}
::v-deep .el-dropdown-menu__item:not(.is-disabled):hover {
  background-color: transparent;
  color: $color-blue-base;
}
.no-more {
  margin-top: 40px;
}
.user-name {
  margin-left: 10px;
  &:hover {
    color: $color-blue-base;
  }
}
.flex {
  display: flex;
  align-items: center;
}
.create-url{
  padding:10px;
  margin-left: 10px;
}
</style>
