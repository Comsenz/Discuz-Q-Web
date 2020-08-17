<template>
  <div>
    <Cover />
    <div class="checkout-counter">
      <div class="container-title">
        <div class="title">{{ title }}</div>
        <svg-icon style="font-size: 14px" type="close" @click="$emit('close')" />
      </div>
      <slot />
    </div>
  </div>

</template>

<script>
export default {
  name: 'TopicCheckoutCounter',
  props: {
    title: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="scss" scoped>
  $fontColor: #8590A6;
  .checkout-counter {
    z-index: 100;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 3px;
    width: 820px;
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

</style>
