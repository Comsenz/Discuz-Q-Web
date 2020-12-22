<template>
  <div>
    <Cover />
    <div class="message-box" :style="{overflow: overflow, width: width} ">
      <div class="container-title">
        <div class="title">{{ title }}</div>
        <svg-icon style="font-size: 14px; cursor: pointer; fill: #6d6d6d" type="close" @click="$emit('close')" />
      </div>
      <slot />
    </div>
  </div>

</template>

<script>
export default {
  name: 'MessageBox',
  props: {
    width: {
      type: String,
      default: '820px'
    },
    title: {
      type: String,
      default: ''
    },
    overflow: {
      type: String,
      default: 'auto'
    }
  }
};
</script>

<style lang="scss" scoped>
  .message-box {
    z-index: 100;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 3px;
    width: 820px;
    max-height: 100vh;
    background: #ffffff;
    font-size: 16px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    > .container-title {
      display: flex;
      justify-content: space-between;
      color: #6D6D6D;
      margin: 20px 20px 0;

      > .title {
        font-size: 16px;
        font-weight: bold;
      }
    }
  }
  @media screen and ( max-width: 1005px ) {
    .message-box {
      width: 750px;
    }
  }

</style>
