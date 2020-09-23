<template>
  <div class="invite-container">
    <template v-if="isShowDetail">
      <header v-if="detail && detail.user" class="detail-header">
        <div class="title">{{ $t('invite.userDetail' ) }}</div>
        <div class="user">
          <avatar :user="{ id: detail.user.id, username: detail.user.username, avatarUrl: detail.user.avatarUrl}" :size="50" />
          <div class="user-info">
            <nuxt-link :to="`/profile?userId=${detail.user.id}`" class="user-name">{{ detail.user.username }}</nuxt-link>
            <div class="create-at">{{ $t('invite.createdAt') + $t('discuzq.symbol.colon') }} {{ detail.created_at | formatDate }}</div>
          </div>
          <div class="total-money">
            <div class="label">{{ $t('invite.allIncome') }}</div>
            <div class="value">{{ $t('post.yuanItem') + detailTotalMoney }}</div>
          </div>
        </div>
      </header>
      <main>
        <div class="main">
          <!-- <div class="invite-total">{{ $t('invite.inviteTotal', { total }) }}</div> -->
          <el-table v-loading="loading" :data="incomeDetailList" :default-sort="{prop: 'created_at', order: 'descending'}" @sort-change="sortChange">
            <el-table-column :label="$t('invite.inviteUserName')">
              <template slot-scope="scope">
                <div v-if="scope.row.sourceUser" class="flex">
                  <avatar :user="{ id: scope.row.sourceUser.id, username: scope.row.sourceUser.username, avatarUrl: scope.row.sourceUser.avatarUrl}" :size="30" :round="true" />
                  <nuxt-link :to="`/profile?userId=${scope.row.sourceUser.id}`" class="user-name">{{ scope.row.sourceUser.username }}</nuxt-link>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="created_at" :label="$t('invite.incomeAt')" sortable="custom">
              <template slot-scope="scope">
                {{ scope.row.created_at | formatDate }}
              </template>
            </el-table-column>
            <el-table-column :label="$t('invite.income')" width="100">
              <div slot-scope="scope" class="last-table">
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
      </main>
    </template>
    <div v-else class="invite-cont">
      <header class="header flex">
        <div class="item">
          <div class="label">{{ $t('invite.inviteSuccessCount') }}</div>
          <div class="value">{{ inviteTotal }}</div>
        </div>
        <div class="item">
          <div class="label">{{ $t('invite.allIncome') }}</div>
          <div class="value">{{ $t('post.yuanItem') + totalMoney }}</div>
        </div>
      </header>
      <main>
        <el-tabs v-model="activeName">
          <el-tab-pane :label="$t('invite.invitedUser')" name="invited"><invited @view-detail="viewDetail" /></el-tab-pane>
          <el-tab-pane :label="$t('invite.incomeDetail')" name="income"><income /></el-tab-pane>
        </el-tabs>
      </main>
    </div>
  </div>

</template>

