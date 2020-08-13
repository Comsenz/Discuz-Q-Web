<template>
  <div class="post-container">
    <Avatar :user="detail.user" class="avatar" />
    <div class="main-cont">
      <div class="top-flex">
        <div class="user-name">{{ detail.user && detail.user.username }}</div>
        <div class="time">发布于{{ formatDate(detail.createdAt) }}</div>
      </div>
      <template v-if="detail.firstPost">
        <div class="content">
          <div v-html="detail.firstPost.contentHtml" />
        </div>
        <div class="bottom-handle">
          <div class="btn like" :class="{'liked': detail.firstPost.isLiked}">{{ detail.firstPost.isLiked ? $t('topic.giveLikeAlready') : $t('topic.like') }} {{ detail.firstPost.likeCount > 0 ? detail.firstPost.likeCount : '' }}</div>
        </div>
      </template>
    </div>
  </div>
</template>
<script>
import dayjs from 'dayjs'
export default {
  props: {
    detail: {
      type: Object,
      default: () => {}
    }
  },
  methods: {
    formatDate(date) {
      return dayjs(date).format('YYYY-MM-DD HH:mm')
    }
  }
}
</script>
<style lang="scss" scoped>
.post-container{
  display: flex;
  padding:20px;
  border-bottom: 1px solid #E4E4E4;
  .main-cont{
    flex: 1;
    margin-left: 15px;
    .top-flex{
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .user-name{
      font-size:16px;
      font-weight: bold;
    }
    .time{
      color: #8590A6;
      font-size:12px;
    }
    .content{
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 4;
      -webkit-box-orient: vertical;
      word-break:break-all;
      line-height: 20px;
      color: #000;
      ::v-deep p {
        font-size: 16px;
      }

      ::v-deep img {
        height: 22px;
      }
    }
    .bottom-handle{
      display: flex;
      align-items: center;
      margin-top: 20px;
      .btn{
        color: #8590A6;
      }
      .like{
        padding: 7px 15px;
        line-height: 1;
        border-radius:2px;
        &.liked{
          background: #E5F2FF;
          color:#1878F3;
        }
      }
    }
  }
}
</style>
