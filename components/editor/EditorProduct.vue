<template>
  <div class="product-container">
    <div class="block">
      <div class="title">
        <span>{{ $t("permission.createThreadGoods") }}:</span>
        <span class="select-product" @click="showProductDialog = true">
          {{
            Object.keys(addedProduct).length > 0
              ? ""
              : "+" + $t("post.addProduct")
          }}
        </span>
      </div>
      <div v-if="Object.keys(addedProduct).length > 0" class="product-info">
        <el-image :src="addedProduct.image_path" class="image" />
        <div class="right">
          <div class="title">
            <svg-icon
              v-if="typeList[addedProduct.type] && addedProduct.title"
              :type="typeList[addedProduct.type]"
              class="icon"
            />
            {{ addedProduct.title }}
          </div>
          <div class="bottom">
            <span class="price">{{
              addedProduct.price > 0
                ? $t("post.yuanItem") + addedProduct.price + $t("post.yuan")
                : ""
            }}</span>
            <svg-icon type="delete" class="icon" @click="remove" />
          </div>
        </div>
      </div>
    </div>
    <product-dialog
      v-if="showProductDialog"
      @close="showProductDialog = false"
      @inputedLink="inputedLink"
    />
  </div>
</template>

<script>
import timerDiff from '@/mixin/timerDiff';

export default {
  name: 'EditorProduct',
  mixins: [timerDiff],
  props: {
    product: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      addedProduct: {},
      showProductDialog: false,
      typeList: {
        1: 'product-tmall',
        2: 'product-jd',
        3: 'product-pinduoduo',
        5: 'product-taobao',
        7: 'product-youzan'
      }
    };
  },
  computed: {
    forums() {
      return this.$store.state.site.info.attributes || {};
    }
  },
  watch: {
    product: {
      handler(val) {
        this.addedProduct = val;
      },
      deep: true
    }
  },
  mounted() {
    this.addedProduct = { ...this.product };
  },
  methods: {
    inputedLink(product) {
      this.addedProduct = product;
      this.showProductDialog = false;
      this.$emit('productChange', product);
    },
    remove() {
      this.addedProduct = {};
      this.$emit('productChange', this.addedProduct);
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/variable/color.scss";

.product-container {
  > .block {
    margin-top: 20px;
    > .title {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 10px;
      color: #6d6d6d;
      > .select-product {
        font-weight: normal;
        color: $color-blue-base;
        margin-left: 10px;
        cursor: pointer;
      }
    }
    > .product-info {
      display: flex;
      padding: 10px;
      background: #f4f5f6;
      border: 1px solid #ededed;
      border-radius: 2px;
      > .image {
        width: 80px;
        height: 80px;
        margin-right: 10px;
        border-radius: 2px !important;
      }
      > .right {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        > .title {
          > .icon {
            margin-right: 5px;
            font-size: 17px;
          }
        }
        > .bottom {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;
          > .price {
            color: #fa5151;
            font-size: 16px;
            font-weight: bold;
          }
          > .icon {
            font-size: 16px;
            color: #6e6e6e;
            cursor: pointer;
          }
        }
      }
    }
  }
}
</style>
