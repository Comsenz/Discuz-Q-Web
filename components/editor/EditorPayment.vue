<template>
  <div class="global">
    <div class="block">
      <div class="text">{{ $t('post.isPay') }}:</div>
      <el-select
        size="medium"
        :value="payment.isPaid"
        placeholder="请选择"
        @change="value => $emit('paymentChange', { key: 'isPaid', value })"
      >
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </div>
    <div class="block">
      <div v-show="payment.isPaid">
        <div class="text">{{ $t('post.paymentAmount') }}:</div>
        <el-input
          v-model="price"
          size="medium"
          placeholder="0"
          maxlength="7"
          @change="$emit('paymentChange', { key: 'price', value: parseFloat(price) })"
          @input="onPriceInput"
        >
          <span slot="prefix" class="prefix">￥</span>
        </el-input>
      </div>
    </div>
    <div class="block">
      <div v-show="payment.isPaid && type === 1">
        <div class="text">{{ $t('post.freeWordCount') }}:</div>
        <el-input
          v-model="freeWords"
          size="medium"
          placeholder="0"
          maxlength="5"
          @change="$emit('paymentChange', { key: 'freeWords', value: parseInt(freeWords) })"
          @input="onFreeWordInput"
        >
          <span slot="prefix" class="prefix">字</span>
        </el-input>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EditorPayment',
  props: {
    payment: {
      type: Object,
      default: () => {}
    },
    type: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      freeWords: this.payment.freeWords || '',
      price: this.payment.price || '',
      options: [
        {
          value: false,
          label: this.$t('post.freeWatch')
        },
        {
          value: true,
          label: this.$t('post.paidWatch')
        }]
    }
  },
  methods: {
    onFreeWordInput(value) {
      this.freeWords = value.replace(/[^\d]/g, '')
    },
    onPriceInput(value) {
      this.price = value.replace(/[^\d.]/g, '')
        .replace(/^\./g, '')
        .replace(/\.{2,}/g, '.')
        .replace('.', '$#$')
        .replace(/\./g, '')
        .replace('$#$', '.') // 只能输入两个小数
        .replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3')
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '@/assets/css/variable/color.scss';

  $font-color: #6D6D6D;
  $height: 35px;
  .global {
    width: 100%;
    display: flex;
    margin-top: 20px;

    > .block {
      flex: 1;
      display: flex;
      flex-direction: column;
      margin-left: 22px;
      font-size: 14px;

      &:first-child {
        margin-left: 0;
      }

      .prefix {
        line-height: 38px;
        font-size: 17px;
        color: $font-color-grey
      }

      .text {
        color: $font-color;
        margin-bottom: 10px;
      }
    }
  }

  ::v-deep.el-input {
    background: #F5F6F7;
    > input {
      background: #F5F6F7;
    }
  }

  ::v-deep.el-select {
    > .el-input {
      > input {
        background: #F5F6F7;
      }
    }
  }

</style>
