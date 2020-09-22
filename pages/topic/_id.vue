<template>
  <div v-loading.fullscreen="defaultLoading" element-loading-background="rgba(0, 0, 0, 0)" class="page-post">
    <main v-loading="articleLoading">
      <div class="container-post">
        <div v-if="thread.isApproved === 0" class="checking">{{ $t('topic.examineTip') }}</div>
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
          :location="location"
          @payForVideo="showCheckoutCounter = true"
        />
        <topic-reward-list
          :author="thread.user || {}"
          :paid-information="paidInformation"
          :can-reward-or-paid="forums && forums.paycenter && forums.paycenter.wxpay_close && canRewardOrPaid"
          :thread-type="thread.type || 0"
          :user-lists="[thread.paidUsers || [], thread.rewardedUsers || [], article.likedUsers || []]"
          @payOrReward="showCheckoutCounter = true"
        />
        <topic-actions :thread-id="threadId" :actions="actions || []" @clickAction="postCommand" />
        <topic-checkout-counter
          v-if="showCheckoutCounter"
          :thread-type="thread.type || 0"
          :user="thread.user || {}"
          :amount="thread.price || 0"
          :content="article.summaryText || ''"
          :reward-or-pay="rewardOrPay"
          @close="showCheckoutCounter = false"
          @paying="paying"
        />
        <topic-password
          v-if="showPasswordInput"
          :price="parseInt(thread.price) === 0 ? payment.rewardAmount : (thread.price || 0)"
          :password-error.sync="passwordError"
          @close="showPasswordInput = passwordError = false"
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
    <topic-aside :author="thread.user || {}" />
  </div>
</template>

<script>
const threadInclude = 'posts.replyUser,user.groups,user,user.groups.permissionWithoutCategories,posts,posts.user,posts.likedUsers,posts.images,firstPost,firstPost.likedUsers,firstPost.images,firstPost.attachments,rewardedUsers,category,threadVideo,paidUsers'
import handleError from '@/mixin/handleError'

