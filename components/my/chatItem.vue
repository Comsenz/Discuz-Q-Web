<template>
  <div class="chat-container">
    <div v-if="item.sender && +item.sender_user_id !== +userId" class="avatar">
      <avatar :user="{ id: item.sender.id,username: item.sender.username, avatarUrl: item.sender.avatarUrl}" :size="50" />
    </div>
    <div v-if="item.recipient && +item.recipient_user_id !== +userId" class="avatar">
      <avatar :user="{ id: item.recipient.id,username: item.recipient.username, avatarUrl: item.recipient.avatarUrl}" :size="50" />
    </div>
    <div class="detail">
      <div class="top">
        <template v-if="+item.sender_user_id !== +userId">
          <nuxt-link v-if="item.sender && item.sender.username" :to="`/profile?userId=${item.sender.id}`" class="user-name">{{ item.sender.username }}</nuxt-link><span class="text">{{ $t('notice.chat') }}</span>
        </template>
        <template v-if=" +item.recipient_user_id !== +userId">
          <nuxt-link v-if="item.recipient && item.recipient.username" :to="`/profile?userId=${item.recipient.id}`" class="user-name">{{ item.recipient.username }}</nuxt-link><span class="text">{{ $t('notice.chat') }}</span>
        </template>
        <div class="time">{{ timerDiff(item.updated_at) + $t('topic.before') }}</div>
      </div>
      <div class="post-content" @click="showChatBox" v-html="item.dialogMessage && item.dialogMessage.summary" />
    </div>
  </div>
</template>
<script>
import timerDiff from '@/mixin/timerDiff'
export default {
  mixins: [timerDiff],
  props: {
    userId: {
      type: [String, Number],
      default: ''
    },
    item: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {

    }
  },
  methods: {
    showChatBox() {
      this.$emit('show-chat-box', this.item)
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/assets/css/variable/color.scss';
@import '@/assets/css/variable/mixin.scss';
.chat-container{
  padding:30px;
  display: flex;
  position: relative;
  @media screen and ( max-width: 1005px ) {
    padding:15px;
  }
  &:after{
    content: '';
    position: absolute;
    bottom: 0;
    right:0;
    width: calc(100% - 30px);
    height: 1px;
    background: #E4E4E4;
    @media screen and ( max-width: 1005px ) {
      width: calc(100% - 15px);
    }
  }
  // &:hover{
  //   background: #FAFBFC;
  //   .delete{
  //     display: block;
  //   }
  // }
  // .delete{
  //   display: none;
  //   position: absolute;
  //   top:32px;
  //   right: 32px;
  //   cursor: pointer;
  // }
  .avatar{
    margin-right: 15px;
    .system-avatar{
      padding:10px;
      border:1px solid #EDEDED;
      border-radius: 5px;
      .icon{
        font-size:34px;
      }
    }
  }
  .detail{
    flex: 1;
    font-size: 16px;
    @media screen and ( max-width: 1005px ) {
      font-size:14px;
    }
    .top{
      .user-name{
        font-weight: bold;

      }
      .text{
        color: #6D6D6D;
        margin-left: 10px;
      }
      .time{
        color: #B5B5B5;
        font-size: 14px;
      }
    }
    ::v-deep p {
        font-size: 16px;
      }

    ::v-deep img {
      height: 22px;
    }
    @media screen and ( max-width: 1005px ) {
      font-size:14px;
      ::v-deep p {
        font-size: 14px;
      }
      ::v-deep img {
        height: 20px;
      }
    }
    .post-content{
      padding:10px 0 0;
      display: block;
      cursor: pointer;
    }
  }
}
</style>
