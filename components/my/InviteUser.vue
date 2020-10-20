<template>
  <div class="user-manage">
    <div class="filter-cont">
      <!-- 筛选 -->
      <el-select v-model="selectedStatus" :placeholder="$t('profile.pleaseselect')" size="medium" @change="reloadList">
        <el-option
          :label="$t('manage.allStatus')"
          value=""
        />
        <el-option
          v-for="item in statusList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <div class="content">
        <template v-if="!loading">
          <template>{{ $t('manage.total', { total }) }}</template>
        </template>
      </div>
      <el-dropdown class="handle-dropdown" placement="bottom" trigger="click" @command="handleCommand">
        <el-button type="primary" size="medium" class="create-url">{{ $t('manage.generateInvitationUrl') }}</el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-for="(item,index) in Object.keys(groupMap)" :key="index" :command="item">{{ groupMap[item] + $t('manage.invitationUrl') }}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <el-table ref="multipleTable" v-loading="loading" :data="inviteList" @selection-change="handleSelectionChange">
      <el-table-column prop="title" :label="$t('manage.urlType')" />
      <el-table-column prop="time" :label="$t('site.periodvalidity')" />
      <el-table-column :label="$t('profile.status')">
        <template slot-scope="scope">
          <span v-if="scope.row.status === 0" class="red"> {{ formatStatus(scope.row.status) }}</span>
          <template v-else>{{ formatStatus(scope.row.status) }}</template>
        </template>
      </el-table-column>
      <el-table-column :label="$t('manage.operate')" width="130">
        <template slot-scope="scope">
          <el-button type="text" :disabled="scope.row.status !== 1" class="btn" @click="deleteInvite(scope.row._jv.id)">{{ $t('manage.setInvalid') }}</el-button>
          <el-button type="text" :disabled="scope.row.status !== 1" class="btn" @click="copyLink(scope.row.code)">{{ $t('manage.share') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination">
      <el-pagination
        background
        hide-on-single-page
        :pager-count="5"
        :current-page="pageNum"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>
<script>
import handleError from '@/mixin/handleError'
import { timestamp2day } from '@/utils/time'
export default {
  mixins: [handleError],
  props: {
    groupMap: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      loading: false,
      selectedStatus: '', // 筛选项 选中的状态
      handleValue: '',
      pageNum: 1,
      pageSize: 10,
      total: 0,
      inviteList: [], // 邀请列表
      selectedHandle: '', //  配置身份 选中的操作
      multipleSelection: [], // 多选
      statusList: [{
        label: this.$t('manage.invalid'),
        value: 0
      }, {
        label: this.$t('manage.nouse'),
        value: 1
      }, {
        label: this.$t('manage.used'),
        value: 2
      }, {
        label: this.$t('manage.overdue'),
        value: 3
      }]
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
    this.getInviteList()
  },
  methods: {
    // 获取邀请列表
    getInviteList() {
      this.loading = true
      const params = {
        'page[number]': this.pageNum,
        'page[limit]': this.pageSize,
        'filter[status]': this.selectedStatus
      }
      this.$store.dispatch('jv/get', ['invite', { params }]).then((res) => {
        if (res) {
          this.total = res._jv.json.meta.total
          const list = res
          const _groupMap = this.groupMap
          if (list && list.length > 0) {
            list.forEach(item => {
              const day = timestamp2day(item.endtime)
              if (item.status === 1) {
                item.time = this.$t('manage.remainDay', { day })
              } else {
                item.time = this.$t('manage.remain0Day')
              }
              item.title = _groupMap[item.group_id] + this.$t('manage.invitationUrl')
            })
          }
          this.inviteList = list
        }
      }, e => {
        this.handleError(e)
      }).finally(() => {
        this.loading = false
      })
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
        this.reloadList()
      }, e => {
        this.handleError(e)
      }).finally(() => {
        this.loading = false
      })
    },
    // 删除链接
    deleteInvite(id) {
      if (this.loading) return
      const params = {
        _jv: {
          type: 'invite',
          id: id
        }
      }
      this.$confirm(this.$t('manage.confirmDelete'), this.$t('discuzq.msgBox.title'), {
        confirmButtonText: this.$t('discuzq.msgBox.confirm'),
        cancelButtonText: this.$t('discuzq.msgBox.cancel')
      }).then(_ => {
        this.loading = true
        this.$store.dispatch('jv/delete', params).then((res) => {
          this.$message.success(this.$t('discuzq.msgBox.operateSuccess'))
          this.reloadList()
        }, e => {
          this.handleError(e)
        }).finally(() => {
          this.loading = false
        })
      })
        .catch(_ => {})
    },
    // 复制链接到剪切板
    copyLink(code) {
      const oInput = document.createElement('input')
      if (process.client) {
        oInput.value = window.location.protocol + '//' + window.location.host + '/pages/site/partner-invite?code=' + code
        oInput.id = 'copyInput'
        document.body.appendChild(oInput)
        oInput.select()
        document.execCommand('Copy')
      }
      this.$message.success(this.$t('discuzq.msgBox.copySuccess'))
      setTimeout(() => {
        oInput.remove()
      }, 100)
    },
    // 重新加载列表
    reloadList() {
      this.pageNum = 1
      this.getInviteList()
    },
    // 分页
    handleSizeChange(val) {
      this.pageNum = 1
      this.pageSize = val
      this.getInviteList()
    },
    // 每一页的数量
    handleCurrentChange(val) {
      this.pageNum = val
      this.getInviteList()
    },
    // 格式化状态
    formatStatus(val) {
      if (this.statusList.find(item => item.value === val)) {
        return this.statusList.find(item => item.value === val).label
      }
    },
    handleCommand(command) {
      this.createAdminInvite(command)
    },
    // 多选操作
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    // 批量操作
    onChangeGroup(val) {
      this.modifyUserGroup(val)
      this.handleValue = ''
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/assets/css/variable/color.scss';
.filter-cont {
  display: flex;
  align-items: center;
  .content {
    flex: 1;
    margin-left: 10px;
  }
  .el-select {
    width: 140px;
  }
  .el-input {
    width: 220px;
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
  @media screen and ( max-width: 1005px ) {
    ::v-deep .el-pagination__sizes{
      display: none;
    }
  }
}
.btn{
  color: $font-color-grey;
  padding: 0;
  font-family: inherit;
  &:last-child{
    margin-left: 14px;
  }
}
::v-deep .el-dropdown-menu__item:not(.is-disabled):hover {
  background-color: transparent;
  color: $color-blue-base;
}
.no-more{
  margin-top: 40px;
}
.create-url{
  padding: 10px;
}
</style>
