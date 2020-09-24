<template>
  <div>
    <!-- <Cover /> -->
    <div class="checkout-counter">
      <div class="container-title">
        <div class="title">{{ title }}</div>
        <svg-icon
          style="font-size: 14px; cursor: pointer; fill: #6d6d6d"
          type="close"
          @click="$emit('close')"
        />
      </div>
      <slot />
    </div>
  </div>

</template>

<script>
export default {
  name: 'Regmessage',
  props: {
    title: {
      type: String,
      default: ''
    },
    content: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="scss" scoped>
.checkout-counter {
     z-index: 100;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 3px;
    min-height: calc(100vh - 65px - 80px - 15px);
    overflow: auto;
    background: white;
    /* margin: 15px auto 0; */
    /* padding: 0px 15px; */
    font-size: 16px;
    /* display: flex; */
    /* flex-direction: column; */
  // width: 1005px;
 min-height: calc(100vh - 65px - 80px - 15px);
  @media screen and (max-width: 1005px) {
    width: 100%;
    min-width: 768px;
  }
  > .container-title {
    display: flex;
    justify-content: space-between;
    color: #6d6d6d;
    margin: 60px 40px 0;

    > .title {
      font-size: 24px;
      font-weight: bold;
      color:#000000;
    }
  }
}
@media screen and (max-width: 1005px) {
  .checkout-counter {
    width: 750px;
  }
}
</style>
