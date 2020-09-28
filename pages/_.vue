<template>
  <div class="container">
    <svg-icon type="alert" style="font-size: 100px" />
    <h1 class="tip">{{ $t('core.page_not_found') }}</h1>
    <span class="detail">{{ $t('core.page_not_found_detail') }}</span>
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
      margin-top: 10px;
    }
    > .detail {
      widows: 320px;
      color: #AAAAAA;
      line-height: 20px;
      font-size: 16px;
      display: block;
      margin-top: 20px;
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
