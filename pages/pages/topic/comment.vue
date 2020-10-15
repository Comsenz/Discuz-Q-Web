<template>
  <div class="page-comment">
    <main v-loading="loading">
      <div class="container-comment">
        <div class="title">
          <avatar-component :author="comment.user || {}">
            {{ timerDiff(comment.updatedAt) + $t('topic.before') }}..
          </avatar-component>
          <div v-show="comment.canHide" class="delete-comment">
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
          <div v-show="thread && thread.firstPost" class="content-html" v-html="thread && thread.firstPost && $xss(thread.firstPost.summary) || ''" />
          <nuxt-link :to="`/pages/topic/index?id=${thread._jv ? thread._jv.id : ''}`" class="view-more">{{ $t('topic.viewDetail') }}</nuxt-link>
          <svg-icon v-if="thread && thread.isEssence" style="font-size: 50px;" type="essence-comment" class="essence" />
        </div>
        <div id="reply" class="container-reply">
          <comment-header v-if="replyCount" :comment-count="replyCount" :is-positive-sort="isPositiveSort" @changeSort="changeSort" />
          <div v-else class="without-comment">{{ $t('topic.noComment') }}</div>
          <editor
            style="margin-top: 20px; margin-bottom: 20px"
            editor-style="comment"
            class="reply-editor"
            selector="reply-editor"
            :type-information="replyType"
            :post.sync="replyPost"
            :on-publish="onReplyPublish"
            @publish="replyPublish(comment._jv.id)"
          />
          <div v-loading="replyLoading">
            <reply-list :reply-list="replyList || []" @delete="deleteComment" @onLike="onLike" />
          </div>
          <list-load-more
            :loading="scrollLoading"
            :length="replyList.length"
            :has-more="replyCount > replyList.length"
            :page-num="pageLimit < growthFactor ? 1 : Math.floor(pageLimit / growthFactor)"
            @loadMore="getReplyList('scroll')"
          />
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
import publishResource from '@/mixin/publishResource'
import postLegalityCheck from '@/mixin/postLegalityCheck'
import handleError from '@/mixin/handleError'
import timerDiff from '@/mixin/timerDiff'
import isLogin from '@/mixin/isLogin'
import env from '@/utils/env'

export default {
  name: 'Comment',
  layout: 'custom_layout',
  mixins: [timerDiff, handleError, isLogin, publishResource, postLegalityCheck],
  async asyncData({ store, query }) {
    if (!env.isSpider) {
      return {}
    }
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
      pageLimit: 5,
      growthFactor: 5,
      replyCount: 0,
      isPositiveSort: true,
      replyList: [],
      replyLoading: false,
      scrollLoading: false,
      loading: false,
      onReplyPublish: false,
      replyPost: { text: '', imageList: [], attachedList: [] },
      replyType: { type: 4, textLimit: 450, showPayment: false, showLocation: false, showTitle: false, showImage: true, showVideo: false,
        showAttached: false, showMarkdown: false, showEmoji: true, showTopic: false, showCaller: true, placeholder: '写下我的回复 ...' }
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
  mounted() {
    if (Object.keys(this.comment).length === 0) this.getComment().then(() => { this.loading = false })
    if (Object.keys(this.thread).length === 0) this.getThread()
    this.getReplyList('scroll')
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
        // TODO replyCount 不包括审核中的评论
        this.replyCount = response.replyCount
        this.comment = response
      }, e => this.handleError(e))
    },
    getReplyList(type) {
      if (this.replyLoading) return
      type === 'commit' ? this.replyLoading = true : this.scrollLoading = true
      return this.$store.dispatch('jv/get', [`posts`, {
        params: {
          'filter[thread]': this.threadId,
          'filter[reply]': this.commentId,
          'page[number]': 1,
          'page[limit]': this.pageLimit,
          'filter[isDeleted]': 'no',
          'filter[isComment]': 'yes',
          sort: this.isPositiveSort ? 'createdAt' : '-createdAt',
          include: replyInclude
        }
      }]).then(response => {
        this.replyList = response
        this.pageLimit += this.growthFactor
      }, e => this.handleError(e)).finally(() => { this.replyLoading = this.scrollLoading = false })
    },
    changeSort(value) {
      this.scrollLoading = true
      this.pageLimit = this.growthFactor
      this.replyList = []
      this.isPositiveSort = value
      this.getReplyList('commit')
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
          type === 'comment' ? this.$router.push(`/pages/topic/index?id=${this.thread._jv.id}`) : this.getReplyList('commit')
          this.replyCount -= 1
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
    },
    replyPublish(id) {
      if (!this.isLogin()) return
      if (!this.replyPost.text) return this.$message.warning(this.$t('post.theContentCanNotBeBlank'))
      if (this.replyPost.text.length > this.replyType.textLimit) return this.$message.warning(this.$t('post.messageLengthCannotOver'))
      this.onReplyPublish = true
      const replyParams = {
        _jv: {
          type: `posts`,
          relationships: {
            thread: { data: { type: 'threads', id: this.thread?._jv?.id }}
          }
        },
        isComment: true,
        replyId: id,
        content: this.replyPost.text
      }
      this.publishPostResource(replyParams, this.replyPost)
      return this.$store.dispatch('jv/post', replyParams).then(response => {
        this.replyPost.text = ''
        this.replyPost.imageList = []
        this.replyCount += 1
        this.getReplyList('commit')
        this.postLegalityCheck(response, this.$t('topic.replyPublishSuccess'))
      }, e => this.handleError(e)).finally(() => { this.onReplyPublish = false })
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
            margin-bottom: 20px;
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
