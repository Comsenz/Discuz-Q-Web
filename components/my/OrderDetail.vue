<template>
  <div class="orderDetail">
    <div class="selector">
      <el-date-picker
        v-model="date"
        type="month"
        placeholder="选择月"
        suffix-icon="el-icon-arrow"
        format="yyyy 年 MM 月 "
        value-format="yyyy-MM"
        @change="bindDateChange4"
      />
      <el-select
        v-model="value"
        :placeholder="$t('profile.pleaseselect')"
        @change="confirm4"
      >
        <el-option
          v-for="item in options4"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <span class="margleft">
        {{ $t('profile.total') }}{{ total4 }}{{ $t('profile.records') }}
        <!-- ,{{ $t('profile.amountinvolved') }}￥{{ sumMoney4 }} -->
      </span>
    </div>
    <div v-if="total4 > 0">
      <!-- 订单明细表格 -->
      <el-table
        v-loading="loading"
        :data="dataList4"
      >
        <!-- <el-table-column
        type="selection"
        width="40"
      /> -->
        <el-table-column
          prop="_jv.id"
          label="ID"
          width="55"
        />
        <el-table-column
          prop="titleType"
          :label="$t('profile.desc')"
        >
          <template slot-scope="scope">
            <span class="desc" @click="toTopic(scope)">{{ scope.row.titleType }}</span>
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
          :formatter="statusFormat4"
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
              v-html="$xss(amountFormat(scope.row))"
            />
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页器 -->
      <el-pagination
        background
        :pager-count="5"
        :current-page="pageNum4"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="pageSize4"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total4"
        class="pagination"
        @size-change="handleSizeChange4"
        @current-change="handleCurrentChange4"
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
          v-if="dataList4.length === 0"
          type="empty"
          class="empty-icon"
        />{{ dataList4.length > 0 ? $t('discuzq.list.noMoreData') : $t('discuzq.list.noData') }}
      </div>
    </template>
  </div>
</template>

