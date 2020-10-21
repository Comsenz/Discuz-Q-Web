<template>
  <div>
    <Cover />
    <div class="checkout-counter">
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
  name: 'TopicCheckoutCounter',
  props: {
    title: {
      type: String,
      default: '',
    },
  },
};
</script>

<style lang="scss" scoped>
  .checkout-counter {
    z-index: 100;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 3px;
    width: 620px;
    max-height: 100vh;
    overflow: auto;
    background: #ffffff;
    font-size: 16px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    > .container-title {
      display: flex;
      justify-content: space-between;
      color: #6D6D6D;
      margin: 25px 20px 0;

      > .title {
        font-size: 16px;
        font-weight: bold;
      }
    }
  }
  @media screen and ( max-width: 1005px ) {
    .checkout-counter {
      width: 750px;
    }
  }

</style>
