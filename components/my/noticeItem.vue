<template>
  <div class="notice-item">
    <div class="item-cont">
      <div class="avatar">
        <div v-if="item.type === 'system'" class="system-avatar">
          <svg-icon type="system-notice" class="icon" />
        </div>
        <avatar v-else :user="{ id: item.user_id,username: item.user_name, avatarUrl: item.user_avatar}" :size="50" />
      </div>
      <div class="detail">
        <div class="top">
          <template v-if="item.type !== 'system'">
            <nuxt-link v-if="item.user_name" :to="`/profile?userId=${item.user_id}`" class="user-name">{{ item.user_name }}<span v-if="item.thread_user_groups === '管理员'" class="text">({{ item.thread_user_groups }})</span></nuxt-link><span class="text">{{ typeMap[item.type] }}</span>
          </template>
          <div v-if="item.title && item.type === 'system'" class="user-name">{{ item.title }}</div>
          <div class="time">{{ timerDiff(item.created_at) + $t('topic.before') }}</div>
        </div>
        <nuxt-link v-if="item.post_content" :to="`/topic/comment?threadId=${item.thread_id}&commentId=${item.post_id}`" class="post-content" v-html="item.post_content" />
        <nuxt-link v-if="(item.thread_title || item.content) && item.type !== 'system'" :to="`/topic/${item.thread_id}`" class="thread">
          <div class="thread-user-name">{{ item.thread_username }}:</div>
          <div class="thread-title">
            <div v-if="item.thread_title" v-html="item.thread_title" />
            <div v-else-if="item.content" v-html="item.content" />
          </div>
          <div class="to-detail">前往</div>
        </nuxt-link>
        <div v-if="item.type === 'system'" class="post-content">{{ item.content }}</div>
        <div v-if="item.type === 'rewarded' && item.amount" class="amount">+ {{ $t('post.yuanItem') + item.amount }}</div>
      </div>
    </div>
  </div>
</template>
<script>
import timerDiff from '@/mixin/timerDiff'
export default {
  mixins: [timerDiff],
  props: {
    item: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      typeMap: {
        'related': this.$t('notice.relatedMe'),
        'replied': this.$t('notice.repliedMe'),
        'liked': this.$t('notice.likedMe'),
        'rewarded': this.$t('notice.rewardedMe'),
        'system': this.$t('notice.system')
      }
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/assets/css/variable/color.scss';
@import '@/assets/css/variable/mixin.scss';
.notice-item{
  padding:30px 0 0 30px;
  @media screen and ( max-width: 1005px ) {
    padding:15px 0 0 15px;
  }
  .item-cont{
    display: flex;
    border-bottom: 1px solid #E4E4E4;
    padding-right:30px;
    padding-bottom: 30px;
    @media screen and ( max-width: 1005px ) {
      padding-right:15px;
      padding-bottom: 15px;
    }
  }
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
      margin:10px 0;
      display: block;
    }
    .thread{
      background: #F5F5F5;
      padding:15px;
      line-height: 1;
      display:flex;
      margin-top: 10px;
      .thread-user-name{
        font-weight: bold;
        margin-right: 10px;
      }
      .thread-title{
        flex: 1;
        @include text-hidden();
      }
      .to-detail{
        color: $color-blue-base;
      }
    }
    .amount{
      font-size:18px;
      margin-top: 12px;
      font-weight: bold;
      color: #FA5151;
    }
  }
}
</style>
