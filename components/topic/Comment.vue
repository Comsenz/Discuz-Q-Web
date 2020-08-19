<template>
  <div>
    <comment-header :comment-count="commentList.length" :is-positive-sort.sync="isPositiveSort" />
    <comment-list :comment-list="commentList" @like="onLike" />
  </div>
</template>

<script>
const postInclude = 'user,replyUser,images,thread,user.groups,thread.category,thread.firstPost,lastThreeComments,lastThreeComments.user,lastThreeComments.replyUser,deletedUser,lastDeletedLog'
import handleError from '@/mixin/handleError'
export default {
  name: 'Comment',
  mixins: [handleError],
  props: {
    threadId: {
      type: String,
      default: '0'
    },
    postId: {
      type: [Number, String],
      default: 0
    }
  },
  data() {
    return {
      commentList: [],
      isPositiveSort: false
    }
  },
  created() {
    this.getComment()
  },
  methods: {
    getComment() {
      this.$store.dispatch('jv/get', [`posts`, { params: {
        'filter[isApproved]': 1,
        'filter[thread]': this.threadId,
        'filter[isDeleted]': 'no',
        'filter[isComment]': 'no',
        include: postInclude
      }}]).then(data => {
        console.log(data, 'comment-data')
        this.commentList = data
      }, e => this.handleError(e))
    },
    onLike(comment) {
      const params = {
        _jv: { type: `posts`, id: comment._jv.id },
        isLiked: !comment.isLiked
      }
      return this.$store.dispatch('jv/patch', params).then(data => {
        this.getComment()
        console.log(data, 'comment-like')
      }, e => this.handleError(e))
    }
  }
}
</script>

<style scoped>

</style>
