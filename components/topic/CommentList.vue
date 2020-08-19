<template>
  <div>
    <div v-for="(comment, index) in commentList" :key="index" class="comment">
      <div class="title">
        <Avatar :user="comment.user || {}" size="45" />
        <div class="title-info">
          <div class="author-name">{{ comment.user ? comment.user.username : '' }}</div>
          <div class="timer">{{ formatDate(comment.updatedAt) }}</div>
        </div>
      </div>
      <div class="container-detail">
        <div class="content-html" @click="showAll($event, index, commentList)" v-html="formatSummary(comment)" />
        <div class="actions">
          <span @click="$emit('like', comment)">
            <svg-icon :type="comment.isLiked ? 'liked' : 'like'" style="font-size: 14px" />
            <span class="text">{{ $t('topic.like') }} {{ comment.likeCount > 0 ? comment.likeCount : '' }}</span>
          </span>
          <span @click="commentTa">
            <svg-icon type="comment" style="font-size: 14px" />
            <span class="text">回复“Ta”</span>
          </span>
          <span>
            <span class="text">已有回复 {{ comment.replyCount > 0 ? comment.replyCount : '' }}</span>
          </span>
        </div>
      </div>
      <div class="reply-list">
        <div v-for="(reply, replyIndex) in replyList[index]" :key="replyIndex" class="reply">
          <div class="title">
            <Avatar :user="reply.user || {}" size="30" />
            <div class="title-info">
              <span class="author-name">{{ reply.user ? reply.user.username : '' }}</span>
              <span class="text">回复</span>
              <span class="text">{{ comment.user ? comment.user.username : '' }}   </span>
              <span class="timer">{{ formatDate(reply.updatedAt) }}</span>
            </div>
          </div>
          <div class="content-html" @click="showAll($event, replyIndex, replyList)" v-html="formatSummary(reply)" />
        </div>
        <div v-if="comment.replyCount > 3" class="show-all-reply" @click="getReply(comment._jv.id, index)">展开其他 {{ comment.replyCount - 3 }} 条回复</div>
      </div>
    </div>
  </div>
</template>

<script>
const commentInclude = 'commentPosts,commentPosts.user'
import handleError from '@/mixin/handleError'
import dayjs from 'dayjs'

export default {
  name: 'CommentList',
  mixins: [handleError],
  props: {
    commentList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      replyList: []
    }
  },
  watch: {
    commentList: {
      handler(val) {
        this.replyList = val.map(item => item.lastThreeComments)
      },
      deep: true
    }

  },
  methods: {
    formatDate(date) {
      return dayjs(date).format('YYYY-MM-DD HH:mm')
    },
    formatSummary(comment) {
      if (comment.contentHtml !== comment.summary) {
        return comment.summary + `&nbsp&nbsp&nbsp<button style="color: #00479B; cursor: pointer" class="showAllComment">全部<button>`
      } else {
        return comment.contentHtml
      }
    },
    showAll(e, index, contentList) {
      if (e.target.matches('.showAllComment')) e.target.parentElement.innerHTML = contentList[index].contentHtml
    },
    getReply(id, index) {
      this.$store.dispatch('jv/get', [`posts/${id}`, { params: { include: commentInclude }}]).then(data => {
        this.$set(this.replyList, index, data.commentPosts.reverse())
      }, e => this.handleError(e))
    },
    commentTa() {
      alert('回复评论')
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '@/assets/css/variable/color.scss';

  $fontColor: #8590A6;
  .comment {
    padding-top: 20px;
    border-top: 1px solid $border-color-base;
    display: flex;
    flex-direction: column;
    width: 100%;
    &:first-child {
      border-top: none;
    }

    > .title {
      height: 45px;
      display: flex;

      > .title-info {
        margin-left: 15px;
        margin-top: 5px;
        flex: 1;

        .author-name {
          font-size: 16px;
          font-weight: bold;
        }

        .timer {
          margin-top: 5px;
          color: $fontColor;
          font-size: 12px;
        }
      }
    }

    > .container-detail {
      margin-left: 60px;

      > .content-html {
        margin-top: 10px;

        ::v-deep p {
          font-size: 16px;
        }

        ::v-deep img {
          height: 22px;
        }

        ::v-deep a {
          color: $color-blue-base;
        }
      }

      > .actions {
        margin-top: 20px;
        margin-bottom: 20px;
        width: 320px;
        display: flex;
        justify-content: space-between;
        color: $fontColor;

        > span {
          flex: 1;
          cursor: pointer;

          &:last-child {
            cursor: default;
          }

          > .text {
            margin-left: 5px;
          }
        }
      }
    }

    > .reply-list {
      margin-left: 60px;

      > .reply {
        padding-top: 10px;
        &:first-child {
          border-top: 1px solid $border-color-base;
        }

        > .title {
          height: 30px;
          display: flex;

          > .title-info {
            margin-left: 10px;
            margin-top: 5px;
            font-size: 16px;
            flex: 1;

            > .author-name {
              font-weight: bold;
            }

            > .text {
              color: $fontColor;
            }

            .timer {
              margin-top: 5px;
              color: $fontColor;
              font-size: 12px;
            }
          }
        }

        > .content-html {
          margin-top: 10px;
          padding-bottom: 20px;
          margin-left: 40px;
          border-bottom: 1px solid $border-color-base;

          ::v-deep p {
            font-size: 16px;
          }

          ::v-deep img {
            height: 22px;
          }

          ::v-deep a {
            color: $color-blue-base;
          }
        }
      }
      > .show-all-reply {
        cursor: pointer;
        color: $fontColor;
        margin: 20px 0 20px 40px;
      }
    }
  }
</style>
