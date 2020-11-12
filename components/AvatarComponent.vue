<template>
  <div class="global">
    <Avatar :user="author" :size="size" :round="round" />
    <div class="title-info">
      <div class="author-name">
        <span class="username"> <nuxt-link :to="'/user/' + author.id">{{ author.username }}</nuxt-link></span>
        <span v-if="author.groups && author.groups[0] && author.groups[0].isDisplay" class="group">（{{ author.groups[0].name }}）</span>
      </div>
      <div class="timer">
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AvatarComponent',
  props: {
    author: {
      type: Object,
      default: () => {}
    },
    size: {
      type: Number,
      default: 50
    },
    round: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '@/assets/css/variable/color.scss';
  .global {
    display: flex;
    > .title-info {
      margin-left: 15px;

      .author-name {
        font-size: 16px;
        > .username {
          font-weight: bold;
        }
        > .group {
          font-weight: normal;
          white-space: nowrap;
          font-size: 12px;
          line-height: 20px;
          color: #8590A6;
        }
      }

      .timer {
        margin-top: 5px;
        color: $font-color-grey;
        font-size: 12px;
      }
    }
  }

</style>
