<template>
  <div class="chat-container">
    <div
      v-if="item.sender && +item.sender_user_id !== +userId"
      class="avatar"
    >
      <avatar
        :user="{
          id: item.sender.id,
          username: item.sender.username,
          avatarUrl: item.sender.avatarUrl,
          isReal: item.sender.isReal
        }"
        :size="50"
      />
      <div
        v-if="item.recipient_read_at === null"
        class="red-dot"
      />
    </div>
    <div
      v-if="item.recipient && +item.recipient_user_id !== +userId"
      class="avatar"
    >
      <avatar
        :user="{ id: item.recipient.id,
                 username: item.recipient.username,
                 avatarUrl: item.recipient.avatarUrl,
                 isReal: item.recipient.isReal
        }"
        :size="50"
      />
      <div
        v-if="item.sender_read_at === null"
        class="red-dot"
      />
    </div>
    <div class="detail">
      <div class="top">
        <template v-if="+item.sender_user_id !== +userId">
          <nuxt-link
            v-if="item.sender && item.sender.username"
            :to="`/user/${item.sender.id}`"
            class="user-name"
          >{{ item.sender.username }}
            <span
              v-if="item.sender.groups && item.sender.groups.length > 0 && item.sender.groups[0].isDisplay"
              class="text"
            >({{ item.sender.groups[0].name }})</span>
          </nuxt-link>
          <span class="text">{{ $t('notice.chat') }}</span>
        </template>
        <template v-if=" +item.recipient_user_id !== +userId">
          <nuxt-link
            v-if="item.recipient && item.recipient.username"
            :to="`/user/${item.recipient.id}`"
            class="user-name"
          >{{ item.recipient.username }}
            <span
              v-if="item.recipient.groups && item.recipient.groups.length > 0 && item.recipient.groups[0].isDisplay"
              class="text"
            >({{ item.recipient.groups[0].name }})</span>
          </nuxt-link>
          <span class="text">{{ $t('notice.chat') }}</span>
        </template>
        <div class="time">
          {{ (item.dialogMessage ? item.dialogMessage.created_at : item.created_at) | formatDate }}
        </div>
      </div>
      <div
        class="post-content"
        @click="showChatBox"
        v-html="$xss(item.dialogMessage && item.dialogMessage.summary)"
      />
    </div>
  </div>
</template>
<script>
import { time2MinuteOrHour } from '@/utils/time';
export default {
  name: 'ChatItem',
  filters: {
    formatDate(date) {
      return time2MinuteOrHour(date);
    }
  },
  props: {
    userId: {
      type: [String, Number],
      default: ''
    },
    item: {
      type: Object,
      default: () => { }
    }
  },
  data() {
    return {

    };
  },
  methods: {
    // 打开对话框 传值给父组件
    showChatBox() {
      this.$emit('show-chat-box', this.item);
    }
  }
};
</script>
<style lang="scss" scoped>
@import "@/assets/css/variable/color.scss";
@import "@/assets/css/variable/mixin.scss";
.chat-container {
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
  &:hover {
    background: #fafbfc;
  }
  .avatar {
    position: relative;
    margin-right: 15px;
    .system-avatar {
      padding: 10px;
      border: 1px solid #ededed;
      border-radius: 5px;
      .icon {
        font-size: 34px;
      }
    }
    .red-dot {
      position: absolute;
      top: -2px;
      right: -2px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #fa5151;
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
        display: inline-flex;
        align-items: center;
        .text {
          font-size: 12px;
          color: $font-color-grey;
          margin-left: 5px;
          font-weight: normal;
        }
      }
      .text {
        color: #6d6d6d;
        margin-left: 10px;
      }
      .time {
        color: #b5b5b5;
        font-size: 14px;
        margin-top: 3px;
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
      cursor: pointer;
      &:hover {
        color: $color-blue-base;
      }
    }
  }
}
</style>