<script>
import { time2MinuteOrHour } from '@/utils/time'
export default {
  layout: 'center_layout',
  name: 'InviteExtension',
  filters: {
    formatDate(date) {
      return time2MinuteOrHour(date)
    }
  },
  data() {
    return {
      loading: false,
      activeName: 'invited',
      inviteTotal: 0,
      totalMoney: 0,
      isShowDetail: false,
      detail: {}, // 用户详细收益
      pageNum: 1,
      pageSize: 10,
      total: 0,
      detailUserId: '',
      detailTotalMoney: 0,
      incomeDetailList: [] // 收益详情列表
    }
  },
  computed: {
    userId() {
      return this.$store.state.user.info.id
    }
  },
  mounted() {
    this.getInviteList()
    this.getIncomeList()
  },
  methods: {
    // 获取成功邀请人数
    getInviteList() {
      const params = {
        'page[number]': 1,
        'page[limit]': 10
      }
      this.$store.dispatch('jv/get', ['invite/users', { params }]).then((res) => {
        console.log('res', res)
        if (res && res._jv) {
          this.inviteTotal = res._jv.json.meta.total
          this.inviteList = res
        }
      })
    },
    // 获取累计收益
    getIncomeList() {
      const params = {
        include: 'sourceUser',
        'filter[user]': this.userId,
        'filter[change_type]': '33, 62, 34',
        'page[number]': 1,
        'page[limit]': 10
      }
      this.$store.dispatch('jv/get', ['wallet/log', { params }]).then(res => {
        if (res && res._jv) {
          this.totalMoney = res._jv.json.meta.sumChangeAvailableAmount
        }
      })
    },
    viewDetail(item) {
      console.log('id', item)
      this.detail = item
      this.isShowDetail = true
      this.detailUserId = item.user_id
      this.getIncomeDetailList()
    },
    // 获取用户详情收益
    getIncomeDetailList() {
      this.loading = true
      const params = {
        include: 'sourceUser',
        'filter[user]': this.userId,
        'filter[change_type]': '33, 62, 34',
        'page[number]': this.pageNum,
        'page[limit]': this.pageSize,
        'sort': this.sort,
        'filter[source_user_id]': this.detailUserId
      }
      this.$store.dispatch('jv/get', ['wallet/log', { params }]).then(res => {
        if (res._jv) {
          this.detailTotalMoney = res._jv.json.meta.sumChangeAvailableAmount
          this.total = res._jv.json.meta.total
          delete res._jv
        }
        this.incomeDetailList = res
        console.log('incomeDetailList,', res)
      }, e => {
        this.handleError(e)
      }).finally(() => {
        this.loading = false
      })
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
    handleSizeChange(val) {
      this.pageNum = 1
      this.pageSize = val
      this.getInviteList()
    },
    handleCurrentChange(val) {
      this.pageNum = val
      this.getInviteList()
    }
  },
  head() {
    return {
      title: this.$t('invite.invite')
    }
  }
}
</script>
<style lang='scss' scoped>
@import '@/assets/css/variable/color.scss';
.invite-container{
  .invite-cont{
    padding: 0 30px;
    @media screen and ( max-width: 1005px ) {
      padding: 0 15px;
    }
  }
  .flex{
    display: flex;
    align-items: center;
  }
  .header{
    .item{
      margin-right: 130px;
      .label{
        font-size: 14px;
        color: #6D6D6D;
      }
      .value{
        font-size: 20px;
        margin-top: 10px;
      }
    }
    .item-invite{
      text-align:right;
    }
  }
  .el-tabs ::v-deep{
    margin-top: 40px;
    .el-tabs__active-bar, .el-tabs__nav-wrap::after {
      height: 0;
    }
    .el-tabs__nav-wrap{
      border-bottom: 1px solid #E4E4E4;
      padding-bottom:5px;
    }
    .el-tabs__item{
      font-size: 16px;
      color: #B5B5B5;
      &.is-active{
        color:#000;
        font-size: 18px;
        font-weight:bold;
      }
    }
    .el-tabs__header .el-tabs__item:hover {
      color: $color-blue-deep;
    }
  }
  .detail-header{
    .title{
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 20px;
      padding-bottom: 13px;
      padding: 0 30px 13px;
      border-bottom: 1px solid $border-color-base;
      @media screen and ( max-width: 1005px ) {
        padding: 0 15px 13px;
      }
    }
    .user{
      display: flex;
      align-items: center;
      padding: 0 30px;
      @media screen and ( max-width: 1005px ) {
        padding: 0 15px;
      }
      .user-info{
        margin-left: 15px;
        .user-name{
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 5px;
          display: block;
        }
        .create-at{
          color: $font-color-grey;
          font-size: 12px;
        }
      }
    }
    .total-money{
      flex: 1;
      text-align: right;
      .label{
        font-size: 14px;
        color: #6D6D6D;
      }
      .value{
        font-size: 20px;
      }
    }
  }
  .main{
    min-height: 500px;
    padding: 0 30px;
    margin-top: 30px;
    @media screen and ( max-width: 1005px ) {
      padding: 0 15px;
    }
    .invite-total{
      color: #777777;
      @media screen and ( max-width: 1005px ) {
        padding: 0 15px;
      }
    }
    .el-table{
      margin-top: 15px;
      ::v-deep thead th {
        color: #303133;
        background-color: #fafafa;
        &:nth-last-child(2){
          text-align: right;
        }
      }
      .last-table{
        text-align: right;
        color: #606266;
      }
      .user-name{
        margin-left: 10px;
        &:hover{
          color: $color-blue-base;
        }
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
  }
}

</style>
