<template>
  <div>
    <div v-for="(comment, index) in commentList" :key="index" class="comment">
      <div class="title">
        <avatar-component :author="comment.user" :size="45">
          {{ timerDiff(comment.updatedAt) + $t("topic.before") }}..
        </avatar-component>
        <div class="management">
          <div
            v-if="comment.canEdit"
            class="manage-button"
            @click="$emit('editComment', comment)"
          >
            {{ $t("topic.edit") }}
          </div>
          <div
            v-if="comment.canHide"
            class="manage-button"
            @click="$emit('deleteComment', comment._jv.id)"
          >
            {{ $t("topic.delete") }}
          </div>
          <div v-if="comment.isApproved === 0" class="checking">
            {{ $t("topic.inReview") }}
          </div>
        </div>
      </div>
      <div class="container-detail">
        <div
          class="content-html"
          @click="showAll($event, comment)"
          v-html="$xss(formatSummary(comment))"
        />
        <div
          v-if="comment.images && comment.images.length > 0"
          v-viewer="{ url: 'data-source' }"
          class="images"
        >
          <el-image
            v-for="(image, imageIndex) in comment.images"
            :key="imageIndex"
            style="width: 100px; height: 100px;border-radius: 5px; margin-right: 10px"
            :src="image.thumbUrl"
            :alt="image.filename"
            :data-source="image.url"
            fit="cover"
          />
        </div>
        <div v-show="comment.isApproved === 1" class="actions">
          <div class="left">
            <span
              v-show="comment.canLike"
              @click="$emit('like', { comment, index })"
            >
              <svg-icon
                :type="comment.isLiked ? 'liked' : 'like'"
                style="font-size: 18px"
              />
              <span
                class="text"
              >{{ $t("topic.like") }}
                {{ comment.likeCount > 0 ? comment.likeCount : "" }}</span>
            </span>
            <span
              @click="
                showReplyEditorForIndex =
                  showReplyEditorForIndex === index ? -1 : index
              "
            >
              <svg-icon type="comment" style="font-size: 18px" />
              <span class="text">{{ $t("topic.replyTa") }}</span>
            </span>
            <span>
              <span v-if="comment.replyCount > 0" class="text">{{
                $t("topic.replyAlready") + " " + comment.replyCount
              }}</span>
            </span>
          </div>
          <div class="report" @click="toShield(comment._jv.id)">
            {{ $t("report.reportTitle") }}
          </div>
        </div>
      </div>
      <editor
        v-if="showReplyEditorForIndex === index"
        style="margin-top: 0; margin-bottom: 20px"
        editor-style="reply"
        class="reply-editor"
        selector="reply-editor"
        :type-information="replyType"
        :post.sync="replyPost"
        :on-publish="onReplyPublish"
        @publish="replyPublish(comment._jv.id)"
      />
      <div
        class="reply-list"
        @click="
          $router.push(
            `/thread/comment?threadId=${threadId}&commentId=${comment._jv.id}#reply`
          )
        "
      >
        <div
          v-for="(reply, replyIndex) in replyList[index]"
          :key="replyIndex"
          class="reply"
        >
          <div class="title">
            <Avatar :user="reply.user || {}" size="30" />
            <div class="title-info">
              <span class="author-name">{{
                reply.user ? reply.user.username : ""
              }}</span>
              <span class="text reply">{{ $t("topic.reply") }}</span>
              <span
                class="text comment-author"
              >{{ comment.user ? comment.user.username : "" }}
              </span>
              <span class="timer">{{ formatDate(reply.updatedAt) }}</span>
              <span
                v-if="reply.canHide"
                class="delete-reply"
                @click.stop="
                  $emit('deleteReply', {
                    replyId: reply._jv.id,
                    commentId: comment._jv.id
                  })
                "
              >{{ $t("topic.delete") }}</span>
            </div>
          </div>
          <div
            class="content-html"
            @click="showAll($event, replyIndex, replyList)"
            v-html="$xss(reply.summary)"
          />
          <div
            v-if="reply.images && reply.images.length > 0"
            v-viewer="{ url: 'data-source' }"
            class="images"
            @click.stop="() => {}"
          >
            <el-image
              v-for="(image, imageIndex) in reply.images"
              :key="imageIndex"
              style="width: 100px; height: 100px;border-radius: 5px; margin-right: 10px; margin-bottom: 10px"
              :src="image.thumbUrl"
              :alt="image.filename"
              :data-source="image.url"
              fit="cover"
            />
          </div>
          <div class="line" />
        </div>
        <div v-if="comment.replyCount > 3">
          <div
            v-if="comment.replyCount !== (replyList[index] || []).length"
            class="show-all-reply"
          >
            {{ $t("topic.showOther") }} {{ comment.replyCount - 3 }}
            {{ $t("topic.item") + $t("topic.reply") }}
          </div>
        </div>
      </div>
    </div>
    <topic-report
      v-if="isShield"
      :thread-id="threadId"
      :type="2"
      :comment-id="commentId"
      @close="isShield = false"
    />
  </div>
</template>

