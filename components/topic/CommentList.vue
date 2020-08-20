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
        <div v-if="comment.images && comment.images.length > 0" class="images">
          <el-image
            v-for="(image, imageIndex) in comment.images"
            :key="imageIndex"
            style="width: 100px; height: 100px;border-radius: 5px; margin-right: 10px"
            :src="image.thumbUrl"
            :alt="image.filename"
            :preview-src-list="[...comment.images.map(item => item.thumbUrl)]"
            fit="contain"
          />
        </div>
        <div class="actions">
          <div class="left">
            <span v-if="comment.canLike" @click="$emit('like', {comment, index})">
              <svg-icon :type="comment.isLiked ? 'liked' : 'like'" style="font-size: 14px" />
              <span class="text">{{ $t('topic.like') }} {{ comment.likeCount > 0 ? comment.likeCount : '' }}</span>
            </span>
            <span @click="commentTa">
              <svg-icon type="comment" style="font-size: 14px" />
              <span class="text">{{ $t('topic.replyTa') }}</span>
            </span>
            <span>
              <span v-if="comment.replyCount > 0 " class="text">{{ $t('topic.replyAlready') + ' ' + comment.replyCount }}</span>
            </span>
          </div>
          <div v-if="comment.canDelete" class="right" @click="$emit('deleteComment', comment._jv.id)">{{ $t('topic.delete') }}</div>
        </div>
      </div>
      <div class="reply-list">
        <div v-for="(reply, replyIndex) in replyList[index]" :key="replyIndex" class="reply">
          <div class="title">
            <Avatar :user="reply.user || {}" size="30" />
            <div class="title-info">
              <span class="author-name">{{ reply.user ? reply.user.username : '' }}</span>
              <span class="text">{{ $t('topic.reply') }}</span>
              <span class="text">{{ comment.user ? comment.user.username : '' }}   </span>
              <span class="timer">{{ formatDate(reply.updatedAt) }}</span>
              <span v-if="reply.canDelete" class="delete-reply" @click="$emit('deleteComment', reply._jv.id)">{{ $t('topic.delete') }}</span>
            </div>
          </div>
          <div class="content-html" @click="showAll($event, replyIndex, replyList)" v-html="formatSummary(reply)" />
          <div v-if="reply.images && reply.images.length > 0" class="images">
            <el-image
              v-for="(image, imageIndex) in reply.images"
              :key="imageIndex"
              style="width: 100px; height: 100px;border-radius: 5px; margin-right: 10px"
              :src="image.thumbUrl"
              :alt="image.filename"
              :preview-src-list="[...reply.images.map(item => item.thumbUrl)]"
              fit="contain"
            />
          </div>
        </div>
        <div v-if="comment.replyCount > 3">
          <div v-if="comment.replyCount !== (replyList[index] || []).length" class="show-all-reply" @click="getReply(comment._jv.id, index)">
            {{ $t('topic.showOther') }} {{ comment.replyCount - 3 }} {{ $t('topic.item') + $t('topic.reply') }}
          </div>
          <div v-else class="show-all-reply" @click="foldReply(index)">{{ $t('topic.foldReply') }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const commentInclude = 'commentPosts,commentPosts.user,images'
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
      replyList: [],
      showAllReplay: false
    }
  },
  watch: {
    commentList: {
      handler(val) {
        if (!this.showAllReplay) this.replyList = val.map(item => item.lastThreeComments)
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
      this.showAllReplay = true
      this.$store.dispatch('jv/get', [`posts/${id}`, { params: { include: commentInclude }}]).then(data => {
        this.$set(this.replyList, index, data.commentPosts.reverse())
      }, e => this.handleError(e))
    },
    foldReply(index) {
      this.showAllReplay = false
      this.$set(this.replyList, index, this.commentList[index].lastThreeComments)
    },
    commentTa() {
      alert('回复评论')
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '@/assets/css/variable/color.scss';

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
          color: $font-color-grey;
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

      > .images {
        margin-top: 20px;
        width: 330px;
      }

      > .actions {
        margin-top: 20px;
        margin-bottom: 20px;
        width: 100%;
        display: flex;
        justify-content: space-between;
        color: $font-color-grey;

        > .left {
          width: 320px;
          display: flex;
          justify-content: space-between;
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
        > .right {
          cursor: pointer;
          color: $color-blue-base;
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
              color: $font-color-grey;
            }

            > .delete-reply {
              cursor: pointer;
              font-size: 14px;
              color: $color-blue-base;
              float: right;
            }

            > .timer {
              margin-top: 5px;
              color: $font-color-grey;
              font-size: 12px;
            }
          }
        }

        &:last-child {
          > .content-html {
            border-bottom: none;
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
      .show-all-reply {
        cursor: pointer;
        color: $font-color-grey;
        margin: 20px 0 20px 40px;
      }
    }
  }
</style>
