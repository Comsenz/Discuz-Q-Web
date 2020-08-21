<template>
  <div class="author">
    <div class="title">{{ $t('topic.aboutAuthor') }}</div>
    <div class="author-info">
      <Avatar :user="author" size="50" />
      <div class="name">
        <div class="author-name">{{ author.username }}</div>
        <div class="timer">{{ $t('topic.activeAt') }} {{ timerDiff(author.loginAt) }}{{ $t('topic.before') }}</div>
      </div>
    </div>
    <div class="signature">{{ author.signature }}</div>
    <div class="container-billBoard">
      <div v-for="(item, index) in billboard" :key="index" class="billBoard-item">
        <div class="text">{{ item.text }}</div>
        <div class="count">{{ item.count }}</div>
      </div>
    </div>
    <div class="buttons">
      <button @click="followed ? $emit('unFollow') : $emit('follow')">{{ followed ? $t('home.followed') : $t('home.follow') }}</button>
      <button @click="$emit('chat')">{{ $t('topic.sendMessage') }}</button>
    </div>
  </div>
</template>

<script>
import timerDiff from '@/mixin/timerDiff'
export default {
  name: 'AsideHeader',
  mixins: [timerDiff],
  props: {
    author: {
      type: Object,
      default: () => {}
    },
    billboard: {
      type: Array,
      default: () => []
    },
    followed: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '@/assets/css/variable/color.scss';

  .author {
    margin-top: 0;
    padding: 20px;
    background: #ffffff;
    border-radius: 3px;

    > .title {
      font-size: 16px;
      font-weight: bolder;
      color: #6D6D6D;
    }

    > .author-info {
      margin-top: 10px;
      display: flex;

      > .name {
        margin-top: 6px;
        margin-left: 10px;
        color: $font-color-grey;

        > .author-name {
          color: #000;
          font-size: 16px;
          font-weight: bold;
        }
      }
    }

    > .signature {
      margin-top: 10px;
      color: $font-color-grey;
    }

    > .container-billBoard {
      margin-top: 20px;
      padding: 20px 0;
      border-top: 1px solid $border-color-base;
      display: flex;
      justify-content: space-between;

      > .billBoard-item {
        flex: 1;
        text-align: center;

        > .text {
          color: $font-color-grey;
          font-size: 12px;
        }

        > .count {
          font-weight: bold;
          font-size: 16px;
          line-height: 20px;
        }
      }
    }

    > .buttons {
      display: flex;
      justify-content: space-between;

      > button {
        width: 120px;
        height: 35px;
        line-height: 35px;
        border-radius: 3px;
        text-align: center;

        &:nth-child(1) {
          color: white;
          background: $color-blue-base;
        }

        &:nth-child(2) {
          color: $font-color-grey;
          border: 1px solid $border-color-base;
        }
      }
    }
  }
</style>