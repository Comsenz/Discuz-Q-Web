<template>
  <message-box :title="$t('pay.checkoutCounter')" @close="$emit('close')">
    <div class="top">
      <div class="row">
        <div class="head">{{ $t('pay.payProduct') }}</div>
        <div class="body product-information">
          <span
            v-if="rewardOrPay === 'reward'"
            class="title"
          > {{ $t('pay.supportAuthor') + $t('pay.keepWriting') }}</span>
          <span
            v-else
            class="title"
          > {{ $t('pay.supportAuthor') + $t(`pay.${text[threadType]}`) + $t('pay.getRight') }}</span>
          <span>{{ $t('topic.author') + ': ' + (user.username || '') }}</span>
          <span>{{ $t('topic.content') + ': ' + content }}</span>
        </div>
        <div v-if="rewardOrPay === 'pay'" class="amount">￥{{ showAmount }}</div>
      </div>
      <div v-if="rewardOrPay === 'reward'" class="row">
        <div class="head reward">{{ $t('topic.reward') + $t('pay.sumOfMoney') }}</div>
        <div class="body reward">
          <label>
            <span>￥</span>
            <input v-model="rewardAmount" :placeholder="$t('pay.inputRewardAmount')" type="text">
          </label>
          <div class="default-amounts">
            <button
              v-for="(item, index) in defaultAmounts"
              :key="index"
              :class="{selected: item === rewardAmount}"
              @click="rewardAmount = item"
            >￥{{ item }}
            </button>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="head">{{ $t('pay.hideAvatar') }}</div>
        <div class="body hide-avatar" @click="hideAvatar = !hideAvatar">
          <svg-icon v-if="hideAvatar" style="font-size: 18px" type="checked" />
          <svg-icon v-else style="font-size: 18px;" type="unchecked" />
          <span>{{ $t('pay.hideMyAvatar') }}</span>
        </div>
      </div>
      <div class="row">
        <div class="head">{{ $t('pay.payType') }}</div>
        <div class="body pay-way">
          <div class="pay-card" :class="{'pay-card': true, 'selected': payWay === 'wxPay'}" @click="payWay = 'wxPay'">
            <div class="detail">
              <div class="pay-title">
                <svg-icon class="active-svg-wx" style="fill: #8590A6;font-size: 18px" type="wechat" />
                <span>{{ $t('pay.wxPay') }}</span>
                <div class="pay-tip">
                  <div>
                    <span>{{ $t('pay.wxPayTipUse') }}</span>
                    <span class="active-tip" style="font-weight: bold">{{ $t('pay.wxPayTipScan') }}</span>
                  </div>
                  <span>{{ $t('pay.wxPayTipPay') }}</span>
                </div>
              </div>
              <div class="pay-amount">￥{{ showAmount }}</div>
            </div>
          </div>
        </div>
        <div class="body pay-way">
          <div
            class="pay-card"
            :class="{'pay-card': true, 'selected': payWay === 'walletPay'}"
            @click="payWay = 'walletPay'"
          >
            <div class="detail">
              <div class="pay-title">
                <svg-icon class="active-svg-wallet" style="fill: #8590a6;font-size: 18px" type="wallet" />
                <span>{{ $t('pay.walletPay') }}</span>
                <div class="pay-tip">
                  <span v-if="enoughBalance">{{ $t('pay.walletBalance') }}</span>
                  <!--TODO 去改密码-->
                  <a v-else href="/" style="color: red">{{ $t('pay.walletBalanceNo') }}</a>
                  <span v-if="!userWallet.canWalletPay">{{ $t('pay.needToResetPassword') }}</span>
                  <span v-else>￥ {{ userWallet.availableAmount }}</span>
                </div>
              </div>
              <div class="pay-amount">￥{{ showAmount }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="bottom">
      <span>￥ {{ showAmount + $t('pay.rmb') + $t('pay.payTo') + '，' + user.username || '' }} {{ $t('pay.ofAccount') }}</span>
      <el-button v-if="payWay === 'wxPay'" size="medium" type="primary" @click="$emit('paying', { payWay, hideAvatar })">{{ $t('pay.scanPay') }}</el-button>
      <el-button v-if="payWay === 'walletPay'" :disabled="!enoughBalance" size="medium" type="primary" @click="$emit('paying', { payWay, hideAvatar, rewardAmount })">{{ $t('pay.surePay') }}</el-button>
    </div>
  </message-box>
</template>

<script>
export default {
  name: 'TopicCheckoutCounter',
  props: {
    threadType: {
      type: Number,
      default: 0
    },
    user: {
      type: Object,
      default: () => {
      }
    },
    amount: {
      type: [String, Number],
      default: ''
    },
    content: {
      type: String,
      default: ''
    },
    rewardOrPay: {
      type: String,
      default: ''
    },
    userWallet: {
      type: Object,
      default: () => {
      }
    }
  },
  data() {
    return {
      hideAvatar: false,
      text: ['getRemainingContent', 'getRemainingContent', 'getVideo', 'getPicture'],
      payWay: 'wxPay',
      rewardAmount: '',
      defaultAmounts: ['1', '2', '5', '10', '20', '50', '88', '128']
    }
  },
  computed: {
    showAmount() {
      return this.rewardOrPay === 'reward' ? this.rewardAmount : this.amount
    },
    enoughBalance() {
      if (this.rewardOrPay === 'reward') {
        return parseFloat(this.rewardAmount || '0') < parseFloat(this.userWallet.availableAmount)
      } else {
        return parseFloat(this.amount) < parseFloat(this.userWallet.availableAmount)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  $fontColor: #8590A6;
  .top {
    padding: 20px;
    > .row {
      margin-top: 20px;
      padding: 0 0 20px 20px;
      display: flex;
      border-bottom: 1px solid #E4E4E4;

      &:last-child {
        border-bottom: none;
      }

      > .head {
        margin-left: 10px;
        width: 65px;
        color: #000000;

        &.reward {
          line-height: 50px;
        }
      }

      > .body {
        margin-left: 15px;
        flex: 1;

        &.product-information {
          span {
            display: block;
            line-height: 22.5px;
            color: $fontColor;

            &.title {
              color: #1878F3;
            }
          }
        }

        &.reward {
          > label {
            width: 430px;
            height: 50px;
            border: 1px solid #EDEDED;
            display: flex;

            > span {
              text-align: center;
              line-height: 50px;
              font-size: 16px;
              display: block;
              width: 40px;
            }

            > input {
              flex: 1;
              border: none;
              color: #C0C4CC;
            }
          }

          > .default-amounts {
            width: 660px;
            display: flex;
            flex-wrap: wrap;

            > button {
              font-size: 16px;
              margin-top: 10px;
              margin-right: 10px;
              width: 100px;
              height: 50px;
              border: 1px solid #EDEDED;
              text-align: center;
              line-height: 50px;

              &.selected {
                border: 1px solid #1878F3;
              }
            }
          }
        }

        &.hide-avatar {
          span {
            margin-left: 10px;
          }
        }

        &.pay-way {
          > .pay-card {
            display: flex;
            align-items: center;
            height: 120px;
            width: 320px;
            padding: 10px;
            border: 1px solid #EDEDED;
            border-radius: 3px;

            &.selected {
              border: 1px solid #1878F3;

              .active-tip {
                color: #09BB07;
              }

              .active-svg-wx {
                fill: #09BB07 !important;
              }

              .active-svg-wallet {
                fill: #1878F3 !important;
              }
            }

            > .qr-code {
              width: 100px;
              height: 100px;
            }

            > .detail {
              width: 100%;
              height: 100%;
              margin-left: 10px;
              font-size: 16px;
              display: flex;

              > .pay-title {
                flex: 1;

                > span {
                  margin-left: 10px;
                }

                > .pay-tip {
                  margin-top: 10px;
                  color: $fontColor;

                  > span, a {
                    line-height: 22px;
                    display: block;
                  }
                }
              }

              > .pay-amount {
                width: 140px;
                overflow: auto;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 30px;
              }
            }
          }

        }
      }

      > .amount {
        color: $fontColor;
      }
    }
  }

  .bottom {
    height: 55px;
    display: inline-flex;
    justify-content: flex-end;
    align-items: center;
    padding: 0 20px;
    background: #F5F6F7;
    margin-top: 30px;

    > span {
      margin-right: 20px;
    }
  }

</style>
