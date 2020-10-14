<template>
  <div class="cashDialog">
    <div class="selector">
      <el-date-picker
        v-model="date"
        type="month"
        placeholder="选择月"
        suffix-icon="el-icon-arrow"
        format="yyyy 年 MM 月 "
        value-format="yyyy-MM"
        @change="bindDateChange"
      />
      <el-select
        v-model="value"
        :placeholder="$t('profile.pleaseselect')"
        @change="confirm"
      >
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <span class="margleft">
        {{ $t('profile.total') }}{{ total }}{{ $t('profile.records') }}
        <!-- ,{{ $t('profile.amountinvolved') }}￥{{ sumMoney }} -->
      </span>
    </div>
    <div v-if="total > 0">
      <!-- 提现记录表格 -->
      <el-table
        v-loading="loading"
        :data="dataList"
        style="width:100%"
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
          prop="cash_status"
          :label="$t('profile.desc')"
          :formatter="statusFormat2"
        >
          <template slot-scope="scope">
            <span
              class="desc"
              v-html="statusFormat2(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('profile.time')"
          width="140"
          prop="created_at"
          :formatter="dateFormat"
        />
        <el-table-column
          prop="cash_status"
          :label="$t('profile.status')"
          width="97"
          :formatter="statusFormat"
        >
          <template slot-scope="scope">
            <span v-html="statusFormat(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column
          prop="cash_apply_amount"
          :label="$t('pay.sumOfMoney')"
          width="113"
          sortable
        >
          <template slot-scope="scope">
            <span
              style="font-size:16px;"
              v-html="scope.row.cash_apply_amount"
            />
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页器 -->
      <el-pagination
        background
        :pager-count="5"
        :current-page="pageNum"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        class="pagination"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
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
          v-if="dataList.length === 0"
          type="empty"
          class="empty-icon"
        />{{ dataList.length > 0 ? $t('discuzq.list.noMoreData') : $t('discuzq.list.noData') }}
      </div>
    </template>
  </div>
</template>

