<template>
  <div class="global">
    <div class="title">
      <Avatar :user="comment.user || {}" size="45" />
      <div class="title-info">
        <div class="author-name">{{ comment.user ? comment.user.username : '' }}</div>
        <div class="timer">{{ formatDate(comment.updatedAt) }}</div>
      </div>
    </div>
    <div class="container-detail">
      <div class="content-html" v-html="comment.contentHtml" />
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'

export default {
  name: 'CommentDetail',
  props: {
    comment: {
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
  @import '@/assets/css/variable/color.scss';
  $fontColor: #8590A6;
  .global {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    width: 100%;
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
    }
  }
</style>
