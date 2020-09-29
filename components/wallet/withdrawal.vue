<template>
  <message
    :title="$t('profile.towithdrawal')"
    @close="$emit('close')"
  >
    <div class="top">
      <div class="row">
        <div class="head">{{ $t('modify.payee') }}</div>
        <div class="body product-information">
          <span class="title"> {{ name }}</span>
        </div>
      </div>
      <div class="row">
        <div class="head">{{ $t('modify.withdrawable') }}</div>
        <div class="body product-information">
          <span class="title2"> ￥ {{ balance }}</span>
        </div>
      </div>
      <div class="row">
        <div class="head reward">{{ $t('modify.withdratitle') + $t('pay.sumOfMoney') }}</div>
        <div class="body reward">
          <label>
            <span>￥</span>
            <input
              v-model="canAmount"
              :placeholder="$t('modify.enteramount')"
              type="text"
              class="rinput"
              @input="settlement"
            >
          </label>
        </div>
      </div>
      <div class="row">
        <div class="head">{{ $t('modify.actualamout') }}</div>
        <div class="body product-information">
          <span class="title3"> ￥ {{ contint || 0 }}</span>
          <span class="title4"> {{ $t('modify.servicechaege') }}{{ procedures }}{{ $t('modify.percentage') }} {{ percentage }}%)</span>
        </div>
      </div>
      <div class="row">
        <div class="head reward">{{ $t('user.verificationCode2') }}</div>
        <div class="body reward">
          <!-- 发送验证码 -->
          <label>
            <span />
            <input
              v-model="verifycode"
              :placeholder="$t('modify.placeEnterCode')"
              type="text"
            >
            <el-button
              size="medium"
              :disabled="!canClick"
              @click="sendsms"
            >{{ content }}</el-button>

          </label>
          <span
            v-if="usertestphon"
            class="phone"
            style="margin-left:20px;"
          >
            {{ $t('profile.codesend') }}  <span style="font-weight:bold;color:#000000; ">{{ usertestphon }}</span> {{ $t('profile.phonesms') }}
          </span>
          <span
            v-else
            class="phone"
          >
            {{ $t('profile.withoutbind') }} <span
              style="font-weight:bold;color:#1878F3;cursor:pointer;"
              @click="tomy"
            > {{ $t('profile.personalhomepage') }} </span>
            {{ $t('profile.tobindphone') }}</span>
        </div>
      </div>
    </div>
    <div class="bottom">
      <span style="font-size:14px">￥{{ contint || 0 }}{{ $t('pay.rmb') + $t('profile.withdrawalto') + '，' + name || '' }} {{ $t('pay.ofAccount') }}</span>
      <el-button
        size="medium"
        type="primary"
        class="border"
        @click="btncash"
      >{{ $t('profile.comfirmwithdrawal' ) }}</el-button>
    </div>
  </message>
</template>

<script>
import { status } from '@/library/jsonapi-vuex/index'
import handleError from '@/mixin/handleError'
const tcaptchs = process.client ? require('@/utils/tcaptcha') : ''

