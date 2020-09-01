<template>
  <div>
    <comment-header v-if="(postCount - 1) > 0" :comment-count="commentList.length" :is-positive-sort.sync="isPositiveSort" />
    <div v-else class="without-comment">{{ $t('topic.noComment') }}</div>
    <editor
      editor-style="comment"
      :type-information="commentType"
      :post.sync="comment"
      :on-publish="onCommentPublish"
      @publish="postCommentPublish"
    />
    <template v-if="(postCount - 1) > 0">
      <!-- 深拷贝后 reverse() 是为了防止无限更新   -->
      <comment-list
        v-loading="loading"
        :thread-id="threadId"
        :comment-list="isPositiveSort ? [...commentList] : [...commentList].reverse()"
        @replyPublish="getComment(true)"
        @deleteComment="deleteComment"
        @like="onLike"
      />
      <div v-if="(postCount - 1) > pageLimit" class="container-show-more">
        <button v-if="(postCount - 1) !== commentList.length" class="show-more" @click="showMore">{{ $t('topic.showMore') }}</button>
        <button v-else class="show-more" @click="foldComment">{{ $t('topic.foldComment') }}</button>
      </div>
    </template>
  </div>
</template>

<script>
const postInclude = 'user,replyUser,images,thread,user.groups,thread.category,thread.firstPost,lastThreeComments,lastThreeComments.user,lastThreeComments.replyUser,deletedUser,lastDeletedLog'
import publishResource from '@/mixin/publishResource'
import handleError from '@/mixin/handleError'
export default {
  name: 'Comment',
  mixins: [handleError, publishResource],
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
      pageCount: 1,
      pageLimit: 5,
      onCommentPublish: false,
      comment: { text: '', imageList: [], attachedList: [] },
      commentType: { type: 4, textLimit: 450, showPayment: false, showTitle: false, showImage: true, showVideo: false,
        showAttached: false, showMarkdown: false, showEmoji: true, showTopic: false, showCaller: true },
      loading: true
    }
  },
  created() {
    this.getComment()
  },
  methods: {
    getComment(fold = false) {
      this.$store.dispatch('jv/get', [`posts`, { params: {
        'filter[isApproved]': 1,
        'filter[thread]': this.threadId,
        'filter[isDeleted]': 'no',
        'filter[isComment]': 'no',
        'page[number]': this.pageCount,
        'page[limit]': this.pageLimit,
        include: postInclude
      }}]).then(data => {
        this.loading = false
        fold ? this.commentList = data : this.commentList.push(...data)
        if (data.length > 0) this.postCount = data[0].thread.postCount
      }, e => this.handleError(e))
    },
    showMore() {
      this.pageCount += 1
      this.getComment()
    },
    foldComment() {
      this.pageCount = 1
      this.getComment(true)
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
          this.pageCount = 1
          this.getComment(true)
        }, e => this.handleError(e))
      }, () => console.log('取消删除'))
    },
    postCommentPublish() {
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
      return this.$store.dispatch('jv/post', commentParams).then(() => {
        this.$emit('publish')
        this.comment.text = ''
        this.comment.imageList = []
        this.getComment()
        this.$message.success('评论发布成功')
      }, e => handleError(e)).finally(() => { this.onCommentPublish = false })
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
