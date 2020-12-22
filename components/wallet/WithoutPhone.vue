<template>
  <message
    :title="`${$t('modify.forgetPassword') +'/'+ $t('modify.retrievePassword')} `"
    @close="$emit('close')"
  >
    <div class="container">
      <div class="block show-amount">
        <div class="title">{{ $t('modify.nohasphon') }}</div>
        <div class="amount">
          <span>{{ $t('modify.forgetPassword') +'/'+ $t('modify.retrievePassword') + ','+ '需要您先绑定常用手机号码' }}</span>
        </div>
        <el-button type="primary" class="btn" @click="tobind">前去绑定</el-button>
      </div>
    </div>
  </message>
</template>

<script>
export default {
  name: 'WalletPassword',
  data() {
    return {
    };
  },
  methods: {
    tobind() {
      this.$router.push('/my/profile?phonebind=true');
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/variable/color.scss";
.container {
  height: 315px;
  .btn{
    width:300px;
    margin-top: 60px;
    &:hover {
      border: 1px solid $color-blue-deep;
      background: $color-blue-deep;
    }
  }
  > .block {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 40px;
    &.show-amount {
      > .title {
        font-size: 30px;
      }
      > .amount {
        height: 52px;
        line-height: 52px;
        position: relative;
        font-size: 14px;
        color: #777777;
        > .icon {
          line-height: 20px;
          position: absolute;
          top: 10px;
          left: -20px;
          font-size: 20px;
        }
      }
    }
  }
  .findpaypwd{
    font-size:12px;
    color:#8590a6;
    position: absolute;
    right: 22px;
    bottom: 21px;
    cursor: pointer;
  }
}
</style>
