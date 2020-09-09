<template>
  <div class="user-manage">
    <div class="filter-cont">
      <!-- 筛选 -->
      <el-select v-model="selectedGroup" :placeholder="$t('profile.pleaseselect')" size="medium" @change="onChangeFilter">
        <el-option :label="$t('manage.allIdentity')" value="" />
        <el-option
          v-for="item in groupList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <div class="content">
        <template v-if="!loading">
          <template v-if="searchText">{{ $t('manage.searchResult', { searchText, total }) }}</template>
          <template v-else>{{ $t('manage.userTotal', { total }) }}</template>
        </template>
      </div>
      <!-- 搜索 -->
      <el-input v-model="searchText" :placeholder="$t('manage.pleaseInputUserName')" class="search" size="medium" @keyup.enter.native="onClickSearch">
        <i slot="suffix" class="el-icon-search el-input__icon" />
      </el-input>
      <!-- 批量操作 -->
      <el-select v-model="handleValue" :placeholder="$t('manage.batchOperate')" :disabled="forums && forums.other && !forums.other.can_edit_user_group" size="medium" @change="onChangeGroup">
        <el-option
          v-for="item in groupList"
          :key="item.value"
          :disabled="item.value === '7'"
          :label="$t('manage.set') + item.label"
          :value="item.value"
        />
      </el-select>
    </div>
    <el-table v-if="userList.length > 0" ref="multipleTable" v-loading="loading" :data="userList" style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="35" />
      <el-table-column :label="$t('manage.userName')" min-width="100">
        <template slot-scope="scope">
          <div class="flex">
            <avatar :user="{ username: scope.row.username, avatarUrl: scope.row.avatarUrl}" :size="30" :round="true" />
            <span class="user-name">{{ scope.row.username }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('manage.identity')">
        <template slot-scope="scope">{{ scope.row.groups && scope.row.groups.length > 0 && scope.row.groups[0] ? scope.row.groups[0].name : '' }}</template>
      </el-table-column>
      <el-table-column :label="$t('profile.status')" min-width="60">
        <template slot-scope="scope">
          <template v-if="scope.row.status === 0">{{ $t('manage.normal') }}</template>
          <span v-else class="red">{{ $t('manage.disable') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="圈龄">
        <template slot-scope="scope">
          {{ scope.row.createdAt | formatDateDay }}
        </template>
      </el-table-column>
      <!-- <el-table-column label="加入方式" /> -->
      <el-table-column label="最后发言时间" width="140">
        <template slot-scope="scope">{{ scope.row.updatedAt | formatDate }}</template>
      </el-table-column>
      <el-table-column fixed="right" :label="$t('manage.operate')" width="80">
        <template slot-scope="scope">
          <span v-if="forums && forums.other && !forums.other.can_edit_user_group" class="disable">{{ $t('manage.modifyRole') }}</span>
          <el-dropdown v-else class="handle-dropdown" placement="bottom" trigger="click" disabled @command="handleCommand">
            <span class="el-dropdown-link">
              {{ $t('manage.modifyRole') }}
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-for="(item,index) in groupList" :key="index" :command="{'userId':scope.row._jv.id, 'command':item.value}" :disabled="item.value === '7' ">{{ $t('manage.set') + item.label }}</el-dropdown-item>
              <el-dropdown-item v-if="userInfo && userInfo.canEdit && scope.row.status === 0" :command="{'userId':scope.row._jv.id, 'command':'disable'}">{{ $t('manage.disable') }}</el-dropdown-item>
              <el-dropdown-item v-else-if="userInfo && userInfo.canEdit && scope.row.status === 1" :command="{'userId':scope.row._jv.id, 'command':'normal'}">{{ $t('manage.cancelDisable') }}</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>
    <div v-if="!loading && userList.length <= 0" class="no-more">
      <svg-icon type="empty" class="empty-icon" />{{ $t('discuzq.list.noData') }}
    </div>
    <div class="pagination">
      <el-pagination
        background
        hide-on-single-page
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
import { formatDate, dateDay } from '@/utils/time'
export default {
  filters: {
    formatDate(date) {
      return formatDate(date, 'yyyy-MM-dd hh:mm')
    },
    formatDateDay(date) {
      return dateDay(date)
    }
  },
  mixins: [handleError],
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
    // window.onresize = () => {
    //   if (document.documentElement.clientWidth < 1050 && document.documentElement.clientWidth >= 768) {
    //     this.isPad = true
    //     this.layout = 'prev, pager, next'
    //   } else {
    //     this.isPad = false
    //     this.layout = 'total, sizes, prev, pager, next, jumper'
    //   }
    // }
  },
  methods: {
    // 获取用户组
    getGroupList() {
      const params = {}
      this.$store.dispatch('jv/get', ['groups', { params }]).then(res => {
        res.forEach(item => {
          this.groupList.push({
            label: item.name,
            value: item._jv.id
          })
        })
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
        }
      }, e => {
        this.handleError(e)
      }).finally(() => {
        this.loading = false
      })
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
          this.$message.success('修改成功')
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
          this.$message.success('修改成功')
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
.user-manage{
  overflow-x: auto;
}
.filter-cont {
  display: flex;
  align-items: center;
  .content {
    flex: 1;
    margin-left: 10px;
  }
  .el-select {
    width: 140px;
    @media screen and ( max-width: 1005px ) {
      width: 120px;
    }
  }
  .el-input {
    width: 220px;
    @media screen and ( max-width: 1005px ) {
      width: 140px;
    }
  }
  .search {
    margin-right: 10px;
  }
}
.red{
  color: #fa5151;
}
.el-table{
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
}
.handle-dropdown{
  .el-dropdown-link{
    color: #8590A6;
    cursor: pointer;
  }
}
.disable{
  cursor: no-drop;
  color: #8590A6;
}
::v-deep .el-dropdown-menu__item:not(.is-disabled):hover {
  background-color: transparent;
  color: #409EFF;
}
.no-more{
  margin-top: 40px;
}
.user-name{
  margin-left: 10px;
}
.flex{
  display: flex;
  align-items: center;
}
</style>
