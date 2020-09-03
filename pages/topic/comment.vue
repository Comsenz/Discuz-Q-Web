<template>
  <div v-loading="loading" class="page-comment">
    <main>
      <div class="container-comment">
        <div class="title">
          <avatar-component :author="thread.user || {}">
            {{ $t('topic.publishAt') }} {{ timerDiff(thread.createdAt) + $t('topic.before') }} ..
            （{{ $t('topic.editAt') }} {{ timerDiff(thread.updatedAt) + $t('topic.before') }}）
          </avatar-component>
          <div class="delete-comment">
            <div class="wrapper" @click="deleteComment">
              <svg-icon type="trash" style="font-size: 16px" @click="deleteComment" />
              <span>删除</span>
            </div>
          </div>
        </div>
        <topic-content
          :article="comment || {}"
          :paid-information="{paid: true, price: 0}"
          :thread-type="3"
          :category="{}"
          :video="{}"
        />
        <div class="comment">
          <comment-header
            v-if="replyList.length > 0"
            :comment-count="replyList.length"
            :is-positive-sort.sync="isPositiveSort"
          />
          <div v-else class="without-comment">{{ $t('topic.noComment') }}</div>
          <div v-loading="replyLoading">
            <reply-list :reply-list="replyList || []" />
          </div>
        </div>
      </div>
    </main>
    <topic-aside :author="thread.user || {}" />
  </div>
</template>

<script>
const threadInclude = 'posts.replyUser,user.groups,user,posts,posts.user,posts.likedUsers,posts.images,firstPost,firstPost.likedUsers,firstPost.images,firstPost.attachments,rewardedUsers,category,threadVideo,paidUsers'
const commentInclude = 'user,likedUsers,commentPosts,commentPosts.user,commentPosts.user.groups,commentPosts.replyUser,commentPosts.replyUser.groups,commentPosts.mentionUsers,commentPosts.images,images,attachments'
const replyInclude = 'replyUser,user.groups,user,images'
import handleError from '@/mixin/handleError'
import timerDiff from '@/mixin/timerDiff'

export default {
  name: 'Comment',
  layout: 'custom_layout',
  mixins: [timerDiff, handleError],
  async asyncData({ store, query }) {
    console.log(query, 'query')
    console.log(threadInclude)
    const threadId = query.threadId
    const commentId = query.commentId
    try {
      const thread = await store.dispatch('jv/get', [`threads/${threadId}`, { params: { include: threadInclude }}])
      const comment = await store.dispatch('jv/get', [`posts/${commentId}`, { params: { include: commentInclude }}])
      // const replyListData = await store.dispatch('jv/get', [`posts`, {
      //   params: {
      //     'filter[thread]': threadId,
      //     'filter[reply]': commentId,
      //     'filter[isDeleted]': 'no',
      //     sort: '-createdAt',
      //     'filter[isComment]': 'yes',
      //     include: replyInclude
      //   }
      // }])
      // let replyList
      // if (Array.isArray(replyListData)) {
      //   replyList = replyListData
      // } else if (replyListData && replyListData._jv && replyListData._jv.json) {
      //   replyList = replyListData._jv.json.data || []
      //   replyList.forEach(reply => {
      //     if (reply.relationships && reply.attributes) {
      //       for (const key in reply.relationships) {
      //         reply.attributes[key] = reply.relationships[key].data
      //         console.log(reply, '111')
      //       }
      //     }
      //   })
      // }
      // console.log(replyList)
      return { thread, comment }
    } catch (e) {
      console.log('ssr err')
    }
  },
  data() {
    return {
      loading: false,
      isPositiveSort: true,
      thread: {},
      comment: {},
      replyList: [],
      replyLoading: false
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
      this.getReply()
    }
  },
  created() {
    this.getReply()
  },
  methods: {
    getThread() {
      return this.$store.dispatch('jv/get', [`threads/${this.threadId}`, { params: { include: threadInclude }}]).then(response => {
        if (response.isDeleted) return this.$router.push('/404')
        this.thread = response
        console.log('thread =>', response)
      }, e => this.handleError(e))
    },
    getComment() {
      return this.$store.dispatch('jv/get', [`posts/${this.commentId}`, { params: { include: commentInclude }}]).then(response => {
        if (response.isDeleted) return this.$router.push('/404')
        this.comment = response
        console.log('comment =>', response)
      }, e => this.handleError(e))
    },
    getReply() {
      if (this.replyLoading) return
      this.replyLoading = true
      this.$store.dispatch('jv/get', [`posts`, {
        params: {
          'filter[thread]': this.threadId,
          'filter[reply]': this.commentId,
          'filter[isDeleted]': 'no',
          sort: this.isPositiveSort ? '-createdAt' : 'createdAt',
          'filter[isComment]': 'yes',
          include: replyInclude
        }
      }]).then(response => {
        this.replyLoading = false
        this.replyList = response
        console.log('reply list', response)
      }, e => this.handleError(e))
    },
    deleteComment() {
      alert('delete')
    },
    like() {
      alert('like')
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

        > .comment {
          > .without-comment {
            color: $font-color-grey;
            text-align: center;
          }
        }
      }
    }
  }

</style>
