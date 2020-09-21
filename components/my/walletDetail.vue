<template>
  <div class="walletDetail">
    <div class="selector">
      <el-date-picker
        v-model="date2"
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
      <span class="margleft">
        {{ $t('profile.total') }}{{ total2 }}{{ $t('profile.records') }}
        <!-- ,{{ $t('profile.amountinvolved') }}￥{{ sumMoney2 }} -->
      </span>
    </div>
    <div v-if="total2 > 0">
      <!-- 钱包记录表格 -->
      <el-table
        v-loading="loading"
        :data="dataList2"
      >
        <!-- <el-table-column
        type="selection"
        width="40"
      /> -->
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
          :label="$t('profile.time')"
          width="140"
          prop="created_at"
          :formatter="dateFormat"
        />
        <el-table-column
          :label="$t('profile.status')"
          width="97"
          :formatter="statusFormat2"
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
              v-html="amountFormat(scope.row.change_available_amount)"
            />
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页器 -->
      <el-pagination
        background
        :current-page="pageNum2"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="pageSize2"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total2"
        style="margin-top:15px;"
        @size-change="handleSizeChange2"
        @current-change="handleCurrentChange2"
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
          v-if="dataList2.length === 0"
          type="empty"
          class="empty-icon"
        />{{ dataList2.length > 0 ? $t('discuzq.list.noMoreData') : $t('discuzq.list.noData') }}
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
      value: '', // 提现记录被选择到的类型id
      pageSize2: 10, // 钱包明细每页展示的数目
      pageNum2: 1, // 钱包明细当前页数
      date2: currentDate, // 钱包明细日期
      filterSelected2: '', // 钱包明细状态过滤内容的id
      dataList2: [], // 钱包明细数据
      total2: 0, // 钱包qi记录总记录数
      sumMoney2: 0, // 钱包涉及到的总金额
      userId: this.$store.getters['session/get']('userId'), // 获取当前登陆用户的ID
      // 钱包明细状态选择文本
      options2: [{
        value: '',
        label: this.$t('profile.all') + this.$t('profile.type')
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

      }]

    }
  },
  mounted() {
    this.getList2()
  },
  methods: {
    // 金额排序
    sortAmount(str1, str2) {
      console.log(str1, str2)
      return str1.change_available_amount * 1 - str2.change_available_amount * 1
    },
    // 处理时间
    timeHandle(time) {
      return time2MinuteOrHour(time)
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
        return `<font color="#FA5151">+￥${row}</font>`
      } else {
        return `<font style="color:#09BB07">-￥${row.substr(1)}</font>`
      }
    },
    // 时间格式化
    dateFormat(row) {
      return this.timeHandle(row.created_at)
    },
    // 钱包明细日期选中
    bindDateChange2(e) {
      this.date2 = e
      console.log('钱包明细日期选中', this.date2)
      if (this.date2 !== null) {
        this.getList2('filter')
      } else {
        console.log('日期已经为空')
      }
    },
    // 钱包明细状态筛选类型
    confirm2(e) {
      console.log('钱包明细状态筛选类型', e)
      this.filterSelected2 = e
      // console.log(this.filterSelected)
      this.getList2('filter')
    },
    // 获取钱包明细数据
    getList2(type) {
      this.loading = true
      const dateArr = this.date2.split('-')
      const days = new Date(dateArr[0], dateArr[1], 0).getDate()
      // change_type 10提现冻结，11提现成功，12提现解冻，30注册收入，31打赏收入，32人工收入，50人工支出
      const params = {
        include: 'user,order.user,order.thread,order.thread.firstPost',
        'filter[user]': this.userId,
        'page[number]': this.pageNum2,
        'page[limit]': this.pageSize2,
        'filter[start_time]': `${this.date2}-01-00-00-00`,
        'filter[end_time]': `${this.date2}-${days}-00-00-00`
      }
      // 过滤时间或查看类型，重新设置当前页码和提现数据
      if (type && type === 'filter') {
        params.pageNum2 = 1
        this.dataList2 = []
      }
      // 当有选择某个分类类型时，添加新的过滤参数
      if (this.filterSelected2) {
        params['filter[change_type]'] = this.filterSelected2
      }
      status
        .run(() => this.$store.dispatch('jv/get', ['wallet/log', { params }]))
        .then(res => {
          // 处理文字
          const result = this.handleHandle(res)
          // 处理钱
          this.sumMoney2 = this.handlemoney2(result)
          console.log('钱包总金额', this.sumMoney2)
          this.dataList2 = result
          this.total2 = res._jv.json.meta.total
          console.log('钱包明细', this.dataList2)
        }, e => {
          this.handleError(e)
        }).finally(() => {
          this.loading = false
        })
    },
    // 钱包总金额
    handlemoney2(result) {
      const res = JSON.parse(JSON.stringify(result))
      let sum = 0

      res.forEach((item, index) => {
        res[index] = parseFloat(item.change_available_amount.replace(/\+|\-|\*|\?/g, ''))
        sum = sum + res[index]
      })

      return sum.toFixed(2)
    },
    // 钱包处理文字
    handleHandle(res) {
      console.log('文字1', res)

      const results = JSON.parse(JSON.stringify(res))
      console.log('文字', results)
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
    // 处理钱包主题相关的数据
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
            : this.$t('profile.theuserwasdeleted')
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
    // 钱包分页
    handleSizeChange2(val) {
      console.log(`每页 ${val} 条`)
      this.pageNum2 = 1
      this.pageSize2 = val
      this.getList2()
    },
    // 钱包分页
    handleCurrentChange2(val) {
      console.log(`当前页: ${val}`)
      this.pageNum2 = val
      this.getList2()
    }
  }
}
</script>
<style lang='scss' scoped>
.walletDetail {
  .margleft {
    margin-left: 30px;
    @media screen and (max-width: 900px) {
      margin-left: 60px;
    }
  }
  .desc:hover{
    color:#1878f3;
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
  // padding-left: 0px;

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
