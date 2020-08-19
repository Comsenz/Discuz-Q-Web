<template>
  <div>
    <comment-detail :comment="commentList[0] || {}" />
  </div>
</template>

<script>
export default {
  name: 'CommentList',
  props: {
    commentList: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
