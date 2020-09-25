<template>
  <div>
    <div v-for="(reply, index) in replyList" :key="index" class="reply-list">
      <div class="title">
        <avatar-component :author="reply.user" :size="45">
          {{ timerDiff(reply.updatedAt) + $t('topic.before') }}..
        </avatar-component>
        <div v-if="reply.isApproved === 0" class="checking">{{ $t('topic.inReview') }}</div>
      </div>
      <div class="container-detail">
        <div class="content-html" v-html="formatHtml(reply.contentHtml)" />
        <div v-if="reply.images && reply.images.length > 0" v-viewer="{url: 'data-source'}" class="images">
          <el-image
            v-for="(image, imageIndex) in reply.images"
            :key="imageIndex"
            style="width: 100px; height: 100px;border-radius: 5px; margin-right: 10px"
            :src="image.thumbUrl"
            :alt="image.filename"
            :data-source="image.url"
            fit="cover"
          />
        </div>
        <div class="actions">
          <div class="left">
            <span v-if="reply.canLike" class="like" @click="$emit('onLike', {reply, index})">
              <svg-icon :type="reply.isLiked ? 'liked' : 'like'" style="font-size: 14px" />
              <span class="text">{{ $t('topic.like') }} {{ reply.likeCount > 0 ? reply.likeCount : '' }}</span>
            </span>
          </div>
          <div v-if="reply.canHide" class="right" @click="$emit('delete', { id: reply._jv.id, type: 'reply' })">{{ $t('topic.delete') }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import s9e from '@/utils/s9e'
import timerDiff from '@/mixin/timerDiff'

export default {
  name: 'ReplyList',
  mixins: [timerDiff],
  props: {
    replyList: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    formatHtml(html) {
      return html ? s9e.parse(html) : ''
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '@/assets/css/variable/color.scss';
  .reply-list {
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
      justify-content: space-between;

      > .checking {
        font-size: 12px;
        color: #FA5151;
      }
    }

    > .container-detail {
      margin-left: 60px;

      > .content-html {
        line-height: 24px;
        word-break: break-all;
        margin-top: 10px;
        font-size: 14px;
        ::v-deep p {
          font-size: 14px;
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
        font-size: 12px;

        > .left {
          > span {
            margin-right: 60px;
            cursor: pointer;

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
  }

</style>
