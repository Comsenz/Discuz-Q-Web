<template>
  <div class="global">
    <Avatar :user="author" :size="size" :round="round" />
    <div class="title-info">
      <div class="author-name">
        <span class="username"> {{ author.username }} </span>
        <span v-if="author.groups" class="pop">{{ author.groups[0].name }}</span>
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
    align-items: center;
    > .title-info {
      margin-left: 15px;
      margin-top: 5px;

      .author-name {
        font-size: 16px;
        font-weight: bold;
        > .username {
          margin-right: 6px;
        }
        > .pop {
          white-space: nowrap;
          font-size: 14px;
          line-height: 16px;
          border-radius: 8px;
          padding: 2px 10px;
          background: $background-color-grey;
          color: $font-color-grey;
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
