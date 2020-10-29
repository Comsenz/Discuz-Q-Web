<template>
  <div class="freezeAmount">
    <div v-if="total3 > 0">
      <!-- 冻结金额。表格 -->
      <el-table
        v-loading="loading"
        :data="freezelist"
      >
        <el-table-column
          type="selection"
          width="40"
        />
        <el-table-column
          prop="id"
          label="ID"
          width="55"
        />
        <el-table-column
          prop="change_desc"
          :label="$t('profile.desc')"
        >
          <template slot-scope="scope">
            <span class="desc">{{ scope.row.change_desc }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('profile.time')"
          width="140"
          prop="created_at"
          :formatter="dateFormat"
        />
        <el-table-column
          :label="$t('pay.sumOfMoney')"
          width="113"
          sortable
          :sort-method="sortAmount"
        >
          <template slot-scope="scope">
            <span
              style="font-size:16px;"
              v-html="$xss(amountFormat(scope.row.change_freeze_amount))"
            />
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页器 -->
      <el-pagination
        background
        :pager-count="5"
        :current-page="pageNum3"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="pageSize3"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total3"
        class="pagination"
        @size-change="handleSizeChange3"
        @current-change="handleCurrentChange3"
      />
    </div>
    <template v-else>
      <div
        v-if="hasMore"
        class="load-more"
        @click="loadMore"
      >{{ $t('topic.showMore') }}</div>
      <div
        v-else
        class="no-more"
      >
        <svg-icon
          v-if="freezelist.length === 0"
          type="empty"
          class="empty-icon"
        />{{ freezelist.length > 0 ? $t('discuzq.list.noMoreData') : $t('discuzq.list.noData') }}
      </div>
    </template>
  </div>
</template>

<script>
import { time2MinuteOrHour } from '@/utils/time'
import handleError from '@/mixin/handleError'
export default {
  mixins: [
    handleError
  ],
  data() {
    return {
      loading: false,
      hasMore: false,
      value: '', // 提现记录被选择到的类型id
      pageSize3: 10, // 冻结每页展示的数目
      pageNum3: 1, // 冻结当前页数
      freeze_amount: '',
      filterSelected3: '', // 冻结状态过滤内容的id
      freezelist: [], // 冻结金额
      total3: 0, // 冻结金额记录总记录数
      userId: this.$store.getters['session/get']('userId'), // 获取当前登陆用户的ID
      userInfo: '',
      walletFreeze: 0

    }
  },
  mounted() {
    this.getUserInfo()
    this.getFreezelist()
  },
  methods: {
    // 用户信息
    getUserInfo() {
      this.userInfo = this.$store.state.user.info.attributes
      this.walletFreeze = this.userInfo ? this.userInfo.walletFreeze : 0
    },
    // 冻结金额状态筛选类型
    confirm3(e) {
      this.filterSelected3 = e
      this.getFreezelist('filter')
    },
    // 金额格式化
    amountFormat(row) {
      // 订单
      if (row.amount > 0) {
        return `<font color="09BB07">-￥${row.amount}</font>`
      }
      if (row > 0) {
        return `<font color="09BB07">+￥${row}</font>`
      }
      return `<font style="color:#FA5151">-￥${row.substr(1)}</font>`
    },
    // 获取冻结金额列表数据
    getFreezelist() {
      this.loading = true
      const params = {
        'filter[user]': this.userId,
        'filter[change_type]': '10,11,12,81,9,8', // 10提现冻结 11提现成功 12 提现解冻
        'page[number]': this.pageNum3,
        'page[limit]': this.pageSize3
      }
      this.$store.dispatch('jv/get', ['wallet/log', { params }]).then((res) => {
        this.total3 = res._jv.json.meta.total
        this.freezelist = res
      }, (e) => {
        this.handleError(e)
      })
        .finally(() => {
          this.loading = false
        })
    },
    // 金额排序
    sortAmount(str1, str2) {
      return (str1.change_available_amount * 1) - (str2.change_available_amount * 1)
    },
    // 时间格式化
    dateFormat(row) {
      return this.timeHandle(row.created_at)
    },
    // 处理时间
    timeHandle(time) {
      return time2MinuteOrHour(time)
    },
    // 冻结金额分页
    handleSizeChange3(val) {
      this.pageNum3 = 1
      this.pageSize3 = val
      this.getFreezelist()
    },
    // 冻结金额分页
    handleCurrentChange3(val) {
      this.pageNum3 = val
      this.getFreezelist()
    }
  }
}
</script>
<style lang='scss' scoped>
.freezeAmount {
  .selector {
    display: flex;
    justify-content: space-between;
  }
  .margleft {
    margin-left: 30px;
    line-height: 40px;
    @media screen and (max-width: 850px) {
      margin-left: 0px;
    }
  }
  .desc:hover {
    color: #1878f3;
  }
  .pagination {
    margin-top: 15px;
    margin-bottom: 15px;
    text-align: right;
    @media screen and (max-width: 1005px) {
      ::v-deep .el-pagination__sizes {
        display: none;
      }
    }
  }
}
.no-more {
  padding: 94px 0;
}
::v-deep.el-table .cell {
  padding-left: 0px;
  font-weight: 400;
}
::v-deep .el-table-column--selection .cell {
  padding-left: 11px;
}
::v-deep .el-table th,
.el-table tr {
  background-color: #fafafa !important;
  padding: 3px 0;
}
::v-deep .el-table thead {
  color: #303133;
}
// ::v-deep .el-pagination .btn-prev {
//   margin-left: 65px;
// }
// ::v-deep .el-pagination__jump {
//   position: absolute;
//   right: 10px;
// }
</style>
