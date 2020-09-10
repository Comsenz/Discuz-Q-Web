<template>
  <div class="notice-container">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane v-for="(item, index) in noticeTypeList" :key="index" :label="item.label" :name="item.value" />
    </el-tabs>
    <div class="notice-list">
      <notice-item v-for="(item, index) in noticeList" :key="index" :item="item" />
      <loading v-if="loading" />
      <template v-else>
        <div v-if="hasMore" class="load-more" @click="loadMore">{{ $t('notice.checkMore',{surplus}) }}</div>
        <div v-else class="no-more"><svg-icon v-if="noticeList.length === 0" type="empty" class="empty-icon" />{{ noticeList.length > 0 ? $t('discuzq.list.noMoreData') : $t('discuzq.list.noData') }}</div>
      </template>
    </div>
  </div>
</template>

<script>
import handleError from '@/mixin/handleError'
export default {
  mixins: [handleError],
  data() {
    return {
      activeName: 'related',
      noticeTypeList: [
        {
          label: '私信',
          value: 'chat'
        }, {
          label: '@我的',
          value: 'related'
        }, {
          label: '回复我的',
          value: 'replied'
        }, {
          label: '点赞我的',
          value: 'liked'
        }, {
          label: '支付我的',
          value: 'rewarded'
        }, {
          label: '系统通知',
          value: 'system'
        }
      ],
      noticeList: [],
      pageNum: 1,
      pageSize: 10,
      loading: false,
      hasMore: false,
      surplus: 0 // 剩余多少
    }
  },
  mounted() {
    this.getNoticeList()
  },
  methods: {
    getNoticeList() {
      this.loading = true
      const params = {
        'filter[type]': this.activeName,
        'page[number]': this.pageNum,
        'page[limit]': this.pageSize
      }
      this.$store.dispatch('jv/get', ['notification', { params }]).then(data => {
        this.hasMore = data.length === this.pageSize
        if (this.pageNum === 1) {
          this.noticeList = data
        } else {
          this.noticeList = [...this.noticeList, ...data]
        }
        this.surplus = data._jv.json.meta.total - this.noticeList.length
        console.log('noticeList', data)
      }, e => {
        this.handleError(e)
      }).finally(() => {
        this.loading = false
      })
    },
    loadMore() {
      if (this.hasMore) {
        this.pageNum += 1
        this.getNoticeList()
      }
    },
    handleClick(e) {
      console.log('e', e)
      if (e !== 'chat') {
        this.pageNum = 1
        this.noticeList = []
        this.getNoticeList()
      }
    }
  }
}
</script>
<style lang='scss' scoped>
@import '@/assets/css/variable/color.scss';
.notice-container{
  .el-tabs ::v-deep{
    .el-tabs__header{
      margin: 0;
    }
    .el-tabs__active-bar, .el-tabs__nav-wrap::after {
      height: 0;
    }
    .el-tabs__nav-wrap{
      border-bottom: 1px solid #E4E4E4;
      padding-bottom:5px;
      padding-left: 30px;
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
  }
  .notice-list{
    min-height: 400px;
    .load-more{
      color: $color-blue-base;
      border:1px solid $color-blue-base;
      font-size: 16px;
      text-align: center;
      padding:12px 0;
      line-height: 1;
      cursor: pointer;
      margin: 20px;
      border-radius:2px;
    }
  }
}
</style>
