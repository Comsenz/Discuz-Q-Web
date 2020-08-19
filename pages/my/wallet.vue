<template>
  <div class="mywallet">
    <div class="mywallet-top">
      <div class="mywallet-topitem">
        <span class="margbtm">{{ $t('profile.availableamount') }}</span>
        <span class="amount">{{ `¥ ${dataInfo.available_amount || 0.0}` }}<span class="availmount">{{ $t('modify.withdratitle') }}</span></span>
      </div>
      <div class="mywallet-topitem">
        <span class="margbtm">{{ $t('profile.freezeamount') }}</span>
        <span
          class="amount"
          style="color:#FA5151;"
        >{{ `¥ ${dataInfo.freeze_amount || 0.0}` }}<span>112</span></span>
      </div>
      <div
        class="mywallet-topitem"
        style="margin-right:30px;text-align:right"
      >
        <span class="margbtm">{{ $t('pay.payPassword') }}</span>
        <span v-if="hasPassword">
          <svg-icon
            style="width:16px; height:16px;margin-right:5px;"
            type="shield"
          />已设置 / 修改 </span>
        <span v-else>
          <svg-icon
            style="width:16px; height:16px;margin-right:5px;"
            type="warning"
          />{{ $t('profile.setpaypassword') }} </span>
      </div>
    </div>
    <el-tabs
      type="border-card"
      class="register-select"
    >
      <!-- 提现记录 -->
      <el-tab-pane :label="$t('profile.withdrawalslist')">
        <div class="selector">
          <el-date-picker
            v-model="value1"
            type="monthrange"
            range-separator="至"
            start-placeholder="开始月份"
            end-placeholder="结束月份"
          />
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
            placeholder="请选择"
            @change="confirm"
          >
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
        <!-- 提现记录表格 -->
        <el-table
          ref="multipleTable"
          :data="tableData"
          tooltip-effect="red"
          style="width: 100%"
          @selection-change="handleSelectionChange"
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
            prop="address"
            label="记录描述"
            width="332"
          />
          <el-table-column
            label="时间"
            width="177"
          >
            <template slot-scope="scope">{{ scope.row.date }}</template>
          </el-table-column>
          <el-table-column
            prop="name"
            label="状态"
            width="97"
          />
          <el-table-column
            prop="money"
            label="金额"
            width="113"
            sortable
          />
        </el-table>
        <!-- 分页器 -->
        <el-pagination
          background
          :current-page="pageNum"
          :page-sizes="[10, 20, 30, 40]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="400"
          style="margin-top:15px;"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </el-tab-pane>
      <!-- 冻结金额 -->
      <el-tab-pane :label="$t('profile.freezeamount')">
        <span class="title2">冻结金额</span>
      </el-tab-pane>
      <!-- 钱包明细 -->
      <el-tab-pane :label="$t('profile.walletlist')">
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
            placeholder="请选择"
            @change="confirm"
          >
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
        <!-- 提现记录表格 -->
        <el-table
          ref="multipleTable"
          :data="tableData"
          tooltip-effect="red"
          style="width: 100%"
          @selection-change="handleSelectionChange"
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
            prop="address"
            label="记录描述"
            width="332"
          />
          <el-table-column
            label="时间"
            width="177"
          >
            <template slot-scope="scope">{{ scope.row.date }}</template>
          </el-table-column>
          <el-table-column
            prop="name"
            label="状态"
            width="97"
          />
          <el-table-column
            prop="money"
            label="金额"
            width="113"
            sortable
          />
        </el-table>
        <!-- 分页器 -->
        <el-pagination
          background
          :current-page="pageNum"
          :page-sizes="[10, 20, 30, 40]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="400"
          style="margin-top:15px;"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </el-tab-pane>
      <!-- 订单明细 -->
      <el-tab-pane :label="$t('profile.orderlist')">
        订单明细
      </el-tab-pane>
    </el-tabs>

  </div>

</template>

<script>
import { status } from '@/library/jsonapi-vuex/index'

