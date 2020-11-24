<template>
  <div class="user-manage">
    <div class="filter-cont">
      <!-- 筛选 -->
      <div class="content">
        <template v-if="!loading">
          {{ $t('invite.inviteTotal') }}
          <span class="bold">{{ inviteTotal }}</span>
          {{ $t('invite.people') }}
          {{ $t('invite.allIncome') }}
          <span class="bold">{{ $t('post.yuanItem') + totalMoney }}</span>
        </template>
      </div>
      <!-- 搜索 -->
      <el-input
        v-model="searchText"
        :placeholder="$t('invite.searchPlaceholder')"
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
      <el-button
        type="primary"
        size="medium"
        class="create-url"
        @click="createUserInvite"
      >{{ $t('manage.generateInvitationUrl') }}</el-button>
    </div>
    <div class="main">
      <el-table
        ref="multipleTable"
        v-loading="loading"
        :data="inviteList"
        :default-sort="{prop: 'created_at', order: 'descending'}"
        @sort-change="sortChange"
      >
        <el-table-column :label="$t('invite.inviteUserName')">
          <template slot-scope="scope">
            <div
              v-if="scope.row.user"
              class="flex"
            >
              <avatar
                :user="{ id: scope.row.user.id, username: scope.row.user.username, avatarUrl: scope.row.user.avatarUrl}"
                :size="30"
                :round="true"
              />
              <nuxt-link
                :to="`/user/${scope.row.user.id}`"
                class="user-name"
              >{{ scope.row.user.username }}</nuxt-link>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="created_at"
          :label="$t('invite.createdAt')"
          sortable="custom"
        >
          <template slot-scope="scope">
            {{ scope.row.created_at | formatDate }}
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('manage.operate')"
          width="100"
        >
          <div
            slot-scope="scope"
            class="last-table"
          >
            <el-button
              type="text"
              class="btn"
              @click="viewDetail(scope.row)"
            >{{ $t('invite.viewDetail') }}</el-button>
          </div>
        </el-table-column>
      </el-table>
    </div>
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
import { time2MinuteOrHour } from '@/utils/time'
export default {
  name: 'Invited',
  filters: {
    formatDate(date) {
      return time2MinuteOrHour(date)
    }
  },
  mixins: [handleError],
  props: {
    groupMap: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      loading: false,
      selectedStatus: '', // 筛选项 选中的状态
      handleValue: '',
      pageNum: 1,
      pageSize: 10,
      searchText: '',
      sort: '-created_at',
      inviteTotal: 0,
      totalMoney: 0,
      total: 0,
      inviteList: [] // 邀请列表
    }
  },
  computed: {
    userId() {
      return this.$store.state.user.info.id
    },
    forums() {
      return this.$store.state.site.info.attributes || {}
    }
  },
  watch: {
    userId(val) {
      if (val && this.totalMoney === 0) {
        this.getIncome()
      }
    }
  },
  mounted() {
    this.getInvite()
    this.getIncome()
    this.getInviteList()
  },
  methods: {
    // 获取成功邀请人数统计
    getInvite() {
      const params = {
        'page[number]': 1,
        'page[limit]': 1
      }
      this.$store.dispatch('jv/get', ['invite/users', { params }]).then((res) => {
        if (res && res._jv && res._jv.json && res._jv.json.meta) {
          this.inviteTotal = res._jv.json.meta.total
        }
      })
    },
    // 获取累计收益
    getIncome() {
      if (!this.userId) return
      const params = {
        'filter[user]': this.userId,
        'filter[change_type]': '33, 62, 34',
        'page[number]': 1,
        'page[limit]': 1
      }
      this.$store.dispatch('jv/get', ['wallet/log', { params }]).then((res) => {
        if (res && res._jv && res._jv.json && res._jv.json.meta) {
          this.totalMoney = res._jv.json.meta.sumChangeAvailableAmount
        }
      })
    },
    // 获取邀请列表
    getInviteList() {
      this.loading = true
      const params = {
        'page[number]': this.pageNum,
        'page[limit]': this.pageSize,
        'filter[username]': this.searchText,
        sort: this.sort
      }
      this.$store.dispatch('jv/get', ['invite/users', { params }]).then((res) => {
        if (res) {
          this.inviteList = res
          if (res._jv && res._jv.json && res._jv.json.meta) {
            this.total = res._jv.json.meta.total
          }
        }
      }, (e) => {
        this.handleError(e)
      })
        .finally(() => {
          this.loading = false
        })
    },
    // 普通用户邀请
    createUserInvite() {
      const canInviteUserScale = this.forums && this.forums.other && this.forums.other.can_invite_user_scale
      if (!canInviteUserScale) {
        return this.$message.error(this.$t('core.permission_denied'))
      }
      const params = {
        _jv: {
          type: 'userInviteCode'
        }
      }
      this.$store.dispatch('jv/get', params).then((res) => {
        if (res && res._jv) {
          this.copyLink(res._jv.code)
        }
      }, (e) => {
        this.handleError(e)
      })
        .finally(() => {
          this.loading = false
        })
    },
    // 查看详情
    viewDetail(item) {
      this.$emit('view-detail', item)
    },
    // 复制
    copyLink(code) {
      const oInput = document.createElement('input')
      if (process.client) {
        oInput.value = `${window.location.protocol}//${window.location.host}/site/partner-invite?code=${code}`
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
    // 排序
    sortChange(val) {
      const { order } = val
      if (order === 'descending') {
        this.sort = '-created_at'
      } else if (order === 'ascending') {
        this.sort = 'created_at'
      } else {
        this.sort = ''
      }
      this.getInviteList()
    },
    // 搜索
    onClickSearch() {
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
    }
  }
}
</script>
<style lang="scss" scoped>
@import "@/assets/css/variable/color.scss";
.filter-cont {
  display: flex;
  align-items: center;
  .content {
    flex: 1;
    margin-left: 10px;
    color: #777777;
    .bold{
      color: #000;
      font-weight: bold;
    }
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
.main {
  min-height: 500px;
}
.el-table {
  margin-top: 10px;
  ::v-deep thead th {
    color: #303133;
    background-color: #fafafa;
    &:nth-last-child(2) {
      text-align: right;
    }
  }
  .last-table {
    text-align: right;
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
.btn {
  color: $font-color-grey;
  padding: 0;
  font-family: inherit;
  &:last-child {
    margin-left: 14px;
  }
  &:hover {
    color: $color-blue-base;
  }
}
.no-more {
  margin-top: 40px;
}
.flex {
  display: flex;
  align-items: center;
}
.user-name {
  margin-left: 10px;
  &:hover {
    color: $color-blue-base;
  }
}
.create-url {
  background: $color-blue-base;
  transition: all 0.2s ease-in-out;
  &:hover {
    background: $color-blue-deep;
    border: 1px solid $color-blue-deep;
  }
}
</style>
