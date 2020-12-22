<template>
  <a v-if="item" :href="item.detail_content" target="_blank" class="product-container" el="nofollow">
    <el-image
      :src="item.image_path"
      :alt="item.title"
      fit="cover"
      class="image"
    >
      <div slot="placeholder" class="image-slot">
        <i class="el-icon-loading" />
      </div>
    </el-image>
    <div class="info">
      <div class="info-header">
        <div class="title">{{ item.title }}</div>
        <div v-if="item.price > 0" class="price">{{ $t('post.yuanItem') + item.price + $t('post.yuan') }}</div>
      </div>
      <div class="btn"><svg-icon type="product-icon" class="icon" />{{ $t('post.buyProudct') }}</div>
    </div>
  </a>
</template>
<script>
export default {
  name: 'ProductItem',
  props: {
    // 接收postGoods
    item: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {};
  }
};
</script>
<style lang="scss" scoped>
@import "@/assets/css/variable/mixin.scss";
.product-container{
  display: flex;
  background: #F4F5F6;
  padding: 10px;
  border-radius: 2px;
  margin-top: 20px;
  .image {
    width: 120px;
    height: 120px;
    margin-right: 15px;
    border-radius: 2px !important;
    .image-slot {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      background: #f5f7fa;
      color: #909399;
      font-size: 22px;
    }
  }
  .info{
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: space-between;
    .title{
      line-height: 24px;
      @include text-hidden(2);
    }
    .price{
      color: #FA5151;
      font-size: 16px;
      font-weight: bold;
      margin-top: 10px;
    }
    .btn{
      width: 106px;
      height: 30px;
      line-height: 30px;
      color: #ffffff;
      background: #FA5151;
      text-align:center;
      border-radius: 2px;
      margin-top: 10px;
      .icon {
        margin-right: 7px;
      }
    }
  }
}
</style>
