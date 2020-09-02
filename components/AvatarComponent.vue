<template>
  <div class="global">
    <Avatar :user="author" :size="size" />
    <div class="title-info">
      <div class="author-name">{{ author.username }}{{ author.groups ? ' (' + author.groups[0].name + ')' : '' }}</div>
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
      default: () => {
      }
    },
    size: {
      type: Number,
      default: 50
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
      margin-top: 5px;

      .author-name {
        font-size: 16px;
        font-weight: bold;
      }

      .timer {
        margin-top: 5px;
        color: $font-color-grey;
        font-size: 12px;
      }
    }
  }

</style>