<script>
import { status } from '@/store/modules/jsonapi-vuex/index';
import { time2MinuteOrHour } from '@/utils/time';
import handleError from '@/mixin/handleError';
import filterTime from '@/mixin/filterTime';
export default {
  name: 'OrderDetail',
  mixins: [
    handleError, filterTime
  ],
  data() {
    return {
      loading: false,
      hasMore: false,
      value: '',
      pageSize4: 10, // 订单每页展示的数目
      pageNum4: 1, // 订单当前页数
      date: '', // 订单日期
      filterSelected4: '', // 订单状态过滤内容的id
      dataList4: [], // 订单数据
      total4: 0, // 订单记录总记录数
      sumMoney4: 0, // 订单涉及到的总金额
      userId: this.$store.getters['session/get']('userId'), // 获取当前登陆用户的ID
      options4: [{
        value: '',
        label: this.$t('profile.all') + this.$t('profile.type')
      }, {
        value: '0',
        label: this.$t('profile.tobepaid')
      }, {
        value: '1',
        label: this.$t('profile.paid')
      }, {
        value: '2',
        label: this.$t('profile.cancelorder')
      }, {
        value: '3',
        label: this.$t('profile.payfail')
      }, {
        value: '4',
        label: this.$t('profile.orderexpired')
      }]

    };
  },
  mounted() {
    this.setCurrentTime();
    this.getList4();
  },
  methods: {
    toTopic(scope) {
      if (!scope.row.thread) {
        return;
      }
      this.$router.push(`/topic/index?id=${scope.row.thread._jv.id}`);
    },
    // 金额排序
    sortAmount(str1, str2) {
      return (str1.amount * 1) - (str2.amount * 1);
    },
    // 处理时间
    timeHandle(time) {
      return time2MinuteOrHour(time);
    },
    // 订单明细状态格式化
    statusFormat4(row) {
      switch (row.status) {
        case 0: return this.$t('profile.tobepaid');
        case 1: return this.$t('profile.paid');
        case 2: return this.$t('profile.cancelorder');
        case 3: return this.$t('profile.payfail');
        case 4: return this.$t('profile.orderexpired');

        default: return '未知状态';
      }
    },
    // 时间格式化
    dateFormat(row) {
      return this.timeHandle(row.created_at);
    },
    // 金额格式化
    amountFormat(row) {
      // 订单
      if (row.amount > 0) {
        return `<font color="09BB07">-￥${row.amount}</font>`;
      }
      if (row > 0) {
        return `<font color="09BB07">+￥${row}</font>`;
      }
      return `<font style="color:#FA5151">-￥${row.substr(1)}</font>`;
    },
    // 订单日期选中
    bindDateChange4(e) {
      this.date = e;
      if (this.date !== null) {
        this.getList4('filter');
      }
    },
    // 订单状态筛选类型
    confirm4(e) {
      this.filterSelected4 = e;
      this.getList4('filter');
    },
    // 获取订单数据
    getList4(type) {
      this.loading = true;
      const dateArr = this.date.split('-');
      const days = new Date(dateArr[0], dateArr[1], 0).getDate();
      // status 0 待付款，1 已付款 ，2取消订单，3支付失败，4 订单已过期
      const params = {
        include: 'user,thread,thread.firstPost',
        'filter[user]': this.userId,
        'page[number]': this.pageNum4,
        'page[limit]': this.pageSize4,
        'filter[start_time]': `${this.date}-01-00-00-00`,
        'filter[end_time]': `${this.date}-${days}-23-59-59`
      };
      if (type && type === 'filter') {
        params.pageNum4 = 1;
        this.dataList4 = [];
      }
      if (this.filterSelected4 || this.filterSelected4 === 0) {
        params['filter[status]'] = this.filterSelected4;
      }
      status
        .run(() => this.$store.dispatch('jv/get', ['orders', { params }]))
        .then((res) => {
          // 处理文字
          const result = this.handleHandle4(res);
          // 处理钱
          this.sumMoney4 = this.handlemoney4(result);
          this.dataList4 = result;
          this.total4 = res._jv.json.meta.total;
        }, (e) => {
          this.handleError(e);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 处理订单
    handlemoney4(result) {
      const res = JSON.parse(JSON.stringify(result));
      let sum = 0;
      res.forEach((item, index) => {
        // eslint-disable-next-line no-useless-escape
        res[index] = parseFloat(item.amount.replace(/\+|\-|\*|\?/g, ''));
        sum = sum + res[index];
      });
      return sum.toFixed(2);
    },
    // 订单处理文字
    handleHandle4(res) {
      const results = JSON.parse(JSON.stringify(res));
      results.forEach((item, index) => {
        let desc = this.handleTitle4(item);
        // 截取42个字
        if (desc.length > 42) {
          desc = `${desc.substr(0, 42)}...`;
        }
        results[index].titleType = desc;
      });
      return results;
    },
    // 处理订单相关数据
    handleTitle4(item) {
      switch (item.type) {
        case 1: {
          // 注册
          return this.$t('profile.register');
        }
        case 2: {
          // 打赏支出
          const regex = /(<([^>]+)>)/gi;
          const thread = item.thread
            ? item.thread.firstPost.summary.replace(regex, '')
            : this.$t('profile.thethemewasdeleted');
          return `${this.$t('profile.givearewardforthetheme')} ${thread}`;
        }
        case 3: {
          // 付费主题支出
          const regex = /(<([^>]+)>)/gi;
          const thread = item.thread
            ? item.thread.firstPost.summary.replace(regex, '')
            : this.$t('profile.thethemewasdeleted');
          return `${this.$t('profile.paidtoview')} ${thread}`;
        }
        case 4: {
          // 付费用户组
          return this.$t('profile.paygroup');
        }
        case 7: {
          // 付费查看主题附件
          const thread = item.thread ? item.thread.title : this.$t('profile.thethemewasdeleted');
          return `付费查看了主题的附件 ${thread}`;
        }
        case 5: {
          // 付费查看问答
          const thread = item.thread ? item.thread.title : this.$t('profile.thethemewasdeleted');
          return `付费查看了问答 ${thread}`;
        }
        case 6: {
          // 付费围观
          const thread = item.thread ? item.thread.title : this.$t('profile.thethemewasdeleted');
          return `付费围观了问答 ${thread}`;
        }
        default:
          return item.type;
      }
    },
    // 订单金额分页
    handleSizeChange4(val) {
      this.pageNum4 = 1;
      this.pageSize4 = val;
      this.getList4();
    },
    // 订单金额分页
    handleCurrentChange4(val) {
      this.pageNum4 = val;
      this.getList4();
    }
  }
};
</script>
<style lang='scss' scoped>
.orderDetail {
  .margleft {
    margin-left: 30px;
    @media screen and (max-width: 900px) {
      margin-left: 60px;
    }
  }
  .desc:hover {
    color: #1878f3;
    cursor: pointer;
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
// ::v-deep .el-pagination .btn-prev {
//   margin-left: 65px;
// }
// ::v-deep .el-pagination__jump {
//   position: absolute;
//   right: 10px;
// }
</style>
