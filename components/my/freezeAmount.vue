<template>
  <div class="freezeAmount">
    <!-- <div class="selector">
      <el-date-picker
        v-model="date3"
        type="month"
        placeholder="选择月"
        suffix-icon="el-icon-arrow"
        format="yyyy 年 MM 月 "
        value-format="yyyy-MM"
        @change="bindDateChange3"
      />
      <el-select
        v-model="value"
        placeholder="请选择"
        @change="confirm3"
      >
        <el-option
          v-for="item in options2"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <span class="margleft">
        {{ $t('profile.total') }}{{ total3 }}{{ $t('profile.records') }},{{ $t('profile.amountinvolved') }}￥{{ walletFreeze }}
      </span>
    </div> -->
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
          label="记录描述"
        >
          <template slot-scope="scope">
            <span class="desc">{{ scope.row.change_desc }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="时间"
          width="140"
          prop="created_at"
          :formatter="dateFormat"
        />
        <!-- <el-table-column
            prop="cash_status"
            label="状态"
            width="97"
            :formatter="statusFormat"
          /> -->
        <el-table-column
          label="金额"
          width="113"
          sortable
          :sort-method="sortAmount"
        >
          <template slot-scope="scope">
            <span
              style="font-size:16px;"
              v-html="amountFormat(scope.row.change_freeze_amount)"
            />
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页器 -->
      <el-pagination
        background
        :current-page="pageNum3"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="pageSize3"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total3"
        style="margin-top:15px;"
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
    const date = new Date()
    const year = date.getFullYear()
    let month = date.getMonth() + 1
    month = month < 10 ? `0${month}` : month
    const currentDate = `${year}-${month}`
    return {
      loading: false,
      hasMore: false,
      value: '', // 提现记录被选择到的类型id
      pageSize3: 10, // 冻结每页展示的数目
      pageNum3: 1, // 冻结当前页数
      freeze_amount: '',
      date3: currentDate, // 冻结金额日期,
      filterSelected3: '', // 冻结状态过滤内容的id
      freezelist: [], // 冻结金额
      total3: 0, // 冻结金额记录总记录数
      // 钱包明细状态选择文本
      options2: [{
        value: '',
        label: this.$t('profile.all')
      }, {
        value: '10',
        label: this.$t('profile.withdrawalfreeze')

      }, {
        value: '11',
        label: this.$t('profile.withdrawalsucceed')

      }, {
        value: '12',
        label: this.$t('profile.withdrawalunfreeze')

      }, {
        value: '30',
        label: this.$t('profile.registeredincome')

      }, {
        value: '31',
        label: this.$t('profile.rewardincome')

      }, {
        value: '32',
        label: this.$t('profile.laborincome')

      }, {
        value: '50',
        label: this.$t('profile.laborexpenditure')

      }, {
        value: '41',
        label: this.$t('profile.givearewardforthetheme')

      }, {
        value: '60',
        label: this.$t('profile.paidtoseeyourtheme')

      }, {
        value: '61',
        label: this.$t('profile.paidtoview')

      }],
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
    // 冻结金额日期选中
    bindDateChange3(e) {
      this.date3 = e
      console.log('冻结金额日期选中', this.date3)
      if (this.date3 !== null) {
        this.getFreezelist('filter')
      } else {
        console.log('日期已经为空')
      }
    },
    // 冻结金额状态筛选类型
    confirm3(e) {
      console.log('冻结金额状态筛选类型', e)
      this.filterSelected3 = e
      // console.log(this.filterSelected)
      this.getFreezelist('filter')
    },
    // 钱包状态格式化
    statusFormat2(row) {
      switch (row.change_type) {
        case 10: return this.$t('profile.withdrawalfreeze')
        case 11: return this.$t('profile.withdrawalsucceed')
        case 12: return this.$t('profile.withdrawalunfreeze')
        case 30: return this.$t('profile.registeredincome')
        case 31: return this.$t('profile.rewardincome')
        case 32: return this.$t('profile.laborincome')
        case 50: return this.$t('profile.laborexpenditure')
        case 41: return this.$t('profile.givearewardforthetheme')
        case 60: return this.$t('profile.paidtoseeyourtheme')
        case 61: return this.$t('profile.paidtoview')

        default: return '未知状态'
      }
    },
    // 金额格式化
    amountFormat(row) {
      // 订单
      if (row.amount > 0) {
        return `<font color="09BB07">-￥${row.amount}</font>`
      }
      if (row > 0) {
        return `<font color="09BB07">+￥${row}</font>`
      } else {
        return `<font style="color:#FA5151">-￥${row.substr(1)}</font>`
      }
    },
    // 获取冻结金额列表数据
    getFreezelist() {
      this.loading = true
      const params = {
        'filter[user]': this.userId,
        'filter[change_type]': '10, 11, 12', // 10提现冻结 11提现成功 12 提现解冻
        'page[number]': this.pageNum3,
        'page[limit]': this.pageSize3
      }
      this.$store.dispatch('jv/get', ['wallet/log', { params }]).then(res => {
        console.log('冻结金额列表数据', res)
        this.total3 = res._jv.json.meta.total
        this.freezelist = res
      }, e => {
        this.handleError(e)
      }).finally(() => {
        this.loading = false
      })
    },
    // 金额排序
    sortAmount(str1, str2) {
      console.log(str1, str2)
      return str1.change_available_amount * 1 - str2.change_available_amount * 1
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
      console.log(`每页 ${val} 条`)
      this.pageNum3 = 1
      this.pageSize3 = val
      this.getFreezelist()
    },
    // 冻结金额分页
    handleCurrentChange3(val) {
      console.log(`当前页: ${val}`)
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
}
.no-more {
  padding: 94px 0;
}
::v-deep.el-tabs {
  .el-tabs__header {
    background: transparent;
  }
  .el-tabs__header .el-tabs__item {
    border: none;
    color: #b5b5b5;
    padding: 0 52px 0 0px;
    font-size: 16px;
  }
  .el-tabs__content {
    padding: 10px 0;
  }
  .el-tabs__header .el-tabs__item:nth-child(2) {
    padding-left: 0px;
  }
  .el-tabs__header .el-tabs__item.is-active {
    color: black;
    background: transparent;
    border: none;
    font-weight: bold;
    font-size: 18px;
  }
  .el-tabs__nav-wrap {
    margin-bottom: 0px;
  }
  .el-input__inner {
    border-radius: 0px;
  }
  .el-button {
    border-radius: 0px;
  }
  .el-input__inner:focus {
    border-color: #dcdfe6;
  }
  .el-input__inner:hover {
    border-color: #dcdfe6;
  }
}
// ::v-deep .el-table {
//   margin-top: 15px;
// }
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
::v-deep .el-pagination .btn-prev {
  margin-left: 110px;
}
::v-deep .el-pagination__jump {
  position: absolute;
  right: 10px;
}
</style>
