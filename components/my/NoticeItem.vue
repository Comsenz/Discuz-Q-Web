<template>
  <div class="notice-item">
    <div class="avatar">
      <div
        v-if="item.type === 'system'"
        class="system-avatar"
      >
        <svg-icon
          type="system-notice"
          class="icon"
        />
      </div>
      <avatar
        v-else
        :user="{ id: item.user_id,username: item.user_name, avatarUrl: item.user_avatar}"
        :size="50"
      />
    </div>
    <div class="detail">
      <div class="top">
        <template v-if="item.type !== 'system'">
          <nuxt-link
            v-if="item.user_name"
            :to="`/pages/profile/index?userId=${item.user_id}`"
            class="user-name"
          >{{ item.user_name }}
          </nuxt-link>
          <span class="text">
            <template v-if="item.type === 'rewarded'">
              <template v-if="item.isScale">
                {{ item.order_type === 1
                  ? typeMap['registerScale'] : item.order_type === 2
                    ? typeMap['rewardScale'] : item.order_type === 3
                      ? typeMap['payScale'] : typeMap[item.type] }}
              </template>
              <template v-else-if="item.order_type === 3">{{ typeMap['payMe'] }}</template>
              <template v-else>{{ typeMap[item.type] }}</template>
            </template>
            <template v-else>{{ typeMap[item.type] }}</template>
          </span>
        </template>
        <div
          v-if="item.title && item.type === 'system'"
          class="user-name"
        >{{ item.title }}</div>
        <div class="time">{{ timerDiff(item.created_at) + $t('topic.before') }}</div>
      </div>
      <nuxt-link
        v-if="item.post_content"
        :to="`/pages/topic/comment?threadId=${item.thread_id}&commentId=${item.reply_post_id !== 0
          ? item.reply_post_id : item.post_id}`"
        class="post-content"
        v-html="$xss(item.post_content)"
      />
      <nuxt-link
        v-if="(item.thread_title || item.content) && item.type !== 'system'"
        :to="`/pages/topic/index?id=${item.thread_id}`"
        class="thread"
        target="_blank"
      >
        <div class="thread-user-name">{{ item.thread_username }}:</div>
        <div class="thread-title">
          <div
            v-if="item.thread_title"
            v-html="$xss(item.thread_title)"
          />
          <div
            v-else-if="item.content"
            v-html="$xss(item.content)"
          />
        </div>
        <div class="to-detail">{{ $t('notice.toDetail') }}</div>
      </nuxt-link>
      <div
        v-if="item.type === 'system'"
        class="post-content"
        v-html="$xss(item.content)"
      />
      <div
        v-if="item.type === 'withdrawal'"
        class="thread"
      >
        <template v-if="item.cash_status === 2">{{ $t('notice.approved') }}</template>
        <template v-if="item.cash_status === 3">{{ $t('notice.unapproved') }}</template>
      </div>
      <div
        v-if="item.type === 'withdrawal' && item.cash_actual_amount"
        class="amount"
      >
        - {{ $t('post.yuanItem') + item.cash_actual_amount }}
      </div>
      <div
        v-if="item.type === 'rewarded' && item.amount"
        class="amount"
      >
        + {{ $t('post.yuanItem') + item.amount }}
      </div>
    </div>
  </div>
</template>
<script>
import handleError from '@/mixin/handleError'
import timerDiff from '@/mixin/timerDiff'
export default {
  mixins: [timerDiff, handleError],
  props: {
    item: {
      type: Object,
      default: () => { }
    }
  },
  data() {
    return {
      typeMap: {
        related: this.$t('notice.relatedMe'),
        replied: this.$t('notice.repliedMe'),
        liked: this.$t('notice.likedMe'),
        rewarded: this.$t('notice.rewardedMe'),
        payMe: this.$t('notice.payMe'),
        registerScale: this.$t('notice.registerScale'),
        rewardScale: this.$t('notice.rewardScale'),
        payScale: this.$t('notice.payScale'),
        system: this.$t('notice.system')
      }
    }
  },
  methods: {

  }
}
</script>
<style lang="scss" scoped>
@import "@/assets/css/variable/color.scss";
@import "@/assets/css/variable/mixin.scss";
.notice-item {
  padding: 30px;
  display: flex;
  position: relative;
  @media screen and (max-width: 1005px) {
    padding: 15px;
  }
  &:after {
    content: "";
    position: absolute;
    bottom: 0;
    right: 0;
    width: calc(100% - 30px);
    height: 1px;
    background: $line-color-base;
    @media screen and (max-width: 1005px) {
      width: calc(100% - 15px);
    }
  }
  .avatar {
    margin-right: 15px;
    .system-avatar {
      padding: 10px;
      border: 1px solid #ededed;
      border-radius: 5px;
      .icon {
        font-size: 34px;
      }
    }
  }
  .detail {
    flex: 1;
    font-size: 16px;
    @media screen and (max-width: 1005px) {
      font-size: 14px;
    }
    .top {
      .user-name {
        font-weight: bold;
      }
      .text {
        color: #6d6d6d;
        margin-left: 10px;
      }
      .time {
        color: #b5b5b5;
        font-size: 14px;
      }
    }
    ::v-deep p {
      font-size: 16px;
    }

    ::v-deep img {
      height: 22px;
    }
    @media screen and (max-width: 1005px) {
      font-size: 14px;
      ::v-deep p {
        font-size: 14px;
      }
      ::v-deep img {
        height: 20px;
      }
    }
    .post-content {
      padding: 10px 0 0;
      display: block;
      word-break: break-all;
      @include text-hidden(3);
      &:hover {
        color: $color-blue-base;
      }
    }
    .thread {
      background: #f5f5f5;
      padding: 13px 15px;
      display: flex;
      margin-top: 10px;
      .thread-user-name {
        font-weight: bold;
        margin-right: 10px;
      }
      .thread-title {
        flex: 1;
        @include text-hidden();
        &:hover {
          color: $color-blue-base;
        }
      }
      .to-detail {
        color: $color-blue-base;
      }
    }
    .amount {
      font-size: 18px;
      margin-top: 12px;
      font-weight: bold;
      color: #fa5151;
    }
  }
}
</style>
