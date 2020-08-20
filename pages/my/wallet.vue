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
          :data="dataList.slice((pageNum-1)*pageSize,pageNum*pageSize)"
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
            prop="created_at"
            :ormatter="dateFormat"
          />
          <el-table-column
            prop="cash_status"
            label="状态"
            width="97"
            :formatter="statusFormat"
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
          :total="dataList.length"
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
            @change="bindDateChange2"
          />
          <el-select
            v-model="value"
            placeholder="请选择"
            @change="confirm2"
          >
            <el-option
              v-for="item in options2"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          {{ $t('profile.total') }}{{ total2 }} {{ $t('profile.records') }},{{ $t('profile.amountinvolved') }}￥
        </div>
        <!-- 钱包记录表格 -->
        <el-table
          ref="multipleTable"
          :data="dataList2.slice((pageNum2-1)*pageSize2,pageNum2*pageSize2)"
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
            prop="change_desc"
            label="记录描述"
            width="332"
          />
          <el-table-column
            label="时间"
            width="177"
            prop="created_at"
            :formatter="dateFormat"
          />
          <el-table-column
            prop="change_type"
            label="状态"
            width="97"
            :formatter="statusFormat2"
          />
          <el-table-column
            label="金额"
            width="113"
            sortable
            :sort-method="sortAmount"
          >
            <template slot-scope="scope">
              <span v-html="amountFormat(scope.row.change_available_amount)" />
            </template></el-table-column>
        </el-table>
        <!-- 分页器 -->
        <el-pagination
          background
          :current-page="pageNum2"
          :page-sizes="[10, 20, 30, 40]"
          :page-size="pageSize2"
          layout="total, sizes, prev, pager, next, jumper"
          :total="dataList2.length"
          style="margin-top:15px;"
          @size-change="handleSizeChange2"
          @current-change="handleCurrentChange2"
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
import { time2MinuteOrHour } from '@/utils/time'

