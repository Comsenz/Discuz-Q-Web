<template>
  <div class="mywallet">
    <div class="mywallet-top">
      <div class="mywallet-topitem">
        <span class="margbtm">{{ $t('profile.availableamount') }}</span>
        <span class="amount">{{ `¥ ${dataInfo.available_amount || 0.0}` }}<span class="availmount">{{ $t('modify.withdratitle') }}</span></span>
      </div>
      <div class="mywallet-topitem">
        <span class="margbtm">{{ $t('profile.freezeamount') }}</span>
        <span
          class="amount"
          style="color:#FA5151;"
        >{{ `¥ ${dataInfo.freeze_amount || 0.0}` }}<span>112</span></span>
      </div>
      <div
        class="mywallet-topitem"
        style="margin-right:30px;text-align:right"
      >
        <span class="margbtm">{{ $t('pay.payPassword') }}</span>
        <span v-if="hasPassword">
          <svg-icon
            style="width:16px; height:16px;margin-right:5px;"
            type="warning"
          />{{ $t('profile.walletpassword') }} </span>
        <span v-else>
          <svg-icon
            style="width:16px; height:16px;margin-right:5px;"
            type="warning"
          />{{ $t('profile.setpaypassword') }} </span>
      </div>
    </div>
  </div>

</template>

<script>
import { status } from '@/library/jsonapi-vuex/index'

export default {
  data() {
    return {
      dataInfo: {},
      hasPassword: false,
      userId: this.$store.getters['session/get']('userId') // 获取当前登陆用户的ID
    }
  },
  mounted() {
    this.getInfo()
  },
  methods: {
    // 获取钱包信息
    getInfo() {
      status
        .run(() => this.$store.dispatch('jv/get', `wallet/user/${this.userId}`))
        .then(res => {
          this.dataInfo = res
          this.hasPassword = res.user.canWalletPay
        })
    }
  }

}
</script>
<style lang='scss' scoped>
.mywallet-top {
  display: flex;
  flex-direction: row;
  .mywallet-topitem {
    display: flex;
    flex-direction: column;
    flex: 1;
    color: #6d6d6d;
    .amount {
      font-size: 20px;
    }
    .availmount {
      font-size: 14px;
      color: #1878f3;
      line-height: 23px;
      vertical-align: top;
      margin-left: 10px;
    }
    .margbtm {
      margin-bottom: 10px;
    }
  }
}
</style>
