<template>
  <div class="comment-header">
    <div class="count">{{ commentCount + ' ' + $t('topic.item') + $t('topic.comment') }}</div>
    <div class="sort" @click="$emit('update:isPositiveSort', !isPositiveSort)">
      <svg-icon type="sort" style="font-size: 14px" />
      <span>{{ isPositiveSort ? $t('topic.switchToNegativeSort') : $t('topic.switchToPositiveSort') }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CommentHeader',
  props: {
    commentCount: {
      type: Number,
      default: 0
    },
    isPositiveSort: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '@/assets/css/variable/color.scss';
  .comment-header {
    display: flex;
    justify-content: space-between;
    padding-top: 20px;
    border-top: 1px solid $border-color-base;
    color: #6D6D6D;
    > .count {
      font-size: 16px;
      font-weight: bold;
    }
    > .sort {
      cursor: pointer;
      font-size: 14px;
      > span {
        margin-left: 5px;
      }
    }
  }

</style>
