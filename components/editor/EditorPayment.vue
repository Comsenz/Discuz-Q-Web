<template>
  <div class="global">
    <div class="block">
      <div class="text">{{ $t('post.isPay') }}:</div>
      <el-select :value="isPaid" placeholder="请选择" @change="value => $emit('update:isPaid', value)">
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </div>
    <div class="block">
      <div v-show="isPaid">
        <div class="text">{{ $t('post.paymentAmount') }}:</div>
        <label>
          <span>{{ $t('post.yuanItem') }}</span>
          <input :value="price" maxlength="7" type="number" @input="onPriceInput">
        </label>
      </div>
    </div>
    <div class="block">
      <div v-show="isPaid && type === 1">
        <div class="text">{{ $t('post.freeWordCount') }}:</div>
        <label>
          <span>{{ $t('post.wordItem') }}</span>
          <input :value="freeWords" max="10000" type="number" @input="onFreeWordInput">
        </label>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EditorPayment',
  props: {
    isPaid: {
      type: Boolean,
      default: false
    },
    freeWords: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      default: 0
    },
    type: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
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
    onFreeWordInput(e) {
      if (e.target.value.length >= 5) e.target.value = e.target.value.substr(0, 5)
      if (e.target.value === '') e.target.value = 0
      this.$emit('update:freeWords', parseInt(e.target.value))
    },
    onPriceInput(e) {
      if (e.target.value.length >= 7) e.target.value = e.target.value.substr(0, 7)
      if (e.target.value === '') e.target.value = 0
      this.$emit('update:price', parseFloat(e.target.value))
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

      .text {
        color: $font-color;
        margin-bottom: 10px;
      }

      label {
        display: flex;
        width: 100%;
        border: 1px solid $border-color-base;
        border-radius: 4px;

        > span {
          display: block;
          width: 30px;
          background: #F5F6F7;
          line-height: $height;
          height: $height;
          text-align: center;
        }

        > input {
          flex: 1;
          display: block;
          width: 100%;
          line-height: $height;
          height: $height;
          border: none;
          padding: 0 5px;
          color: $font-color;
          background: #F5F6F7;
        }
      }
    }
  }

  ::v-deep.el-select {
    height: $height;
    > .el-input {
      height: $height;
      > input {
        background: #F5F6F7;
        height: $height;
      }
      > span {
        top: 4px;
      }
    }
  }

</style>