<script>
import { status } from '@/library/jsonapi-vuex/index'
import { time2MinuteOrHour } from '@/utils/time'
import handleError from '@/mixin/handleError'
export default {
  mixins: [
    handleError
  ],
  data() {
    const date = new Date()
    const year = date.getFullYear()
    let month = date.getMonth() + 1
    month = month < 10 ? `0${month}` : month
    const currentDate = `${year}-${month}`
    return {
      loading: false,
      hasMore: false,
      date: currentDate, // 提现记录日期
      value: '', // 提现记录被选择到的类型id
      pageSize: 10, // 提现记录每页展示的数目
      pageNum: 1, // 提现当前页数
      filterSelected: '', // 提现记录状态过滤内容的id
      dataList: [], // 提现记录数据
      total: 0, // 提现记录总记录数
      sumMoney: 0, // 提现涉及到的总金额
      // 提现过滤选择器的文字内容
      options: [{
        value: '',
        label: this.$t('profile.all') + this.$t('profile.type')
      }, {
        value: '1',
        label: this.$t('profile.tobereviewed')

      }, {
        value: '2',
        label: this.$t('profile.approved')

      }, {
        value: '3',
        label: this.$t('profile.auditfailed')

      }, {
        value: '4',
        label: this.$t('profile.paymenttobemade')

      }, {
        value: '5',
        label: this.$t('profile.paymentsucceed')

      }, {
        value: '6',
        label: this.$t('profile.paymentfailed')

      }],
      userId: this.$store.getters['session/get']('userId'), // 获取当前登陆用户的ID
      userInfo: ''

    }
  },
  mounted() {
    this.getUserInfo()
    this.getList()
  },
  methods: {
    // 用户信息
    getUserInfo() {
      this.userInfo = this.$store.state.user.info.attributes
    },
    // 获取提现数据
    getList(type) {
      this.loading = true
      const dateArr = this.date.split('-')
      const days = new Date(dateArr[0], dateArr[1], 0).getDate()
      // cash_status(1-6) '待审核', '审核通过', '审核不通过', '待打款', '已打款', '打款失败'
      const params = {
        'filter[user]': this.userId,
        'page[number]': this.pageNum2,
        'page[limit]': this.pageSize2,
        'filter[start_time]': `${this.date}-01-00-00-00`,
        'filter[end_time]': `${this.date}-${days}-00-00-00`
      }
      // 过滤时间或查看类型，重新设置当前页码和提现数据
      if (type && type === 'filter') {
        params.pageNum = 1
        this.dataList = []
      }
      // 当有选择某个分类类型时，添加新的过滤参数
      if (this.filterSelected !== '') {
        params['filter[cash_status]'] = this.filterSelected
      }
      status
        .run(() => this.$store.dispatch('jv/get', ['wallet/cash', { params }]))
        .then(res => {
          console.log('提现数据', res)
          // 处理钱
          this.sumMoney = this.handlemoney(res)
          this.dataList = res
          this.total = res._jv.json.meta.total
          console.log('提现数据', this.dataList)
        }, e => {
          this.handleError(e)
        }).finally(() => {
          this.loading = false
        })
    },
    // 提现日期选中
    bindDateChange(e) {
      this.date = e
      console.log('提现日期选中', this.date)
      if (this.date !== null) {
        this.getList('filter')
      } else {
        console.log('日期已经为空')
      }
    },
    // 提现确认筛选类型
    confirm(e) {
      console.log('提现确认筛选类型', e)
      this.filterSelected = e
      // console.log(this.filterSelected)
      this.getList('filter')
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    // 时间格式化
    dateFormat(row) {
      return this.timeHandle(row.created_at)
    },
    // 处理时间
    timeHandle(time) {
      return time2MinuteOrHour(time)
    },
    // 提现状态格式化
    statusFormat(row) {
      switch (row.cash_status) {
        case 1: return `<font style="color:#25A9F6">${this.$t('profile.tobereviewed')}</font>`
        case 2: return `<font style="color:#09BB07">${this.$t('profile.approved')}</font>`
        case 3: return `<font style="color:#FA5151">${this.$t('profile.auditfailed')}</font>`
        case 4: return this.$t('profile.paymenttobemade')
        case 5: return this.$t('profile.paymentsucceed')
        case 6: return this.$t('profile.paymentfailed')
        default: return '未知状态'
      }
    },
    // 提现状态格式化
    statusFormat2(row) {
      switch (row.cash_status) {
        case 1: return this.$t('profile.tobereviewed')
        case 2: return this.$t('profile.approved')
        case 3: return this.$t('profile.auditfailed')
        case 4: return this.$t('profile.paymenttobemade')
        case 5: return this.$t('profile.paymentsucceed')
        case 6: return this.$t('profile.paymentfailed')
        default: return '未知状态'
      }
    },
    // 处理提现钱包总金额
    handlemoney(result) {
      const res = JSON.parse(JSON.stringify(result))
      let sum = 0
      res.forEach((item, index) => {
        res[index] = parseFloat(item.cash_apply_amount.replace(/\+|\-|\*|\?/g, ''))
        sum = sum + res[index]
      })

      return sum.toFixed(2)
    },
    // 提现分页
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`)
      this.pageNum = 1
      this.pageSize = val
      this.getList()
    },
    // 提现分页
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`)
      this.pageNum = val
      this.getList()
    }
  }
}
</script>
<style lang='scss' scoped>
.cashDialog {
  .margleft {
    margin-left: 30px;
    @media screen and (max-width: 900px) {
      margin-left: 60px;
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
.selector {
  .el-date-editor {
    @media screen and (max-width: 900px) {
      width: 160px;
    }
  }
  .el-select {
    @media screen and (max-width: 900px) {
      width: 120px;
    }
  }
}
.no-more {
  padding: 94px 0;
}
::v-deep .el-table {
  margin-top: 15px;
}
::v-deep.el-table .cell {
  padding-left: 0px;
  font-weight: 400;
}
::v-deep .el-table-column--selection .cell {
  padding-left: 11px;
}
::v-deep .el-table thead {
  color: #303133;
}
::v-deep .el-table th,
.el-table tr {
  background-color: #fafafa !important;
  padding: 3px 0;
}
// ::v-deep .el-pagination .btn-prev {
//   margin-left: 65px;
// }
// ::v-deep .el-pagination__jump {
//   position: absolute;
//   right: 10px;
// }
</style>
