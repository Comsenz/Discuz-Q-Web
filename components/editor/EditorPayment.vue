<template>
  <div class="global">
    <div class="block">
      <div class="text">付费模式:</div>
      <el-select v-model="value" placeholder="请选择" @change="value => $emit('update:isPaid', value)">
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
        <div class="text">免费查看字数:</div>
        <label>
          <input placeholder="请输入" maxlength="5" type="text" @input="onFreeWordInput">
        </label>
      </div>
    </div>
    <div class="block">
      <div v-show="isPaid">
        <div class="text">付费金额:</div>
        <label>
          <input placeholder="请输入" maxlength="7" type="text" @input="onPriceInput">
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
    }
  },
  data() {
    return {
      options: [
        {
          value: false,
          label: '免费查看'
        },
        {
          value: true,
          label: '付费查看'
        }],
      value: false
    }
  },
  methods: {
    onFreeWordInput(e) {
      e.target.value = e.target.value.replace(/[^\0-9\/]/gi, '')
      this.$emit('update:freeWords', parseInt(e.target.value))
    },
    onPriceInput(e) {
      e.target.value = e.target.value.replace(/[^\0-9\.\/]/gi, '')
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
        display: block;
        width: 100%;

        > input {
          display: block;
          width: 100%;
          line-height: $height;
          height: $height;
          border: 1px solid $border-color-base;
          border-radius: 4px;
          padding: 0 16px;
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