export default {
  data() {
    const date = new Date()
    const year = date.getFullYear()
    let month = date.getMonth() + 1
    month = month < 10 ? `0${month}` : month
    const currentDate = `${year}-${month}`
    return {
      value: '', // 提现记录被选择到的类型id
      pageSize: 20, // 提现记录每页展示的数目
      pageNum: 1, // 提现当前页数
      pageSize2: 20, // 钱包明细每页展示的数目
      pageNum2: 1, // 钱包明细当前页数
      loadingType: '', // 读取状态
      dataInfo: {}, // 钱包信息
      date: currentDate, // 提现记录日期
      date2: currentDate, // 钱包明细日期
      filterSelected: '', // 提现记录状态过滤内容的id
      filterSelected2: '', // 钱包明细状态过滤内容的id
      dataList: [], // 提现记录数据
      dataList2: [], // 钱包明细数据
      total: 0, // 提现记录总记录数
      total2: 0, // 钱包qi记录总记录数
      sumMoney: 0, // 钱包涉及到的总金额
      hasPassword: false,
      userId: this.$store.getters['session/get']('userId'), // 获取当前登陆用户的ID
      // 提现过滤选择器的文字内容
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
      multipleSelection: []
    }
  },
  mounted() {
    this.getInfo()
    this.getList()
    this.getList2()
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
    // 金额排序
    sortAmount(str1, str2) {
      console.log(str1, str2)

      return str1.change_available_amount * 1 - str2.change_available_amount * 1
    },
    // 处理时间
    timeHandle(time) {
      return time2MinuteOrHour(time)
    },
    // 提现状态格式化
    statusFormat(row) {
      switch (row.change_type) {
        case 1: return `<font style="color:#25A9F6">${this.$t('profile.tobereviewed')}</font>`
        case 2: return `<font style="color:#09BB07">${this.$t('profile.approved')}</font>`
        case 3: return `<font style="color:#FA5151">${this.$t('profile.auditfailed')}</font>`
        case 4: return this.$t('profile.paymenttobemade')
        case 5: return this.$t('profile.paymentsucceed')
        case 6: return this.$t('profile.paymentfailed')
        default: return '未知状态'
      }
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
    // 时间格式化
    dateFormat(row) {
      return this.timeHandle(row.created_at)
    },
    // 金额格式化
    amountFormat(row) {
      if (row > 0) {
        return `<font color="09BB07">+￥${row}</font>`
      } else {
        return `<font style="color:#FA5151">-￥${row.substr(1)}</font>`
      }
    },
    // 提现日期选中
    bindDateChange(e) {
      this.date = e
      console.log('选中的日期', this.date)
      if (this.date !== null) {
        this.getList('filter')
      } else {
        console.log('日期已经为空')
      }
    },
    // 钱包明细日期选中
    bindDateChange2(e) {
      this.date2 = e
      console.log('选中的日期', this.date2)
      if (this.date2 !== null) {
        this.getList2('filter')
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
    // 钱包明细状态筛选类型
    confirm2(e) {
      console.log('hhh', e)
      this.filterSelected2 = e
      // console.log(this.filterSelected)
      this.getList2('filter')
    },
    // 获取提现数据
    getList(type) {
      this.loadingType = 'loading'
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
          console.log(res)
          if (res._jv) {
            delete res._jv
          }
          this.loadingType = res.length === this.pageSize ? 'more' : 'nomore'
          this.dataList = [...this.dataList, ...res]
          this.total = this.dataList.length
          console.log(this.dataList)
        })
    },
    // 获取提现数据
    getList2(type) {
      this.loadingType = 'loading'
      const dateArr = this.date2.split('-')
      const days = new Date(dateArr[0], dateArr[1], 0).getDate()
      // change_type 10提现冻结，11提现成功，12提现解冻，30注册收入，31打赏收入，32人工收入，50人工支出
      const params = {
        include: ['user', 'order.user', 'order.thread', 'order.thread.firstPost'],
        'filter[user]': this.userId,
        'page[number]': this.pageNum,
        'page[limit]': this.pageSize,
        'filter[start_time]': `${this.date}-01-00-00-00`,
        'filter[end_time]': `${this.date}-${days}-00-00-00`
      }
      // 过滤时间或查看类型，重新设置当前页码和提现数据
      if (type && type === 'filter') {
        params.pageNum = 1
        this.dataList2 = []
      }
      // 当有选择某个分类类型时，添加新的过滤参数
      if (this.filterSelected2) {
        params['filter[change_type]'] = this.filterSelected2
      }
      status
        .run(() => this.$store.dispatch('jv/get', ['wallet/log', { params }]))
        .then(res => {
          console.log(res)
          if (res._jv) {
            delete res._jv
          }
          // 处理文字
          const result = this.handleHandle(res)
          console.log(result[0])

          for (var i = 0; result.length; i++) {
            var arr = []
            arr[i] = this.dataList2[0][i].change_available_amount.replace(/\+|\-|\*|\?/g, '')
          }
          console.log(arr)
          this.sumMoney = result.reduce((total, item) => {
            const num = parseFloat(item.change_available_amount.replace(/\+|\-|\*|\?/g, ''))
            return total + num
          })
          console.log(this.sumMoney)
          this.loadingType = result.length === this.pageSize ? 'more' : 'nomore'
          this.dataList2 = [...this.dataList2, ...result]
          this.total2 = this.dataList2.length
          console.log(this.dataList2)
        })
    },
    // 处理文字
    handleHandle(res) {
      const results = JSON.parse(JSON.stringify(res))
      console.log('results', results)
      console.log('res', res)
      results.forEach((item, index) => {
        let desc = this.handleTitle(item)
        // 截取42个字
        if (desc.length > 42) {
          desc = `${desc.substr(0, 42)}...`
        }
        results[index]['change_desc'] = desc
      })
      return results
    },
    // 处理主题相关的数据
    handleTitle(item) {
      switch (item.change_type) {
        case 31: {
          // 打赏收入
          const user = item.order.user
            ? item.order.user.username
            : this.$t('profile.theuserwasdeleted')
          const regex = /(<([^>]+)>)/gi
          const thread = item.order.thread
            ? item.order.thread.firstPost.summary.replace(regex, '')
            : this.$t('profile.thethemewasdeleted')
          return `${user} ${this.$t('profile.givearewardforyourtheme')} ${thread}`
        }
        case 41: {
          // 打赏支出
          const regex = /(<([^>]+)>)/gi
          const thread = item.order.thread
            ? item.order.thread.firstPost.summary.replace(regex, '')
            : this.$t('profile.thethemewasdeleted')
          return `${this.$t('profile.givearewardforthetheme')} ${thread}`
        }
        case 60: {
          // 付费主题收入
          const user = item.order.user
            ? item.order.user.username
            : this.i18n.t('profile.theuserwasdeleted')
          const regex = /(<([^>]+)>)/gi
          const thread = item.order.thread
            ? item.order.thread.firstPost.summary.replace(regex, '')
            : this.$t('profile.givearewardforthetheme')
          return `${user} ${this.$t('profile.paidtoseeyourtheme')} ${thread}`
        }
        case 61: {
          // 付费主题支出
          const regex = /(<([^>]+)>)/gi
          const thread = item.order.thread
            ? item.order.thread.firstPost.summary.replace(regex, '')
            : this.$t('profile.thethemewasdeleted')
          return `${this.$t('profile.paidtoview')} ${thread}`
        }
        default:
          return item.change_desc
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    // 提现分页
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`)
      this.pageSize = val
    },
    // 钱包分页
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`)
      this.pageNum = val
    },
    // 钱包分页
    handleSizeChange2(val) {
      console.log(`每页 ${val} 条`)
      this.pageSize2 = val
    },
    // 钱包分页
    handleCurrentChange2(val) {
      console.log(`当前页: ${val}`)
      this.pageNum2 = val
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
::v-deep .el-pagination__jump {
  position: absolute;
  right: 10px;
}
</style>
