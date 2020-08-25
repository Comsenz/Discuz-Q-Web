<template>
  <div class="loading-container">
    <i class="el-icon-loading" :style="`font-size: ${fontSize}px`" />
  </div>
</template>
<script>
export default {
  props: {
    fontSize: {
      type: Number,
      default: 32
    }
  }
}
</script>
<style lang="scss" scoped>
.loading-container{
  text-align: center;
  padding:20px 0;
}
</style>
