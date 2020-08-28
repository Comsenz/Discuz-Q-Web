<template>
  <div class="info">
    <!-- 有偿加入 -->
    <h2 class="info-title">{{ $t('manage.payJoin') }}</h2>
    <!-- 付费信息部分 -->
    <div class="payinfo">
      <p class="payinfo-title">{{ $t('manage.payInfoTitle') }}</p>
      <p>
        <span class="color">{{ $t('post.paymentAmount') }}</span><span class="paymoney">{{ '¥' + ((forums.set_site && forums.set_site.site_price) || 0) }}元</span>
      </p>
      <p>
        <span class="date color">{{ $t('site.periodvalidity') }}</span><span class="workdate">{{ forums.set_site && forums.set_site.site_expire
          ? (forums.set_site && forums.set_site.site_expire) + $t('site.day')
          : $t('site.permanent') }}</span>
      </p>
    </div>
    <!-- 站点内容部分-->
    <div class="content-info abs">
      <p>
        <span class="color">{{ $t('site.creationtime') }}</span>
        <span class="workdate">{{ forums.set_site && forums.set_site.site_install }}</span>
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
        </span><span class="workdate">{{ forums.set_site && forums.set_site.site_author.username }}</span>
      </p>
      <p>
        <span class="date color">{{ $t('home.theme') }}</span>
        <span class="workdate bold">{{ forums.other && forums.other.count_users }}</span>
      </p>
      <p class="member-img">
        <span
          v-for="(item, index) in userList"
          :key="index"
          class="img"
        >
          <Avatar
            :user="{
              username: forums.set_site && forums.set_site.site_author.username,
              avatarUrl: forums.set_site && forums.set_site.site_author.avatar,
            }"
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
      v-cloak
    >
      <span>{{ $t('site.justonelaststepjoinnow') }}</span>
      <span class="bold">
        {{ forums.set_site && forums.set_site.site_name }}
      </span>
      <span>{{ $t('site.site') }}</span>
      <el-button
        type="primary"
        class="r-button"
        @click="paysureShow"
      >{{ $t('site.paynow') }}，¥{{ (forums.set_site && forums.set_site.site_price) || 0 }}
        {{
          forums.set_site && forums.set_site.site_expire
            ? `  / ${$t('site.periodvalidity')}${forums.set_site &&
              forums.set_site.site_expire}${$t('site.day')}`
            : ` / ${$t('site.permanent')}`
        }}</el-button>
    </p>
    <p
      v-if="!isLogin"
      v-cloak
    >
      <nuxt-link to="/user/login">
        <el-button
          type="primary"
          class="r-button"
        >{{ $t('site.join') }}{{ $t('site.site') }}</el-button>
      </nuxt-link>

    </p>
    <div
      v-if="qrcodeShow"
      class="qrco-overlay"
    />
    <el-dialog
      :title="`扫码支付${(forums.set_site &&forums.set_site.site_price) ? forums.set_site.site_price : 1}元加入${forums.set_site && forums.set_site.site_name}`"
      :visible.sync="qrcodeShow"
      width="15%"
      class="model"
      :show-close="false"
    >

      <img
        :src="codeUrl"
        alt=""
      >

    </el-dialog>

  </div>
</template>

