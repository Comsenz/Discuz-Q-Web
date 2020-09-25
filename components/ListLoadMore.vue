<template>
  <div class="load-more-container">
    <loading v-if="loading" />
    <template v-else>
      <div v-if="hasMore && pageNum % 5 === 0" class="load-more" @click="loadMore">{{ surplus > 0 ? $t('notice.checkMore',{surplus}) : $t('topic.showMore') }}</div>
      <loading v-else-if="hasMore && pageNum % 5 > 0" />
      <div v-else class="no-more"><svg-icon v-if="length === 0" type="empty" class="empty-icon" />{{ length > 0 ? $t('discuzq.list.noMoreData') : $t('discuzq.list.noData') }}</div>
    </template>
  </div>
</template>
<script>
import scroll from '@/mixin/scroll'
export default {
  mixins: [scroll],
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    hasMore: {
      type: Boolean,
      default: false
    },
    pageNum: {
      type: [Number, String],
      default: 1
    },
    length: {
      type: [Number, String],
      default: 0
    },
    // 剩余多少条
    surplus: {
      type: [Number, String],
      default: 0
    }
  },
  methods: {
    // 滚动加载更多，每5页停止滚动加载
    scrollLoadMore() {
      if (this.pageNum % 5 > 0 && !this.loading && this.hasMore) {
        this.loadMore()
      }
    },
    loadMore() {
      this.$emit('loadMore')
    }
  }
}
</script>