export default {

  name: 'WalletPassword',
  mixins: [handleError, tcaptchs],
  props: {
    price: {
      type: [Number, String],
      default: ''
    },
    error: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      userId: this.$store.getters['session/get']('userId'), // 获取当前登陆用户的ID
      userInfo: '',
      name: '',
      balance: '',
      userphon: '',
      usertestphon: '',
      canAmount: '',
      canClick: true,
      disabtype: false,
      verifycode: '',
      content: this.$t('modify.sendVerifyCode'),
      percentage: 0,
      contint: '', // 实际金额
      procedures: 0,
      cost: 0,
      interval: '',
      captcha: null, // 腾讯云验证码实例
      ticket: '', // 腾讯云验证码返回票据
      randstr: '', // 腾讯云验证码返回随机字符串
      captchaResult: {},
      forums: ''
    }
  },
  mounted() {
    this.setmydata()
    this.forumsdata()
  },
  methods: {
    countDown(interval) {
      if (!this.canClick) return
      this.canClick = false
      this.content = interval + this.$t('modify.retransmission')
      const clock = window.setInterval(() => {
        interval--
        this.content = interval + this.$t('modify.retransmission')
        if (interval < 0) {
          window.clearInterval(clock)
          this.content = this.$t('modify.sendVerifyCode')
          // this.totalTime = 60
          this.canClick = true
        }
      }, 1000)
    },
    setmydata() {
      this.userInfo = this.$store.state.user.info
      console.log('hhhh', this.userInfo)
      this.name = this.userInfo.attributes.username
      this.balance = this.userInfo.attributes.walletBalance
      this.usertestphon = this.userInfo.attributes.mobile
      this.userphon = this.userInfo.attributes.originalMobile
      if (!this.usertestphon) {
        this.disabtype = true
      }
    },
    forumsdata() {
      this.forums = this.$store.state.site.info.attributes
      console.log('站点信息', this.forums)
      this.cost = this.forums.set_cash.cash_rate
      this.percentage = this.forums.set_cash.cash_rate * 100
    },
    settlement() {
      setTimeout(() => {
        if (this.canAmount[0] === '.') {
          const num = 0
          const cun = '.'
          this.canAmount = num + cun
        }
        this.canAmount = this.canAmount
          .replace(/[^\d.]/g, '')
          .replace(/\.{2,}/g, '.')
          .replace('.', '$#$')
          .replace(/\./g, '')
          .replace('$#$', '.')
          .replace(/^(-)*(\d+)\.(\d\d).*$/, '$1$2.$3')
          .replace(/^\./g, '')
        if (Number(this.canAmount) > Number(this.balance)) {
          this.canAmount = this.canAmount.slice(0, this.canAmount.length - 1)
          this.$message.warning(this.$t('modify.greaterthan'))
        }
        if (this.canAmount.length > 0) {
          this.length = true
          const number = this.canAmount - this.canAmount * this.cost
          if (number) {
            this.contint = `${number.toFixed(2)}`
            const casnumber = this.canAmount * this.cost
            this.procedures = casnumber.toFixed(2)
          } else {
            this.contint = ''
            this.procedures = ''
          }
        } else if (this.canAmount.length <= 0) {
          // this.length = false;
          this.contint = ''
          const casnumber = this.canAmount * this.cost
          this.procedures = casnumber.toFixed(2)
        }
      }, 5)
    },
    // 发送验证码
    sendsms() {
      if (this.forums.qcloud.qcloud_captcha) {
        console.log('腾讯云验证已经开启')
        this.tcaptcha()
      } else {
        console.log('腾讯云验证未开启')
        this.second = 60
        this.sendVerifyCode()
      }
    },
    // 腾讯验证码
    tcaptcha() {
      // eslint-disable-next-line no-undef
      this.captcha = new TencentCaptcha(this.forums.qcloud.qcloud_captcha_app_id, res => {
        if (res.ret === 0) {
          this.ticket = res.ticket
          this.randstr = res.randstr
          // 验证通过后发布
          console.log('验证码发送')
          // 修改手机验证码发送
          this.sendVerifyCode()
        }
      })
      // 显示验证码
      this.captcha.show()
    },
    sendVerifyCode() {
      const params = {
        _jv: {
          type: 'sms/send'
        },
        mobile: this.userphon,
        type: 'verify',
        captcha_ticket: this.ticket,
        captcha_rand_str: this.randstr
      }
      const postphon = status.run(() => this.$store.dispatch('jv/post', params))
      postphon
        .then(res => {
          if (res.interval) this.countDown(res.interval)
          this.ticket = ''
          this.randstr = ''
        }, e => this.handleError(e))
    },
    btncash() {
      this.verifytitle()
    },
    // 验证短信
    verifytitle() {
      const params = {
        _jv: {
          type: 'sms/verify'
        },
        code: this.verifycode,
        type: 'verify'
      }
      this.$store
        .dispatch('jv/post', params)
        .then(res => {
          if (res) {
            this.cashwithdrawal()
          }
        }, e => {
          // eslint-disable-next-line object-curly-spacing
          const { response: { data: { errors } } } = e
          console.log(errors[0])
          if (errors[0]) {
            if (errors[0].status === '422') {
              console.log(errors[0].detail, errors[0])
              this.$message.error(errors[0].detail[0])
            } else if (errors[0].status === 500) {
              this.$message.error(this.$t(`core.${errors[0].code}`))
            }
          }
        })
    },
    // 提现申请
    cashwithdrawal() {
      const params = {
        _jv: {
          type: 'wallet/cash',
          include: ['user', 'userWallet']
        },
        cash_apply_amount: this.canAmount,
        cash_mobile: this.userphon,
        cash_type: 0
      }
      const postcash = status.run(() => this.$store.dispatch('jv/post', params))
      postcash
        .then(res => {
          if (res) {
            this.canAmount = ''
            this.contint = ''
            this.procedures = 0
            // 重新更新数据
            // this.$store.dispatch('user/getUserInfo', this.userId)
            this.$message.success(this.$t('modify.withdrawal'))
            this.$emit('close')
            // this.$router.go(0)
          }
        }, e => {
          // eslint-disable-next-line object-curly-spacing
          const { response: { data: { errors } } } = e
          console.log(errors)
          if (errors[0]) {
            if (errors[0].status === '422') {
              this.$message.error(errors[0].detail[0])
              this.canAmount = ''
              this.contint = ''
              this.procedures = 0
            } else if (errors[0].status === 500) {
              if (errors[0].code === 'unbind_wechat') {
                this.$message.error(errors[0].detail)
              } else if (errors[0].code === 'cash_mch_invalid') {
                this.$message.error(errors[0].detail)
              } else {
                this.$message.error(this.$t(`core.${errors[0].code}`))
                this.canAmount = ''
                this.contint = ''
                this.procedures = 0
              }
            }
          }
        })
    },
    tomy() {
      this.$router.push('/pages/my/profile')
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/css/variable/color.scss";
.top {
  padding: 20px;
  > .row {
    margin-top: 20px;
    padding: 0 0 20px 20px;
    display: flex;
    border-bottom: 1px solid $border-color-base;

    &:last-child {
      border-bottom: none;
    }

    > .head {
      width: 101px;
      color: #000000;

      &.reward {
        line-height: 50px;
      }
    }

    > .body {
      flex: 1;
      margin-left: 15px;
      &.product-information {
        span {
          display: block;
          line-height: 22.5px;
          color: $font-color-grey;

          &.title {
            font-size: 16px;
            color: #000000;
            font-weight: bold;
          }
          &.title2 {
            font-size: 24px;
            color: #000000;
            font-weight: 400;
          }
          &.title3 {
            font-size: 24px;
            color: #1878f3;
            font-weight: 400;
          }
          &.title4 {
            font-size: 12px;
            margin-top: 10px;
          }
        }
      }

      &.reward {
        ::v-deep .el-button {
          border-radius: 0;
          border-top: none;
          border-right: none;
          border-bottom: none;
          color:#000000;
          &:active{
            border-color: #dcdfe6;
          }
          .rinput {
            font-size: 16px;
            color: #000000;
          }
        }
        .phone {
          margin-top: 10px;
          font-size: 12px;
        }
        > label {
          width: 300px;
          height: 40px;
          border: 1px solid #dcdfe6;
          display: flex;
          margin-bottom: 10px;
          border-radius: 2px;

          > span {
            text-align: center;
            line-height: 38px;
            font-size: 16px;
            display: block;
            width: 30px;
          }

          > input {
            flex: 1;
            border: none;
            color: #c0c4cc;
          }
        }

        > .default-amounts {
          max-width: 660px;
          display: flex;
          flex-wrap: wrap;

          > button {
            font-size: 16px;
            margin-top: 10px;
            margin-right: 10px;
            width: 100px;
            height: 50px;
            border: 1px solid #ededed;
            text-align: center;
            line-height: 50px;

            &.selected {
              border: 1px solid $color-blue-base;
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
          border: 1px solid #ededed;
          border-radius: 3px;

          &.selected {
            border: 1px solid $color-blue-base;

            .active-tip {
              color: #09bb07;
            }

            .active-svg-wx {
              fill: #09bb07 !important;
            }

            .active-svg-wallet {
              fill: $color-blue-base !important;
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
                color: $font-color-grey;

                > span,
                a {
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
        @media screen and (max-width: 1005px) {
          .pay-card {
            width: 298px;
            .pay-tip {
              font-size: 15px;
            }
          }
        }
      }
    }

    > .amount {
      color: $font-color-grey;
    }
  }
}

.bottom {
  height: 55px;
  display: inline-flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 20px;
  background: #f5f6f7;
  margin-top: 30px;
  .border {
    border-radius: 2px;
  }
  > span {
    margin-right: 20px;
  }
}
</style>