export default {
  data() {
    const date = new Date()
    const year = date.getFullYear()
    let month = date.getMonth() + 1
    month = month < 10 ? `0${month}` : month
    const currentDate = `${year}-${month}`
    return {
      value: '', // 被选择到的类型id
      value1: '', // 月份范围默认值
      pageSize: 20, // 每页展示的数目
      pageNum: 1, // 当前页数
      loadingType: '', // 读取状态
      dataInfo: {}, // 钱包信息
      date: currentDate, // 日期
      filterSelected: '', // 选择过滤查看内容的id
      hasPassword: false,
      userId: this.$store.getters['session/get']('userId'), // 获取当前登陆用户的ID
      // 过滤选择器的文字内容
      options: [{
        value: '',
        label: this.$t('profile.all')
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
      // 表格mock数据
      tableData: [{
        id: '1111',
        date: '2016-05-03 07:33',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄',
        money: '1111'
      }, {
        id: '1111',
        date: '2016-05-02 07:33',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄',
        money: '113451'

      }, {
        id: '1111',
        date: '2016-05-04 07:33',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄',
        money: '1141'

      }, {
        id: '1111',
        date: '2016-05-01 07:33',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄',
        money: '11431'

      }, {
        id: '1111',
        date: '2016-05-08 07:33',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄',
        money: '143511'

      }, {
        id: '1111',
        date: '2016-05-06 07:33',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄',
        money: '111'

      }, {
        id: '1111',
        date: '2016-05-07 07:33',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄',
        money: '111'

      }, {
        id: '1111',
        date: '2016-05-06 07:33',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄',
        money: '111'

      }, {
        id: '1111',
        date: '2016-05-06 07:33',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄',
        money: '111'

      }, {
        id: '1111',
        date: '2016-05-06 07:33',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄',
        money: '111'

      }, {
        id: '1111',
        date: '2016-05-06 07:33',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄',
        money: '111'

      }, {
        id: '1111',
        date: '2016-05-06 07:33',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄',
        money: '111'

      }],
      multipleSelection: []
    }
  },
  mounted() {
    this.getInfo()
    this.getList()
  },
  methods: {
    // 获取钱包信息
    getInfo() {
      status
        .run(() => this.$store.dispatch('jv/get', `wallet/user/${this.userId}`))
        .then(res => {
          this.dataInfo = res
          this.hasPassword = res.user.canWalletPay
          console.log(this.dataInfo)
        })
    },
    // 日期选中
    bindDateChange(e) {
      this.date = e
      console.log('选中的日期', this.date)
      if (this.date !== null) {
        this.getList('filter')
      } else {
        console.log('日期已经为空')
      }
    },
    // 确认筛选类型
    confirm(e) {
      console.log('hhh', e)
      this.filterSelected = e
      // console.log(this.filterSelected)
      this.getList('filter')
    },
    // 获取提现数据
    getList(type) {
      this.loadingType = 'loading'
      const dateArr = this.date.split('-')
      const days = new Date(dateArr[0], dateArr[1], 0).getDate()
      // cash_status(1-6) '待审核', '审核通过', '审核不通过', '待打款', '已打款', '打款失败'
      const params = {
        'filter[user]': 20,
        'page[number]': this.pageNum,
        'page[limit]': this.pageSize,
        'filter[start_time]': `${this.date}-01-00-00-00`,
        'filter[end_time]': `${this.date}-${days}-00-00-00`
      }
      // 过滤时间或查看类型，重新设置当前页码和提现数据
      if (type && type === 'filter') {
        params.pageNum = 1
        this.dataList = []
      }
      // 当有选择某个分类类型时，添加新的过滤参数
      if (this.filterSelected) {
        params['filter[cash_status]'] = this.filterSelected
      }
      status
        .run(() => this.$store.dispatch('jv/get', ['wallet/cash', { params }]))
        .then(res => {
          console.log(res)
          if (res._jv) {
            delete res._jv
          }
          this.loadingType = res.length === this.pageSize ? 'more' : 'nomore'
          this.dataList = [...this.dataList, ...res]
          console.log(this.dataList)
        })
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`)
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`)
    }
  }

}
</script>
<style lang='scss' scoped>
.mywallet {
  .mywallet-top {
    display: flex;
    flex-direction: row;
    .mywallet-topitem {
      display: flex;
      flex-direction: column;
      flex: 1;
      color: #6d6d6d;
      .amount {
        font-size: 20px;
      }
      .availmount {
        font-size: 14px;
        color: #1878f3;
        line-height: 23px;
        vertical-align: top;
        margin-left: 10px;
      }
      .margbtm {
        margin-bottom: 10px;
      }
    }
  }
  .register-select {
    margin-top: 63px;
    border: none;
    background: transparent;
    box-shadow: none;
  }
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
::v-deep .el-table {
  margin-top: 15px;
}
::v-deep.el-table .cell {
  padding-left: 10px;
}
::v-deep .el-table thead {
  color: #303133;
}
::v-deep .el-table th,
.el-table tr {
  background-color: #f4f5f6 !important;
}
::v-deep .el-pagination .btn-prev {
  margin-left: 110px;
}
</style>
