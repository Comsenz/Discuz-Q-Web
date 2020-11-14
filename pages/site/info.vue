<template>
  <div v-loading="loading" class="infocontainer">
    <div v-if="forums && forums.users" class="info">
      <!-- 有偿加入 -->
      <h2 class="info-title">{{ $t('manage.payJoin') }}</h2>
      <!-- 付费信息部分 -->
      <div class="payinfo">
        <p class="payinfo-title">{{ $t('manage.payInfoTitle') }}</p>
        <p>
          <span class="color">{{ $t('post.paymentAmount') }}</span>
          <span class="paymoney">{{ '¥' + ` ${site_price} ` }}元</span></p>
        <p>
          <span class="date color">{{ $t('site.periodvalidity') }}</span>
          <span class="workdate">自加入起 {{ forums.set_site && forums.set_site.site_expire
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
          <span v-if="forums.set_site && forums.set_site.site_author" class="img">
            <Avatar
              :user="{
                username: forums.set_site && forums.set_site.site_author && forums.set_site.site_author.username || '',
                avatarUrl: forums.set_site && forums.set_site.site_author && forums.set_site.site_author.avatar || '',
              }"
              :size="30"
              :round="true"
              class="avatar"
            />
          </span>
          <span v-else>
            <avatar :user="{ id: 0, username: '无', avatarUrl: ''}" :prevent-jump="true" :size="30" :round="true" />
          </span>
          <span class="workdate3">
            {{ forums.set_site && forums.set_site.site_author && forums.set_site.site_author.username || '' }}
          </span>
        </p>
        <p>
          <span class="date color">{{ $t('home.theme') }}</span>
          <span class="workdate bold">{{ forums.other && forums.other.count_users }}</span>
        </p>
        <p class="member-img">
          <span v-for="(item, index) in forums.users" :key="index" class="img">
            <Avatar :user="item" :size="30" :round="true" class="avatar" />
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
      <p v-if="isLogin" class="joinnow">
        <span>{{ $t('site.justonelaststepjoinnow') }}</span>
        <span class="bold">
          {{ forums.set_site && forums.set_site.site_name }}
        </span>
        <span>{{ $t('site.site') }}</span>
        <el-button type="primary" :class="isLogin ? 'r-button islogin' :'r-button'" @click="paysureShow">
          {{ $t('site.paynow') }}，¥{{ ` ${site_price} ` || 0 }}
          {{
            forums.set_site && forums.set_site.site_expire
              ? `  / ${$t('site.periodvalidity')}${forums.set_site &&
                forums.set_site.site_expire}${$t('site.day')}`
              : ` / ${$t('site.permanent')}`
          }}
        </el-button>
      </p>
      <div v-if="!isLogin">
        <el-button type="primary" class="r-button" @click="tologin">{{ $t('site.joinnow') }}</el-button>
      </div>
      <topic-wx-pay v-if="qrcodeShow" :qr-code="codeUrl" @close="qrcodeShow = false" />
    </div>
    <div v-if="threadsData.length > 0" class="thread">
      <div class="threadtitle">部分内容预览</div>
      <template v-for="(item, index) in threadsData">
        <!-- 语音贴 -->
        <post-item v-if="item.type === 4" :ref="`audio${ item && item.threadAudio && item.threadAudio._jv && item.threadAudio._jv.id}`" :key="index" :item="item" :infoimage="true" :can-detail="canDetail" @audioPlay="audioPlay" />
        <post-item v-else :key="index" :item="item" :infoimage="true" :can-detail="canDetail" />
      </template>
    </div>
  </div>
</template>

<script>
import { status } from '@/library/jsonapi-vuex/index'
import handleError from '@/mixin/handleError'
import head from '@/mixin/head'
let payWechat = null
export default {
  mixins: [head, handleError],
  data() {
    return {
      title: this.$t('profile.circleinfo'),
      isLogin: this.$store.getters['session/get']('isLogin'),
      qrcodeShow: false,
      payStatus: 0, // 订单支付状态
      orderSn: '', // 订单编号
      codeUrl: '', // 二维码支付url，base64
      site_price: 0,
      threadsData: [],
      loading: true,
      canDetail: false,
      currentAudioId: '',
      preurl: '/'
    }
  },
  computed: {
    forums() {
      return this.$store.state.site.info.attributes || {}
    },
    userId() {
      return this.$store.getters['session/get']('userId')
    }
  },
  watch: {
    userId(id) {
      if (id) this.userinfo()
    },
    forums: {
      handler(val) {
        if (val.set_site && val.set_site.site_price) {
          this.site_price = (1 * val.set_site.site_price).toFixed(2)
        }
      }
    }
  },
  mounted() {
    this.preurl = this.$route.fullPath
    if (this.userId) this.userinfo()
    this.loadThreads()
    if (this.forums.set_site && this.forums.set_site.site_mode || !this.userId) {
      this.canDetail = true
    }
  },
  methods: {
    time2YearMonthDay(date) {
      const d = new Date(date)
      const year = `${d.getFullYear()}年`
      const month = d.getMonth() < 10 ? `0${d.getMonth() + 1}月` : `${d.getMonth() + 1}月`
      const dated = d.getDate() < 10 ? `0${d.getDate()}日` : `${d.getDate()}日`
      return [year, month, dated].join('')
    },
    userinfo() {
      const params = {
        include: 'groups,wechat'
      }
      this.$store.dispatch('jv/get', [`users/${this.userId}`, { params }]).then((res) => {
        if (res.paid) {
          this.$router.push('/')
        }
      })
    },
    tologin() {
      this.$router.push(`/user/login?preurl=${this.preurl}`)
    },
    // 支付方式选择完成点击确定时
    paysureShow() {
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
      this.$store.dispatch('jv/post', params).then((res) => {
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
      this.$store.dispatch('jv/post', params).then((res) => {
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
      this.$store.dispatch('jv/get', `orders/${orderSn}`).then((res) => {
        this.payStatus = res.status
        if (this.payStatus === 1) {
          this.payShowStatus = false
          if (browserType === '3') {
            // 这是pc扫码支付完成
            this.qrcodeShow = false
          }
          window.location.href = '/'
          this.$message.success(this.$t('pay.paySuccess'))
        }
      })
        .catch(() => {
          this.$message.success(this.$t('pay.payFail'))
        })
    },
    // 加载当前主题数据
    loadThreads() {
      this.loading = true
      const params = {
        'filter[isDeleted]': 'no',
        sort: '-createdAt',
        include: 'user,user.groups,firstPost,firstPost.images,firstPost.postGoods,category,threadVideo,threadAudio,question,question.beUser,question.beUser.groups',
        'page[number]': 1,
        'page[limit]': 10,
        'filter[isApproved]': 1,
        'filter[isSite]': 'yes'
      }
      status
        .run(() => this.$store.dispatch('jv/get', ['threads', { params }]))
        .then((res) => {
          this.loading = false
          this.threadsData = [...this.threadsData, ...res]
        }, (e) => {
          this.handleError(e)
        })
        .finally(() => {
          this.loading = false
        })
    },
    // 语音互斥播放
    audioPlay(id) {
      if (this.currentAudioId && this.currentAudioId !== id) {
        this.$refs[`audio${this.currentAudioId}`][0].pause()
      }
      this.currentAudioId = id
    }
  }
}
</script>
<style lang='scss' scoped>
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
.infocontainer {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}
.info {
  display: flex;
  width: 400px;
  margin-top: 62px;
  flex-direction: column;
  @media screen and (max-width: 1005px) {
    width: 292px;
  }
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
    font-weight: bold;
    font-size: 16px;
  }
  .workdate {
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
    // width: 326px;
    word-break: break-all;
    color: #6d6d6d;
    font-size: 14px;
    margin-left: 75px;
  }
  .content-info {
    margin-top: 16px;
    .img {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      vertical-align: bottom;
      margin-right: 5px;
      img {
        border-radius: 50%;
        width: 30px;
        vertical-align: middle;
      }
    }
    .member-img {
      margin-left: 76px;
    }
  }
  .r-button {
    width: 300px;
    margin-top: 20px;
    margin-bottom: 60px;
    background: #1878f3;
  }
  .islogin {
    margin-top: 10px;
  }
}
.thread{
  margin-top: 145px;
  overflow-y: auto;
  width: 500px;
  height: 475px;
  background: #fbfbfb;
  margin-left: 35px;
  @media screen and (max-width: 1005px) {
    width: 395px;
  }
  .threadtitle{
    font-size: 14px;
    color: #000000;
    margin-left: 20px;
    margin-top: 13px;
  }
}
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
  background-color:white;
  border-radius:100px;
  -webkit-border-radius: 100px;
}
scrollbar {
  width: 8px;
  height: 8px;
  background-color:white;
  border-radius:100px;
}
</style>
