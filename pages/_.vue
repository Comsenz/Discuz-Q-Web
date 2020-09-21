<template>
  <div class="container">
    <svg-icon type="404" style="font-size: 180px" />
    <h1 class="tip">{{ $t('core.page_not_found') }}</h1>
    <NuxtLink to="/">
      <button>
        {{ $t('core.back_home') }}
      </button>
    </NuxtLink>
  </div>
</template>

<script>
export default {
  layout: 'error_layout'
}
</script>

<style lang="scss" scoped>
  @import '@/assets/css/variable/color.scss';

  .container {
    text-align: center;

    h1 {
      margin-top: 60px;
    }
    button {
      margin-top: 38px;
      width: 250px;
      height: 45px;
      line-height: 45px;
      text-align: center;
      border: 1px solid $color-blue-base;
      color: $color-blue-base;
      border-radius: 3px;
    }
  }
</style>
