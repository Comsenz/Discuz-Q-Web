<template>
  <message-box
    v-loading="loading"
    :title="$t('post.addProduct')"
    overflow="visible"
    width="620px"
    class="message-box-product"
    @close="$emit('close')"
  >
    <div class="top">
      <div class="tips">{{ $t("post.supportedLink") }}</div>
      <div class="supported-type">
        <div v-for="(item, index) in supportedType" :key="index" class="item">
          <svg-icon :type="item.icon" class="icon" />{{ item.text }}
        </div>
      </div>
      <textarea
        v-model="link"
        class="input-link"
        :placeholder="$t('post.goodsLink')"
      />
    </div>
    <div class="bottom">
      <div class="container">
        <el-button size="medium" type="primary" @click="handleLink">{{
          $t("discuzq.ok")
        }}</el-button>
        <el-button size="medium" @click="$emit('close')">{{
          $t("post.cancel")
        }}</el-button>
      </div>
    </div>
  </message-box>
</template>

<script>
import handleError from '@/mixin/handleError';
export default {
  name: 'ProductDialog',
  mixins: [handleError],
  data() {
    return {
      supportedType: [
        { icon: 'product-jd', text: this.$t('post.jd') },
        { icon: 'product-taobao', text: this.$t('post.taobao') },
        { icon: 'product-tmall', text: this.$t('post.tmall') },
        { icon: 'product-pinduoduo', text: this.$t('post.pinduoduo') },
        { icon: 'product-youzan', text: this.$t('post.youzan') }
      ],
      link: '',
      loading: false
    };
  },
  computed: {},
  mounted() {},
  methods: {
    // 解析商品链接
    handleLink() {
      if (!this.link) {
        this.$message.error(this.$t('post.goodsLinkEmpty'));
        return;
      }
      this.loading = true;
      const params = {
        _jv: {
          type: 'goods/analysis'
        },
        type: 'analysis',
        address: this.link
      };
      this.$store
        .dispatch('jv/post', params)
        .then(
          res => {
            if (res && res._jv) {
              this.link = '';
              this.$emit('inputedLink', res);
            }
          },
          e => this.handleError(e)
        )
        .finally(() => {
          this.loading = false;
        });
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/variable/color.scss";
$font-color: #606266;
$black-color: #000;
.top {
  z-index: 100;
  padding: 40px 20px;
  > .tips {
    color: $font-color;
    font-size: 16px;
  }
  > .supported-type {
    display: flex;
    margin-top: 10px;
    > .item {
      margin-right: 39px;
      color: $black-color;
      font-size: 14px;
      > .icon {
        margin-right: 10px;
        font-size: 16px;
      }
    }
  }
  > .input-link {
    min-height: 120px;
    width: 100%;
    border: none;
    background: #f4f5f6;
    color: #333;
    font-size: 14px;
    margin-top: 20px;
    font-family: inherit;
    border: 1px solid #dcdfe6;
    padding: 8px 18px;
  }
}
.bottom {
  height: 55px;
  padding: 0 20px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  background: $background-color-editor;

  > .container {
    height: 36px;

    .text {
      margin-right: 20px;
    }
  }
}
</style>
