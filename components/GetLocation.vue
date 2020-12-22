<template>
  <div class="location">
    <iframe
      id="mapPage"
      class="map-page"
      :src="`https://apis.map.qq.com/tools/locpicker?search=1&type=1&key=${key}&referer=discuzq`"
    />
    <svg-icon type="close" class="icon-cancel" @click="$emit('close')" />
    <Cover />
  </div>
</template>

<script>
export default {
  name: 'GetLocation',
  computed: {
    key() {
      const forums = this.$store.state.site.info.attributes;
      return forums.lbs.qq_lbs_key;
    }
  }
};
</script>

<style lang="scss" scoped>
  $width: 500px;
  $height: 700px;
  .location {
    position: fixed;
    top: 50%;
    left: 50%;
    width: $width;
    height: $height;
    z-index: 1000;
    transform: translate(-50%, -50%);

    > .map-page {
      border: none;
      width: $width;
      height: $height;
      border-radius: 8px;
    }

    > .icon-cancel {
      position: absolute;
      font-size: 30px;
      fill: #fff;
      cursor: pointer;
      top: 0;
      right: -40px;
    }
  }

</style>
