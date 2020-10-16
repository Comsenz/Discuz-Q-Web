<template>
  <div class="user-manage">
    <div class="filter-cont">
      <!-- 筛选 -->
      <div class="content">
        <template v-if="!loading">
          {{ $t('invite.incomeTotal') }}
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
        :data="incomeList"
        :default-sort="{prop: 'created_at', order: 'descending'}"
        @sort-change="sortChange"
      >
        <el-table-column :label="$t('invite.inviteUserName')">
          <template slot-scope="scope">
            <div
              v-if="scope.row.sourceUser && scope.row.sourceUser.username"
              class="flex"
            >
              <avatar
                :user="{ id: scope.row.sourceUser.id, username: scope.row.sourceUser.username, avatarUrl: scope.row.sourceUser.avatarUrl}"
                :size="30"
                :round="true"
              />
              <nuxt-link
                :to="`/pages/profile/index?userId=${scope.row.sourceUser.id}`"
                class="user-name"
              >{{ scope.row.sourceUser.username }}</nuxt-link>
            </div>
            <template v-else>{{ $t('core.userDeleted') }}</template>
          </template>
        </el-table-column>
        <el-table-column
          prop="created_at"
          :label="$t('invite.incomeAt')"
          sortable="custom"
        >
          <template slot-scope="scope">
            {{ scope.row.created_at | formatDate }}
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('invite.income')"
          width="100"
        >
          <div
            slot-scope="scope"
            class="last-table"
          >
            {{ $t('post.yuanItem') + scope.row.change_available_amount }}
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
  filters: {
    formatDate(date) {
      return time2MinuteOrHour(date)
    }
  },
  mixins: [handleError],
  props: {
    // 用户组
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
      pageNum: 1,
      pageSize: 10,
      searchText: '',
      sort: '-created_at', // 排序 默认创建时间倒序
      total: 0,
      incomeList: [],
      totalMoney: 0 // 累计收益
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
  mounted() {
    this.getIncomeList()
  },
  methods: {
    // 收益列表
    getIncomeList() {
      this.loading = true
      const params = {
        include: 'sourceUser',
        'filter[user]': this.userId,
        'filter[change_type]': '33, 62, 34',
        'page[number]': this.pageNum,
        'page[limit]': this.pageSize,
        'filter[source_username]': this.searchText,
        'sort': this.sort
      }
      this.$store.dispatch('jv/get', ['wallet/log', { params }]).then(res => {
        if (res && res._jv && res._jv.json && res._jv.json.meta) {
          this.totalMoney = res._jv.json.meta.sumChangeAvailableAmount
          this.total = res._jv.json.meta.total
          delete res._jv
        }
        this.incomeList = res
      }, e => {
        this.handleError(e)
      }).finally(() => {
        this.loading = false
      })
    },
    // 普通用户邀请
    createUserInvite() {
      const _can_invite_user_scale = this.forums && this.forums.other && this.forums.other.can_invite_user_scale
      if (!_can_invite_user_scale) {
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
      }, e => {
        this.handleError(e)
      }).finally(() => {
        this.loading = false
      })
    },
    /**
     * 复制链接
     * @param {*} code 邀请码
     * @example:
     * copyLink('https://discuz.chat/pages/site/partner-invite?code=1178')
     */
    copyLink(code) {
      const oInput = document.createElement('input')
      if (process.client) {
        oInput.value = window.location.host + '/pages/site/partner-invite?code=' + code
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
      this.getIncomeList()
    },
    // 搜索
    onClickSearch() {
      this.pageNum = 1
      this.getIncomeList()
    },
    // 分页
    handleSizeChange(val) {
      this.pageNum = 1
      this.pageSize = val
      this.getIncomeList()
    },
    // 更换每一页数量
    handleCurrentChange(val) {
      this.pageNum = val
      this.getIncomeList()
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
    color: #606266;
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
