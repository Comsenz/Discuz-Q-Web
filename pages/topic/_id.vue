<template>
  <div v-loading="loading" element-loading-background="#fff" class="page-post">
    <main>
      <div class="container-post">
        <topic-header
          :author="thread.user || {}"
          :thread="thread"
          :management-list="managementList"
          @managementSelected="postCommand"
        />
        <topic-content
          :article="article"
          :title="thread.title || ''"
          :video="thread.threadVideo || {}"
          :paid-information="paidInformation"
          :thread-type="thread.type || 0"
          :category="thread.category || {}"
          @payForVideo="showCheckoutCounter = true"
        />
        <topic-reward-list
          :paid-information="paidInformation"
          :thread-type="thread.type || 0"
          :user-lists="[thread.paidUsers || [], thread.rewardedUsers || [], article.likedUsers || []]"
          @payOrReward="showCheckoutCounter = true"
        />
        <topic-actions :actions="actions || []" @clickAction="postCommand" />
        <topic-checkout-counter
          v-if="showCheckoutCounter"
          :thread-type="thread.type || 0"
          :user="thread.user || {}"
          :amount="thread.price || 0"
          :content="article.summaryText || ''"
          :user-wallet="userWallet"
          :reward-or-pay="rewardOrPay"
          @close="showCheckoutCounter = false"
          @paying="paying"
        />
        <topic-password
          v-if="showPasswordInput"
          :price="payment.rewardAmount ? payment.rewardAmount : (thread.price || 0)"
          @close="showPasswordInput = false"
          @password="payOrder"
        />
        <topic-wx-pay
          v-if="showWxPay"
          :qr-code="payment.wechat_qrcode"
          @close="showWxPay = false"
        />
        <comment :thread-id="threadId" />
      </div>
    </main>
    <topic-aside :author="thread.user || {}" :forums="forums || {}" />
  </div>
</template>

<script>
const threadInclude = 'posts.replyUser,user.groups,user,posts,posts.user,posts.likedUsers,posts.images,firstPost,firstPost.likedUsers,firstPost.images,firstPost.attachments,rewardedUsers,category,threadVideo,paidUsers'
import forums from '@/mixin/forums'
import handleError from '@/mixin/handleError'