<script>
import handleError from '@/mixin/handleError';
import isLogin from '@/mixin/isLogin';
import publishResource from '@/mixin/publishResource';
import postLegalityCheck from '@/mixin/postLegalityCheck';
import timerDiff from '@/mixin/timerDiff';
import s9e from '@/utils/s9e';
import dayjs from 'dayjs';

export default {
  name: 'CommentList',
  mixins: [handleError, timerDiff, publishResource, postLegalityCheck, isLogin],
  props: {
    commentList: {
      type: Array,
      default: () => []
    },
    threadId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      replyList: [],
      onReplyPublish: false,
      showReplyEditorForIndex: -1,
      replyPost: { text: '', imageList: [], attachedList: [] },
      replyType: {
        type: 10,
        textLimit: 5000,
        showPayment: false,
        showTitle: false,
        showImage: true,
        showVideo: false,
        showAttached: false,
        showEmoji: true,
        showTopic: false,
        showCaller: true,
        placeholder: '写下我的评论 ...'
      },
      showAllReply: false,
      replyLoading: false,
      isShield: false,
      commentId: ''
    };
  },
  watch: {
    commentList: {
      handler(val) {
        if (!this.showAllReply) {
          this.replyList = val.map(item => item.lastThreeComments);
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    formatDate(date) {
      return dayjs(date).format('YYYY-MM-DD HH:mm');
    },
    formatSummary(comment) {
      let html;
      if (comment.content !== comment.summaryText) {
        html = `${comment.summary}<button class="showAllComment">${this.$t(
          'topic.all'
        )}</button>`;
      } else {
        html = comment.contentHtml;
      }
      return s9e.parse(html);
    },
    showAll(e, comment) {
      if (e.target.matches('.showAllComment')) {
        this.$router.push(
          `/thread/comment?threadId=${this.threadId}&commentId=${comment._jv.id}`
        );
      }
    },
    replyPublish(id) {
      if (!this.isLogin()) return;
      if (!this.replyPost.text) {
        return this.$message.warning(this.$t('post.theContentCanNotBeBlank'));
      }
      if (this.replyPost.text.length > this.replyType.textLimit) {
        return this.$message.warning(this.$t('post.messageLengthCannotOver'));
      }
      this.onReplyPublish = true;
      const replyParams = {
        _jv: {
          type: `posts`,
          relationships: {
            thread: { data: { type: 'threads', id: this.threadId }}
          }
        },
        isComment: true,
        replyId: id,
        content: this.replyPost.text
      };
      this.publishPostResource(replyParams, this.replyPost);
      return this.$store
        .dispatch('jv/post', replyParams)
        .then(
          response => {
            this.replyPost.text = '';
            this.replyPost.imageList = [];
            this.showReplyEditorForIndex = -1;
            this.postLegalityCheck(
              response,
              this.$t('topic.replyPublishSuccess')
            );
            this.$emit('replyPublish', id);
          },
          e => this.handleError(e)
        )
        .finally(() => {
          this.onReplyPublish = false;
        });
    },
    toShield(commentId) {
      this.isShield = true;
      this.commentId = commentId;
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/variable/color.scss";

.comment {
  padding-top: 20px;
  border-top: 1px solid $line-color-base;
  display: flex;
  flex-direction: column;
  width: 100%;
  &:first-child {
    border-top: none;
  }

  > .title {
    height: 45px;
    display: flex;
    justify-content: space-between;

    > .management {
      font-size: 12px;
      display: flex;
      color: $color-blue-base;
      > div {
        margin-left: 10px;
      }
      > .manage-button {
        cursor: pointer;
        &:hover {
          color: $color-blue-deep;
        }
      }
      > .checking {
        color: #fa5151;
      }
    }
  }

  > .container-detail {
    margin-left: 60px;

    > .content-html {
      word-break: break-all;
      margin-top: 10px;
      font-size: 14px !important;
      ::v-deep p {
        font-size: 14px !important;
      }
      ::v-deep.showAllComment {
        font-size: 14px;
        color: #00479b;
        cursor: pointer;
      }
    }

    > .images {
      margin-top: 20px;
      width: 330px;
    }

    > .actions {
      margin: 20px 0;
      width: 100%;
      display: flex;
      justify-content: space-between;
      color: $font-color-grey;
      font-size: 12px;

      > .left {
        > span {
          margin-right: 60px;
          cursor: pointer;

          &:last-child {
            margin-right: 0;
            cursor: default;
          }

          > .text {
            margin-left: 5px;
          }
        }
      }
      > .report {
        cursor: pointer;
      }
    }
  }

  > .reply-list {
    cursor: pointer;
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
            &.reply {
              margin: 0 10px;
            }
            &.comment-author {
              color: #000000;
              margin-right: 10px;
            }
          }

          > .delete-reply {
            cursor: pointer;
            font-size: 12px;
            color: $color-blue-base;
            float: right;
            &:hover {
              color: $color-blue-deep;
            }
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
        margin-bottom: 20px;
        margin-left: 40px;
        word-break: break-all;
      }

      > .images {
        max-width: 330px;
        margin-left: 40px;
        margin-bottom: 20px;
      }

      > .line {
        margin-left: 40px;
        background: $line-color-base;
        height: 1px;
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
