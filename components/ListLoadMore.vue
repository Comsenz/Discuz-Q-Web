<template>
  <div class="load-more-container">
    <loading v-if="loading" />
    <template v-else>
      <div v-if="hasMore && pageNum % 5 === 0" class="load-more" @click="loadMore">{{ $t('topic.showMore') }}</div>
      <loading v-else-if="hasMore && pageNum % 5 > 0" />
      <div v-else class="no-more"><svg-icon v-if="length === 0" type="empty" class="empty-icon" />{{ length > 0 ? $t('discuzq.list.noMoreData') : $t('discuzq.list.noData') }}</div>
    </template>
  </div>
</template>
<script>
export default {
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
    }
  },
  methods: {
    loadMore() {
      this.$emit('loadMore')
    }
  }
}
</script>