<script>
import forums from '@/mixin/forums'
let payWechat = null
export default {
  mixins: [
    forums
  ],
  data() {
    return {
      isLogin: '',
      pageSize: 20,
      pageNum: 1,
      userList: [],
      searchText: '',
      isAnonymous: '0',
      qrcodeShow: false,
      payStatus: false, // 订单支付状态
      orderSn: '', // 订单编号
      codeUrl: '' // 二维码支付url，base64

    }
  },
  mounted() {
    this.isLoginh()
    this.searchUser()
  },
  methods: {
    isLoginh() {
      this.isLogin = !!window.localStorage.getItem('access_token')
      console.log(this.isLogin)
      var a = 1001
      var b = 1000
      console.log(a > b ? `${a % 1000}k` : '原来的价格')
    },
    async searchUser() {
      const params = {
        include: 'groups',
        'page[number]': this.pageNum,
        'page[limit]': this.pageSize,
        'filter[username]': `*${this.searchText}*`
      }
      if (this.searchText === '') {
        await this.$store.dispatch('jv/get', ['users', { params }]).then(res => {
          console.log('获取20个用户信息：', res)
          if (res && res._jv) {
            this.userList = [...this.userList, ...res]
          }
        })
      }
    },
    // 支付方式选择完成点击确定时
    paysureShow() {
      console.log(this.forums)
      this.creatOrder(this.forums.set_site.site_price, 1, this.value)
    },
    // 创建订单
    creatOrder(amount, type, value) {
      const params = {
        _jv: {
          type: 'orders'
        },
        type,
        amount,
        is_anonymous: this.isAnonymous
      }
      this.$store.dispatch('jv/post', params).then(res => {
        console.log('---order info ---', res)
        this.orderSn = res.order_sn
        this.orderPay(10, value, this.orderSn, '3') // pc浏览器
      })
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
            // this.$refs.codePopup.open()
            this.qrcodeShow = true
            payWechat = setInterval(() => {
              if (this.payStatus === 1) {
                clearInterval(payWechat)
                return
              }
              this.getOrderStatus(this.orderSn, browserType)
              // uni.hideLoading()
            }, 3000)
          }
        }
      })
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
              // this.$refs.codePopup.close()
              this.qrcodeShow = false
            }
            window.location.href = '/'
            // this.$refs.toast.show({ message: this.p.paySuccess })
          }
        })
        .catch(() => {
          this.coverLoading = false
          // this.$refs.toast.show({ message: this.pay.payFail })
        })
    }
  }
  // 用于全局判断站点是否是付费
  // async onLaunch() {
  //   const init = async () => {
  //     const forums = await this.$store.dispatch('jv/get', [
  //       'forum',
  //       {
  //         params: {
  //           include: 'users'
  //         }
  //       }
  //     ])
  //     const userId = this.$store.getters['session/get']('userId')
  //     let user = {}
  //     if (userId) {
  //       const params = {
  //         include: 'groups,wechat'
  //       }
  //       user = await this.$store.dispatch('jv/get', [`users/${userId}`, { params }])
  //       uni.setStorageSync(STORGE_GET_USER_TIME, new Date().getTime())
  //     }
  //     this.statisticsCode = forums.set_site.site_stat
  //     uni.$emit('stat', {
  //       statisticsCode: this.statisticsCode
  //     })
  //     let currentPage = {}
  //     const pages = getCurrentPages()
  //     if (pages.length > 0) {
  //       currentPage = pages[pages.length - 1]
  //     }
  //     if (forums.set_site.site_mode === SITE_PAY && currentPage.route !== 'pages/site/partner-invite') {
  //       // #ifndef H5
  //       const res = uni.getSystemInfoSync()
  //       if (res.platform === 'ios') {
  //         this.$store.dispatch('forum/setError', { loading: false, code: 'dataerro' })
  //         return
  //       }
  //       // #endif
  //       if (pages.length > 0) {
  //         currentPage = pages[pages.length - 1]
  //         if (!user.paid && currentPage.route !== 'pages/site/info') {
  //           uni.redirectTo({
  //             url: '/pages/site/info'
  //           })
  //         }
  //       } else if (!user.paid) {
  //         uni.redirectTo({
  //           url: '/pages/site/info'
  //         })
  //       }
  //     }
  //     // #ifdef H5
  //     this.globalData.appLoadedStatus = true
  //     uni.$emit('apploaded')
  //     // #endif
  //     if (!this.$store.state.forum.error.code) {
  //       this.$store.dispatch('forum/setError', { loading: false })
  //     }
  //   }
  //   try {
  //     await init()
  //   } catch (errs) {
  //     if (errs && errs.data && errs.data.errors) {
  //       if (errs.data.errors[0].code === 'access_denied') {
  //         this.$store.dispatch('session/logout').then(init)
  //       } else {
  //         this.$store.dispatch('forum/setError', {
  //           loading: false,
  //           ...errs.data.errors[0]
  //         })
  //       }
  //     }
  //   }
  // }
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
  .workdate2 {
    // position: absolute;
    width: 326px;
    word-break: break-all;
    font-family: Microsoft YaHei;
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
}
</style>
