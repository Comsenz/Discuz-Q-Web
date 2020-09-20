<template>
  <div
    v-if="forums && forums.users"
    class="info"
  >
    <!-- 有偿加入 -->
    <h2 class="info-title">{{ $t('manage.payJoin') }}</h2>
    <!-- 付费信息部分 -->
    <div class="payinfo">
      <p class="payinfo-title">{{ $t('manage.payInfoTitle') }}</p>
      <p>
        <span class="color">{{ $t('post.paymentAmount') }}</span><span class="paymoney">{{ '¥' + ` ${site_price} ` }}元</span>
      </p>
      <p>
        <span class="date color">{{ $t('site.periodvalidity') }}</span><span class="workdate">自加入起 {{ forums.set_site && forums.set_site.site_expire
          ? (forums.set_site && forums.set_site.site_expire ) + ` ${$t('site.day')}`
          : $t('site.permanent') }}</span>
      </p>
    </div>
    <!-- 站点内容部分-->
    <div class="content-info abs">
      <p>
        <span class="color">{{ $t('site.creationtime') }}</span>
        <span class="workdate">{{ forums.set_site && time2YearMonthDay(forums.set_site.site_install) }}</span>
      </p>
      <p>
        <span class="date color">{{ $t('site.circlemaster') }}</span>
        <span class="img">
          <Avatar
            :user="{
              username: forums.set_site && forums.set_site.site_author.username,
              avatarUrl: forums.set_site && forums.set_site.site_author.avatar,
            }"
            :size="30"
            :round="true"
            class="avatar"
          />
        </span><span class="workdate3">{{ forums.set_site && forums.set_site.site_author.username }}</span>
      </p>
      <p>
        <span class="date color">{{ $t('home.theme') }}</span>
        <span class="workdate bold">{{ forums.other && forums.other.count_users }}</span>
      </p>
      <p class="member-img">
        <span
          v-for="(item, index) in forums.users"
          :key="index"
          class="img"
        >
          <Avatar
            :user="item"
            :size="30"
            :round="true"
            class="avatar"
          />
        </span>
      </p>
      <p>
        <span class="date color ">{{ $t('manage.contents') }}</span>
        <span class="workdate bold">{{ forums.other && forums.other.count_threads }}</span>
      </p>
      <p>
        <span class="date color rel">{{ $t('manage.siteintroduction') }}</span>
        <span class="workdate2">{{ forums.set_site && forums.set_site.site_introduction }}</span>
      </p>
    </div>
    <p
      v-if="isLogin"
      class="joinnow"
    >
      <span>{{ $t('site.justonelaststepjoinnow') }}</span>
      <span class="bold">
        {{ forums.set_site && forums.set_site.site_name }}
      </span>
      <span>{{ $t('site.site') }}</span>
      <el-button
        type="primary"
        :class="isLogin ? 'r-button islogin' :'r-button'"
        @click="paysureShow"
      >{{ $t('site.paynow') }}，¥{{ ` ${site_price} ` || 0 }}
        {{
          forums.set_site && forums.set_site.site_expire
            ? `  / ${$t('site.periodvalidity')}${forums.set_site &&
              forums.set_site.site_expire}${$t('site.day')}`
            : ` / ${$t('site.permanent')}`
        }}</el-button>
    </p>
    <div v-if="!isLogin">
      <el-button
        type="primary"
        class="r-button"
        @click="tologin"
      >{{ $t('site.joinnow') }}</el-button>

    </div>
    <!-- <div
      v-if="qrcodeShow"
      class="qrco-overlay"
    /> -->
    <topic-wx-pay
      v-if="qrcodeShow"
      :qr-code="codeUrl"
      @close="qrcodeShow = false"
    />
    <!-- <el-dialog
      :visible.sync="qrcodeShow"
      width="320px"
      class="model"
      :show-close="false"
    >
      <img :src="codeUrl">
    </el-dialog> -->

  </div>
</template>

<script>
import handleError from '@/mixin/handleError'
// import { time2YearMonthDay } from '@/utils/time'

