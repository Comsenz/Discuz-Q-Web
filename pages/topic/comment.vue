<template>
  <div class="page-comment">
    <main v-loading="loading">
      <div class="container-comment">
        <div class="title">
          <avatar-component :author="comment.user || {}">
            {{ timerDiff(comment.updatedAt) + $t('topic.before') }}..
          </avatar-component>
          <div class="delete-comment">
            <div class="wrapper" @click="deleteComment({ id: comment._jv.id, type: 'comment' })">
              <svg-icon type="trash" style="font-size: 16px" />
              <span>{{ $t('topic.delete') }}</span>
            </div>
          </div>
        </div>
        <topic-content :article="comment || {}" :paid-information="{paid: true, price: 0}" :thread-type="3" :category="{}" :video="{}" />
        <div class="thread-card">
          <avatar-component :size="40" round :author="thread && thread.user || {}">
            {{ timerDiff(thread.createdAt) + $t('topic.before') }} ..
          </avatar-component>
          <div v-show="thread && thread.firstPost" class="content-html" v-html="thread && thread.firstPost && thread.firstPost.summary || ''" />
          <nuxt-link :to="`/topic/index?id=${thread._jv ? thread._jv.id : ''}`" class="view-more">{{ $t('topic.viewDetail') }}</nuxt-link>
          <svg-icon v-if="thread && thread.isEssence" style="font-size: 50px;" type="essence-comment" class="essence" />
        </div>
        <div id="reply" class="container-reply">
          <comment-header v-if="replyList.length > 0" :comment-count="replyList.length" :is-positive-sort.sync="isPositiveSort" />
          <div v-else class="without-comment">{{ $t('topic.noComment') }}</div>
          <div v-loading="replyLoading">
            <reply-list :reply-list="replyList || []" @delete="deleteComment" @onLike="onLike" />
          </div>
        </div>
      </div>
    </main>
    <topic-aside :author="thread && thread.user || {}" />
  </div>
</template>

<script>
const threadInclude = 'posts.replyUser,user.groups,user,posts,posts.user,posts.likedUsers,posts.images,firstPost,firstPost.likedUsers,firstPost.images,firstPost.attachments,rewardedUsers,category,threadVideo,paidUsers'
const commentInclude = 'user,likedUsers,commentPosts,commentPosts.user,commentPosts.user.groups,commentPosts.replyUser,commentPosts.replyUser.groups,commentPosts.mentionUsers,commentPosts.images,images,attachments'
const replyInclude = 'replyUser,user.groups,user,images'
import handleError from '@/mixin/handleError'
import timerDiff from '@/mixin/timerDiff'
// import service from '@/api/request'

export default {
  name: 'Comment',
  layout: 'custom_layout',
  mixins: [timerDiff, handleError],
  async asyncData({ store, query }) {
    const threadId = query.threadId
    const commentId = query.commentId
    try {
      const thread = await store.dispatch('jv/get', [`threads/${threadId}`, { params: { include: threadInclude }}])
      const comment = await store.dispatch('jv/get', [`posts/${commentId}`, { params: { include: commentInclude }}])
      // TODO 暂时不用 SSR 避免出问题
      // const replyList = await store.dispatch('jv/get', [`posts`, {
      //   params: {
      //     'filter[thread]': threadId,
      //     'filter[reply]': commentId,
      //     'filter[isDeleted]': 'no',
      //     sort: '-createdAt',
      //     'filter[isComment]': 'yes',
      //     include: replyInclude
      //   }
      // }])
      // const { data: { included: commentIncluded }} = await service.get(`posts/${commentId}`, { include: commentInclude })
      // if (comment && commentIncluded) comment.user = commentIncluded.filter(item => item.type === 'users')[0].attributes
      return { thread, comment }
    } catch (e) {
      console.log('ssr err', e)
      return { loading: true }
    }
  },
  data() {
    return {
      thread: {},
      comment: {},
      isPositiveSort: true,
      replyList: [],
      replyLoading: false,
      loading: false
    }
  },
  computed: {
    threadId() {
      return this.$route.query.threadId
    },
    commentId() {
      return this.$route.query.commentId
    }
  },
  watch: {
    isPositiveSort() {
      this.getReplyList()
    }
  },
  mounted() {
    if (Object.keys(this.comment).length === 0) this.getComment().then(() => { this.loading = false })
    if (Object.keys(this.thread).length === 0) this.getThread()
    this.getReplyList()
  },
  methods: {
    getThread() {
      return this.$store.dispatch('jv/get', [`threads/${this.threadId}`, { params: { include: threadInclude }}]).then(response => {
        if (response.isDeleted) return this.$router.push('/404')
        this.thread = response
      }, e => this.handleError(e))
    },
    getComment() {
      return this.$store.dispatch('jv/get', [`posts/${this.commentId}`, { params: { include: commentInclude }}]).then(response => {
        if (response.isDeleted) return this.$router.push('/404')
        this.comment = response
      }, e => this.handleError(e))
    },
    getReplyList() {
      if (this.replyLoading) return
      this.replyLoading = true
      return this.$store.dispatch('jv/get', [`posts`, {
        params: {
          'filter[thread]': this.threadId,
          'filter[reply]': this.commentId,
          'filter[isDeleted]': 'no',
          sort: this.isPositiveSort ? '-createdAt' : 'createdAt',
          'filter[isComment]': 'yes',
          include: replyInclude
        }
      }]).then(response => {
        this.replyList = response
      }, e => this.handleError(e)).finally(() => { this.replyLoading = false })
    },
    deleteComment({ id, type }) {
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
          type === 'comment' ? this.$router.push(`/topic/index?id=${this.thread._jv.id}`) : this.getReplyList()
          this.$message.success(this.$t('topic.deleteSuccess'))
        }, e => this.handleError(e))
      }, () => console.log('取消删除'))
    },
    onLike({ reply, index }) {
      const params = {
        _jv: { type: `posts`, id: reply._jv.id },
        isLiked: !reply.isLiked,
        include: replyInclude
      }
      return this.$store.dispatch('jv/patch', params).then(data => {
        this.$set(this.replyList, index, data)
      }, e => this.handleError(e))
    }
  },
  head() {
    return {
      title: this.comment ? this.comment.summaryText : '评论详情页'
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '@/assets/css/variable/color.scss';

  .page-comment {
    background: #F4F5F6;
    width: 100%;
    display: flex;
    justify-content: space-between;

    main {
      background: transparent;
      flex: 1;

      > .container-comment {
        border-radius: 3px;
        padding: 20px;
        width: 100%;
        background: #ffffff;

        > .title {
          height: 50px;
          display: flex;
          justify-content: space-between;

          > .delete-comment {
            > .wrapper {
              cursor: pointer;

              span {
                color: $font-color-grey;
              }
            }
          }
        }

        > .thread-card {
          position: relative;
          margin-top: 30px;
          width: 100%;
          padding: 15px;
          background: $background-color-grey;
          > .content-html {
            margin-top: 10px;
            word-break: break-all;
          }
          > .view-more {
            position: absolute;
            right: 15px;
            bottom: 15px;
            color: $color-blue-base;
          }
          > .essence {
            position: absolute;
            top: -12px;
            right: 15px;
          }
        }

        > .container-reply {
          margin-top: 40px;
          > .without-comment {
            color: $font-color-grey;
            text-align: center;
          }
        }
      }
    }
  }

</style>