export default {
  name: 'Post',
  layout: 'custom_layout',
  mixins: [forums, handleError],
  data() {
    return {
      thread: {},
      article: {},
      postId: 0,
      // TODO 后端数据不完整，留着后面做
      actions: [
        { text: this.$t('topic.read'), count: 0, command: '', canOpera: false, icon: 'book' },
        { text: this.$t('topic.getLike'), count: 0, command: 'isLiked', canOpera: false, isStatus: false, icon: 'like' },
        { text: this.$t('topic.collection'), command: 'isFavorite', canOpera: false, isStatus: false, icon: 'favor' },
        { text: this.$t('topic.share'), command: 'showLink', canOpera: true, icon: 'link' }
      ],
      paidInformation: { price: '0', paid: false, paidUsers: [], paidCount: 0 },
      payment: { orderNo: '', payment_type: 0, status: 0, wechat_qrcode: '', rewardAmount: '' },
      userWallet: { availableAmount: '0.00', canWalletPay: false },
      payPassword: { password: '', confirmPassword: '' },
      managementList: [
        { name: 'canEdit', command: 'toEdit', isStatus: false, canOpera: false, text: this.$t('topic.edit'), type: '0' },
        { name: 'canEssence', command: 'isEssence', isStatus: false, canOpera: false, text: this.$t('topic.essence'), type: '1' },
        { name: 'canSticky', command: 'isSticky', isStatus: false, canOpera: false, text: this.$t('topic.sticky'), type: '2' },
        { name: 'canHide', command: 'isDeleted', isStatus: false, canOpera: false, text: this.$t('topic.delete'), type: '3' }
      ],
      showCheckoutCounter: false,
      showPasswordInput: false,
      showWxPay: false,
      loading: true
    }
  },
  computed: {
    threadId() {
      return this.$route.params.id
    },
    userId() {
      return this.$store.getters['session/get']('userId')
    },
    rewardOrPay() {
      return parseFloat(this.paidInformation.price) > 0 ? 'pay' : 'reward'
    }
  },
  created() {
    this.getThread()
    this.getWalletBalance()
  },
  methods: {
    getThread() {
      return this.$store.dispatch('jv/get', [`threads/${this.threadId}`, { params: { include: threadInclude }}]).then(data => {
        if (data.isDeleted) return this.$router.push('/demo')
        this.thread = data
        this.article = data.firstPost
        this.loading = false
        this.postId = this.article._jv.id
        this.initManagementList(data)
        this.initPaidInformation(data)
        this.initActions(data, this.article)
        console.log('data', data)
      }, e => this.handleError(e))
    },
    getWalletBalance() {
      const params = { _jv: { type: `/wallet/user/${this.userId}` }}
      this.$store.dispatch('jv/get', params).then(data => {
        this.userWallet.availableAmount = data.available_amount
        this.userWallet.canWalletPay = data.user.canWalletPay
      }, e => this.handleError(e))
    },
    initPaidInformation(data) {
      for (const key in this.paidInformation) this.paidInformation[key] = data[key]
    },
    initManagementList(data) {
      this.managementList.forEach(item => {
        item.canOpera = data[item.name]
        if (item.name === 'canEssence') {
          item.isStatus = data.isEssence
          item.text = item.isStatus ? this.$t('topic.cancelEssence') : this.$t('topic.essence')
        } else if (item.name === 'canSticky') {
          item.isStatus = data.isSticky
          item.text = item.isStatus ? this.$t('topic.cancelSticky') : this.$t('topic.sticky')
        }
      })
    },
    initActions(data, firstPost) {
      if (data) {
        this.actions[0].count = data.viewCount
        this.actions[2].isStatus = data.isFavorite
        this.actions[2].text = this.actions[2].isStatus ? this.$t('topic.collectionAlready') : this.$t('topic.collection')
        this.actions[2].icon = this.actions[2].isStatus ? 'favored' : 'favor'
        this.actions[2].canOpera = data.canFavorite
      }
      if (firstPost) {
        this.actions[1].count = firstPost.likeCount
        this.actions[1].isStatus = firstPost.isLiked
        this.actions[1].canOpera = firstPost.canLike
        this.actions[1].text = this.actions[1].isStatus ? this.$t('topic.liked') : this.$t('topic.getLike')
        this.actions[1].icon = this.actions[1].isStatus ? 'liked' : 'like'
      }
    },
    paying({ payWay, hideAvatar, rewardAmount }) {
      this.payment.rewardAmount = rewardAmount
      this.showCheckoutCounter = false
      if (payWay === 'walletPay') {
        this.payment.payment_type = 20
        this.showPasswordInput = true
        this.createOrder(hideAvatar, this.rewardOrPay === 'reward' ? rewardAmount : this.thread.price)
      } else if (payWay === 'wxPay') {
        this.payment.payment_type = 10
        if (this.forums.paycenter.wxpay_close) return this.$message.warning('微信支付功能已关闭')
        // TODO Loading
        this.createOrder(hideAvatar, this.rewardOrPay === 'reward' ? rewardAmount : this.thread.price).then(() => this.payOrder())
      }
    },
    createOrder(hideAvatar, amount = 0) {
      const params = {
        _jv: { type: `/orders` },
        type: this.rewardOrPay === 'reward' ? '2' : '3',
        thread_id: this.threadId,
        is_anonymous: hideAvatar,
        amount
      }
      return this.$store.dispatch('jv/post', params).then(data => {
        this.payment.orderNo = data.order_sn
      }, e => this.handleError(e))
    },
    payOrder(password = '') {
      const params = {
        _jv: { type: `/trade/pay/order/${this.payment.orderNo}` },
        order_sn: this.payment.orderNo,
        payment_type: this.payment.payment_type,
        pay_password: password
      }
      this.$store.dispatch('jv/post', params).then(data => {
        if (this.payment.payment_type === 10) {
          this.wxPayActive(data)
        } else {
          this.$message.success('支付成功')
          this.getThread()
        }
      }, e => this.handleError(e)).finally(() => { this.showPasswordInput = false })
    },
    wxPayActive(data) {
      this.payment.wechat_qrcode = data.wechat_qrcode
      this.showWxPay = true
      if (process.client) {
        const id = setInterval(() => {
          if (this.payment.status === 1) {
            clearInterval(id)
            this.$message.success('支付成功')
            this.showWxPay = false
            this.getThread()
          }
          if (!this.showWxPay) clearInterval(id)
          this.getOrderStatus()
        }, 3000)
      }
    },
    getOrderStatus() {
      const params = { _jv: { type: `/orders/${this.payment.orderNo}` }, orderNo: this.payment.orderNo }
      return this.$store.dispatch('jv/get', params).then(data => { this.payment.status = data.status }, e => this.handleError(e))
    },
    postCommand(item) {
      const params = item.command === 'isLiked' ? { _jv: { type: `posts`, id: this.postId }} : { _jv: { type: `threads`, id: this.threadId }}
      params[item.command] = !item.isStatus
      return this.$store.dispatch('jv/patch', params).then(data => {
        this.initManagementList(data)
        item.command === 'isLiked' ? this.initActions(null, data) : this.initActions(data)
        if (item.command === 'isDeleted') return this.afterDeleted()
      }, e => this.handleError(e))
    },
    afterDeleted() {
      this.$message({ type: 'success', message: this.$t('topic.deleteSuccessAndJumpToBack') })
      setTimeout(() => { this.$router.push('/') }, 1500)
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '@/assets/css/variable/color.scss';

  .page-post {
    background: #F4F5F6;
    width: 100%;
    display: flex;
    justify-content: space-between;

    main {
      background: transparent;
      flex: 1;
      > .container-post {
        border-radius: 3px;
        padding: 20px;
        width: 100%;
        background: #ffffff;
      }
    }
  }

</style>