let payWechat = null
export default {
  mixins: [handleError],

  data() {
    return {
      isLogin: this.$store.getters['session/get']('isLogin'),
      qrcodeShow: false,
      payStatus: 0, // 订单支付状态
      orderSn: '', // 订单编号
      codeUrl: '', // 二维码支付url，base64
      userId: this.$store.getters['session/get']('userId'),
      site_price: 0
    }
  },
  computed: {
    forums() {
      return this.$store.state.site.info.attributes || {}
    }
  },
  mounted() {
    // console.log(time2YearMonthDay(this.forums.set_site.site_install))
    this.userinfo()
    this.site_price = this.forums && this.forums.set_site && this.forums.set_site.site_price ? (1 * this.forums.set_site.site_price).toFixed(2) : 0
  },
  methods: {
    time2YearMonthDay(date) {
      const d = new Date(date)
      const year = d.getFullYear() + '年'
      console.log(typeof d.getMonth(), d.getMonth())
      const month = d.getMonth() < 10 ? `${0}${d.getMonth() + 1}月` : d.getMonth() + 1 + '月'
      const dated = d.getDate() < 10 ? 0`${0}${d.getDate()}日` : d.getDate() + '日'
      return [year, month, dated].join('')
    },
    userinfo() {
      const params = {
        include: 'groups,wechat'
      }
      this.$store.dispatch('jv/get', [`users/${this.userId}`, { params }]).then(res => {
        if (res.paid) {
          console.log('是否已付费', res)
          this.$router.push('/')
        }
      })
    },
    tologin() {
      this.$router.push('/user/login')
    },
    // 支付方式选择完成点击确定时
    paysureShow() {
      console.log('站点信息', this.forums)
      this.creatOrder(this.forums.set_site.site_price, 1, this.value)
    },
    // 创建订单
    creatOrder(amount, type, value) {
      const params = {
        _jv: {
          type: 'orders'
        },
        type,
        amount
      }
      this.$store.dispatch('jv/post', params).then(res => {
        console.log('---order info ---', res)
        this.orderSn = res.order_sn
        this.orderPay(10, value, this.orderSn, '3') // pc浏览器
      }, e => this.handleError(e))
    },
    // 订单支付
    orderPay(type, value, orderSn, browserType) {
      let params = {}
      params = {
        _jv: {
          type: `trade/pay/order/${orderSn}`
        },
        payment_type: type
      }
      this.$store.dispatch('jv/post', params).then(res => {
        this.wxRes = res
        if (browserType === '3') {
          if (res) {
            this.codeUrl = res.wechat_qrcode
            this.payShowStatus = false
            this.qrcodeShow = true
            payWechat = setInterval(() => {
              if (this.payStatus === 1) {
                clearInterval(payWechat)
                return
              }
              this.getOrderStatus(this.orderSn, browserType)
            }, 3000)
          }
        }
      }, e => this.handleError(e))
    },
    // 查询订单支状 browserType: 0是小程序，1是微信浏览器，2是h5，3是pc
    getOrderStatus(orderSn, browserType) {
      this.$store
        .dispatch('jv/get', [`orders/${orderSn}`, {
          custom: { loading: false }
        }])
        .then(res => {
          this.payStatus = res.status
          if (this.payStatus === 1) {
            this.payShowStatus = false
            this.coverLoading = false
            if (browserType === '3') {
              // 这是pc扫码支付完成
              this.qrcodeShow = false
            }
            window.location.href = '/'
            this.$message.success(this.$t('pay.paySuccess'))
          }
        })
        .catch(() => {
          this.coverLoading = false
          this.$message.success(this.$t('pay.payFail'))
        })
    }
  }
}
</script>
<style lang='scss' scoped>
.qrco-overlay {
  background: transparent;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  position: fixed;
  margin: auto;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 1;
}
::v-deep .model {
  .el-dialog__body {
    padding: 0;
  }
  img {
    width: 100%;
  }
}
[v-cloak] {
  display: none;
}
.bold {
  font-weight: bold;
}
.abs {
  position: relative;
}
.rel {
  position: absolute;
}
.color {
  color: #909399;
  margin-right: 15px;
}
.info {
  display: flex;
  width: 400px;
  margin-top: 62px;
  flex-direction: column;
  .joinnow {
    margin-top: 40px;
  }
  .info-title {
    width: 130px;
    height: 35px;
    font-size: 26px;
  }
  .payinfo {
    border-bottom: 1px solid #efefef;
    margin-top: 34px;
    color: #000000;
    padding-bottom: 30px;
    .payinfo-title {
      font-size: 18px;
      font-family: Microsoft YaHei;
      font-weight: 400;
    }
  }
  .date {
    width: 56px;
    text-align: right;
    vertical-align: text-bottom;
  }
  span {
    display: inline-block;
  }
  p {
    margin-top: 15px;
  }
  .paymoney {
    text-align: center;
    // width: 90px;
    font-weight: bold;
    font-size: 16px;
  }
  .workdate {
    // width: 130px;
    text-align: center;
    font-size: 16px;
    font-family: Microsoft YaHei;
  }
  .workdate3 {
    text-align: center;
    font-size: 16px;
    font-family: Microsoft YaHei;
    line-height: 30px;
  }
  .workdate2 {
    // position: absolute;
    width: 326px;
    word-break: break-all;
    // font-family: Microsoft YaHei;
    color: #6d6d6d;
    font-size: 14px;
    margin-left: 75px;
  }
  .content-info {
    margin-top: 16px;
    // min-height: 330px;
    .img {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      // background: red;
      vertical-align: bottom;
      margin-right: 5px;
      // border:1px soild #efefef;
      img {
        border-radius: 50%;
        width: 30px;
        // height: 30px;
      }
    }
    .member-img {
      margin-left: 76px;
    }
  }
  .r-button {
    width: 300px;
    // margin-left: 70px;
    margin-top: 20px;
    margin-bottom: 60px;
    background: #1878f3;
  }
  .islogin {
    margin-top: 10px;
  }
}
</style>