export default {
  name: 'Post',
  layout: 'custom_layout',
  mixins: [handleError],
  async asyncData({ params, store }) {
    try {
      const threadData = await store.dispatch('jv/get', [`threads/${params.id}`, { params: { include: threadInclude }}])
      return { thread: threadData, article: threadData.firstPost, postId: threadData.firstPost._jv.id }
    } catch (error) {
      // console.log('ssr err', error)

      return {
        articleLoading: true

        // _error__abc: {
        //   error_keys: Object.keys(error),
        //   error: String(error),
        //   errno: error.errno,
        //   code: error.code,
        //   syscall: error.syscall,
        //   address: error.address,
        //   port: error.port,
        //   config: error.config,
        //   request_domain: (error.request || {}).domain,
        //   request_keys: Object.keys(error.request || {}),
        //   response_keys: Object.keys(error.response || {})
        // }
      }
    }
  },
  data() {
    return {
      thread: {},
      article: {},
      postId: 0,
      actions: [
        { text: this.$t('topic.read'), count: 0, command: '', canOpera: false, icon: 'book' },
        { text: this.$t('topic.getLike'), count: 0, command: 'isLiked', canOpera: false, isStatus: false, icon: 'like' },
        { text: this.$t('topic.collection'), command: 'isFavorite', canOpera: false, isStatus: false, icon: 'favor' },
        { text: this.$t('topic.share'), command: 'showLink', canOpera: true, icon: 'link' }
      ],
      paidInformation: { price: '0', paid: false, paidUsers: [], paidCount: 0 },
      payment: { orderNo: '', payment_type: 0, status: 0, wechat_qrcode: '', rewardAmount: '' },
      location: { location: '', latitude: '', longitude: '' },
      managementList: [
        { name: 'canEdit', command: 'toEdit', isStatus: false, canOpera: false, text: this.$t('topic.edit'), type: '0' },
        { name: 'canEssence', command: 'isEssence', isStatus: false, canOpera: false, text: this.$t('topic.essence'), type: '1' },
        { name: 'canSticky', command: 'isSticky', isStatus: false, canOpera: false, text: this.$t('topic.sticky'), type: '2' },
        { name: 'canHide', command: 'isDeleted', isStatus: false, canOpera: false, text: this.$t('topic.delete'), type: '3' }
      ],
      showCheckoutCounter: false,
      showPasswordInput: false,
      showWxPay: false,
      defaultLoading: false,
      articleLoading: false,
      canRewardOrPaid: false,
      passwordError: false
    }
  },
  computed: {
    threadId() {
      return this.$route.params.id
    },
    userId() {
      return this.$store.getters['session/get']('userId')
    },
    currentUser() {
      return this.$store.state.user.info.attributes || {}
    },
    rewardOrPay() {
      return parseFloat(this.paidInformation.price) > 0 ? 'pay' : 'reward'
    },
    forums() {
      return this.$store.state.site.info.attributes || {}
    }
  },
  mounted() {
    if (Object.keys(this.thread).length === 0) this.getThread()
    else this.initData()
  },
  methods: {
    getThread() {
      return this.$store.dispatch('jv/get', [`threads/${this.threadId}`, { params: { include: threadInclude }}]).then(data => {
        if (data.isDeleted) return this.$router.push('/error')
        this.articleLoading = false
        this.thread = data
        this.article = data.firstPost
        this.postId = this.article._jv.id
        this.initData()
      }, e => this.handleError(e, 'thread'))
    },
    initData() {
      if (this.thread.user && this.thread.user.groups[0] && this.thread.user.groups[0].permissionWithoutCategories) {
        this.canRewardOrPaid = this.thread.user.groups[0].permissionWithoutCategories.filter(item => item.permission === 'createThreadPaid').length > 0
        if (this.thread.user.groups[0]._jv.id === '1') this.canRewardOrPaid = true
      }
      this.initManagementList(this.thread)
      this.initPaidInformation(this.thread)
      this.initActions(this.thread, this.article)
      this.initLocation(this.thread)
    },
    initLocation(data) {
      for (const key in this.location) this.location[key] = data[key]
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
      this.thread.isEssence = data.isEssence
      this.managementList = this.managementList.filter(item => item.canOpera)
    },
    initActions(data, firstPost) {
      const viewInfo = { ...this.actions[0] }
      const favorInfo = { ...this.actions[2] }
      const likeInfo = { ...this.actions[1] }
      if (data) {
        viewInfo.count = data.viewCount
        favorInfo.isStatus = data.isFavorite
        favorInfo.text = favorInfo.isStatus ? this.$t('topic.collectionAlready') : this.$t('topic.collection')
        favorInfo.icon = favorInfo.isStatus ? 'favored' : 'favor'
        favorInfo.canOpera = data.canFavorite
      }
      if (firstPost) {
        likeInfo.count = firstPost.likeCount
        likeInfo.isStatus = firstPost.isLiked
        likeInfo.canOpera = firstPost.canLike
        likeInfo.text = likeInfo.isStatus ? this.$t('topic.liked') : this.$t('topic.getLike')
        likeInfo.icon = likeInfo.isStatus ? 'liked' : 'like'
      }

      this.$set(this.actions, 0, viewInfo)
      this.$set(this.actions, 1, likeInfo)
      this.$set(this.actions, 2, favorInfo)
    },
    paying({ payWay, hideAvatar, rewardAmount }) {
      this.payment.rewardAmount = rewardAmount
      if (this.rewardOrPay === 'reward' && (!rewardAmount || parseFloat(rewardAmount) === 0)) return this.$message.error(this.$t('pay.AmountCannotBeLessThan0'))
      this.showCheckoutCounter = false
      if (payWay === 'walletPay') {
        this.payment.payment_type = 20
        this.showPasswordInput = true
        this.createOrder(hideAvatar, this.rewardOrPay === 'reward' ? rewardAmount : this.thread.price).finally(() => { this.defaultLoading = false })
      } else if (payWay === 'wxPay') {
        this.payment.payment_type = 10
        if (!this.forums.paycenter.wxpay_close) return this.$message.warning(this.$t('pay.wxPayClose'))
        this.createOrder(hideAvatar, this.rewardOrPay === 'reward' ? rewardAmount : this.thread.price).then(() => this.payOrder()).finally(() => { this.defaultLoading = false })
      }
    },
    createOrder(hideAvatar, amount = 0) {
      if (this.defaultLoading) return
      this.defaultLoading = true
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
      return this.$store.dispatch('jv/post', params).then(data => {
        if (this.payment.payment_type === 10) {
          this.wxPayActive(data)
        } else {
          this.$message.success(this.$t('pay.paySuccess'))
          this.passwordError = false
          this.showPasswordInput = false
          this.getThread()
        }
      }, e => {
        const { response: { data: { errors }}} = e
        if (errors[0].code === 'pay_password_failures_times_toplimit') this.showPasswordInput = false
        if (errors[0].code === 'validation_error') this.passwordError = true
        this.handleError(e)
      })
    },
    wxPayActive(data) {
      this.payment.wechat_qrcode = data.wechat_qrcode
      this.showWxPay = true
      if (process.client) {
        const id = setInterval(() => {
          if (this.payment.status === 1) {
            clearInterval(id)
            this.$message.success(this.$t('pay.paySuccess'))
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
      if (this.defaultLoading) return
      this.defaultLoading = true
      const params = item.command === 'isLiked' ? { _jv: { type: `posts`, id: this.postId }} : { _jv: { type: `threads`, id: this.threadId }}
      params[item.command] = !item.isStatus
      return this.$store.dispatch('jv/patch', params).then(data => {
        data.firstPost && this.initManagementList(data)
        data.firstPost && this.initActions(data)
        if (item.command === 'isSticky') return item.isStatus ? this.$message.success(this.$t('topic.stickySuccess')) : this.$message.success(this.$t('topic.cancelStickySuccess'))
        if (item.command === 'isLiked') return this.setLikeUser(!item.isStatus, data)
        if (item.command === 'isDeleted') return this.afterDeleted()
      }, e => this.handleError(e)).finally(() => { this.defaultLoading = false })
    },
    setLikeUser(status, data) {
      this.initActions(null, data)
      status ? this.article.likedUsers.unshift(this.currentUser)
        : this.article.likedUsers.forEach((item, index, array) => { item.id === this.currentUser.id && array.splice(index, 1) })
    },
    afterDeleted() {
      this.$message({ typeInformation: 'success', message: this.$t('topic.deleteSuccessAndJumpToBack') })
      setTimeout(() => { this.$router.push('/') }, 1000)
    }
  },
  head() {
    return {
      title: this.thread && this.thread.title || this.thread && this.thread.firstPost && this.thread.firstPost.summaryText || '主题详情页'
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
        > .checking {
          margin-bottom: 20px;
          border-radius: 5px;
          text-align: center;
          background: #EDEDED;
          height: 35px;
          line-height: 35px;
          color: $font-color-grey;
        }
      }
    }
  }

</style>
