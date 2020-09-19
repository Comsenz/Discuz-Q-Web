<template>
  <div>
    <comment-header v-if="postCount > 0" :comment-count="postCount" :is-positive-sort.sync="isPositiveSort" />
    <div v-else class="without-comment">{{ $t('topic.noComment') }}</div>
    <editor
      editor-style="comment"
      :type-information="commentType"
      :post.sync="comment"
      :on-publish="onCommentPublish"
      @publish="postCommentPublish"
    />
    <template v-if="postCount > 0">
      <comment-list
        v-loading="loading"
        class="comment-editor"
        selector="comment-editor"
        :thread-id="threadId"
        :comment-list="commentList"
        @replyPublish="getComment()"
        @deleteComment="deleteComment"
        @like="onLike"
      />
      <div v-if="postCount > growthFactor" class="container-show-more">
        <button v-if="postCount !== commentList.length" class="show-more" @click="pageLimit += growthFactor">{{ $t('topic.showMore') }}</button>
        <button v-else class="show-more" @click="pageLimit = growthFactor">{{ $t('topic.foldComment') }}</button>
      </div>
    </template>
  </div>
</template>

<script>
const postInclude = 'user,replyUser,images,thread,user.groups,thread.category,thread.firstPost,lastThreeComments,lastThreeComments.user,lastThreeComments.replyUser,deletedUser,lastDeletedLog,lastThreeComments.images'
import publishResource from '@/mixin/publishResource'
import postLegalityCheck from '@/mixin/postLegalityCheck'
import handleError from '@/mixin/handleError'
export default {
  name: 'Comment',
  mixins: [handleError, publishResource, postLegalityCheck],
  props: {
    threadId: {
      type: String,
      default: '0'
    }
  },
  data() {
    return {
      commentList: [],
      postCount: 0,
      isPositiveSort: true,
      growthFactor: 5,
      pageLimit: 5,
      onCommentPublish: false,
      comment: { text: '', imageList: [], attachedList: [] },
      commentType: { type: 4, textLimit: 450, showPayment: false, showTitle: false, showImage: true, showVideo: false,
        showAttached: false, showMarkdown: false, showEmoji: true, showTopic: false, showCaller: true, placeholder: '写下我的评论 ...' },
      loading: false
    }
  },
  watch: {
    pageLimit() {
      this.getComment()
    },
    isPositiveSort() {
      this.getComment()
    }
  },
  created() {
    this.getComment()
  },
  methods: {
    getComment() {
      if (this.loading === true) return // 事件防抖
      this.loading = true
      this.$store.dispatch('jv/get', [`posts`, { params: {
        'filter[thread]': this.threadId,
        'filter[isDeleted]': 'no',
        'filter[isComment]': 'no',
        'page[number]': 1,
        'page[limit]': this.pageLimit,
        sort: this.isPositiveSort ? '-createdAt' : 'createdAt',
        include: postInclude
      }}]).then(data => {
        console.log(data, 'data')
        this.commentList = data
        this.postCount = data.length > 0 ? (data[0].thread.postCount - 1) : 0
      }, e => this.handleError(e)).finally(() => { this.loading = false })
    },
    onLike({ comment, index }) {
      const params = {
        _jv: { type: `posts`, id: comment._jv.id },
        isLiked: !comment.isLiked,
        include: postInclude
      }
      return this.$store.dispatch('jv/patch', params).then(data => {
        this.$set(this.commentList, index, data)
      }, e => this.handleError(e))
    },
    deleteComment(id) {
      const params = {
        _jv: { type: `posts`, id },
        isDeleted: true
      }
      this.$confirm(this.$t('topic.confirmDelete'), this.$t('discuzq.msgBox.title'), {
        confirmButtonText: this.$t('discuzq.msgBox.confirm'),
        cancelButtonText: this.$t('discuzq.msgBox.cancel'),
        type: 'warning'
      }).then(() => {
        return this.$store.dispatch('jv/patch', params).then(() => {
          this.getComment()
          this.$message.success(this.$t('topic.deleteSuccess'))
        }, e => this.handleError(e))
      }, () => console.log('取消删除'))
    },
    postCommentPublish() {
      if (!this.comment.text) return this.$message.warning(this.$t('post.theContentCanNotBeBlank'))
      if (this.comment.text.length > this.commentType.textLimit) return this.$message.warning(this.$t('post.messageLengthCannotOver'))
      this.onCommentPublish = true
      const commentParams = {
        _jv: {
          type: `posts`,
          relationships: {
            thread: { data: { type: 'threads', id: this.threadId }}
          }
        },
        content: this.comment.text
      }
      this.publishPostResource(commentParams, this.comment)
      return this.$store.dispatch('jv/post', commentParams).then(response => {
        this.$emit('publish')
        this.comment.text = ''
        this.comment.imageList = []
        this.getComment()
        this.postLegalityCheck(response, this.$t('topic.commentPublishSuccess'))
      }, e => this.handleError(e)).finally(() => { this.onCommentPublish = false })
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '@/assets/css/variable/color.scss';

  .container-show-more {
    padding-top: 20px;
    border-top: 1px solid $border-color-base;
    .show-more {
      width: 100%;
      border: 1px solid $color-blue-base;
      border-radius: 3px;
      font-size: 16px;
      height: 45px;
      line-height: 45px;
      color: $color-blue-base;
    }
  }
  .without-comment {
    color: $font-color-grey;
    text-align: center;
  }

</style>
