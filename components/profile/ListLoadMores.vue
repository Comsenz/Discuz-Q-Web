<template>
  <div class="load-more-container">
    <loading v-if="loading" />
    <template v-else>
      <div v-if="hasMore && pageNum % 5 === 0" class="load-more" @click="loadMore">{{ surplus > 0 ? $t('notice.checkMore',{surplus}) : loadMoreText }}</div>
      <loading v-else-if="hasMore && pageNum % 5 > 0" />
      <div v-else :class="length === 0 ? 'no-more2': 'no-more'"><svg-icon v-if="length === 0" type="empty" class="empty-icon" />{{ length > 0 ? $t('discuzq.list.noMoreData') : $t('discuzq.list.noData') }}</div>
    </template>
  </div>
</template>
<script>
import scroll from '@/mixin/scroll'
export default {
  name: 'Listloadmores',
  mixins: [scroll],
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    // 是否还有更多
    hasMore: {
      type: Boolean,
      default: false
    },
    // 当前页码
    pageNum: {
      type: [Number, String],
      default: 1
    },
    // 已显示的数量
    length: {
      type: [Number, String],
      default: 0
    },
    // 剩余多少条
    surplus: {
      type: [Number, String],
      default: 0
    },
    // 加载更多文案
    loadMoreText: {
      type: String,
      default: function() {
        return this.$t('topic.showMore')
      }
    }
  },
  methods: {
    // 滚动加载更多，每5页停止滚动加载
    scrollLoadMore() {
      if (this.pageNum % 5 > 0 && !this.loading && this.hasMore) {
        this.loadMore()
      }
    },
    // 点击加载更多
    loadMore() {
      this.$emit('loadMore')
    }
  }
}
</script>
<style lang='scss' scoped>
@import "@/assets/css/variable/color.scss";
.empty-icon {
  width: 20px;
  height: 18px;
  margin-right: 10px;
}
.no-more2 {
  text-align: center;
  padding: 20px 0;
  color: #8590a6;
  font-size: 14px;
  min-height: 810px;
}
</style>

