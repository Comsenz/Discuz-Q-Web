<template>
  <div v-loading.fullscreen="defaultLoading" element-loading-background="rgba(0, 0, 0, 0)" class="page-post">
    <main v-loading="articleLoading">
      <div class="container-post">
        <div v-if="thread.isApproved === 0" class="checking">
          {{ thread.threadVideo && thread.threadVideo.status === 0 ? $t('topic.VideoTranscoding') : $t('topic.examineTip') }}
        </div>
        <topic-header
          :author="thread.user || {}"
          :thread="thread"
          :management-list="managementList"
          :be-asked-user="question && question.beUser ? question.beUser : {}"
          @managementSelected="postCommand"
        />
        <topic-content
          :article="article"
          :title="thread.title || ''"
          :video="thread.threadVideo || {}"
          :audio="thread.threadAudio || {}"
          :paid-information="paidInformation"
          :thread-type="thread.type || 0"
          :category="thread.category || {}"
          :location="location"
          @payForThread="showCheckoutCounter = true"
        />
        <qa-actions
          v-if="thread.type === 5"
          :question="question || {}"
          :current-user-id="currentUser && currentUser.id ? currentUser.id : ''"
          :question-user-id="thread.user && thread.user.id ? thread.user.id : ''"
          @answerPublished="getThread()"
          @payForAnswer="showCheckoutCounter = true"
        />
        <topic-reward-list
          :author="thread.user || {}"
          :paid-information="paidInformation"
          :can-reward-or-paid="forums && forums.paycenter && forums.paycenter.wxpay_close && canBeReward"
          :thread-type="thread.type || 0"
          :user-lists="[thread.paidUsers || [], thread.rewardedUsers || [], article.likedUsers || [], []]"
          @payOrReward="showCheckoutCounter = true"
        />
        <topic-actions :thread-id="threadId" :actions="actions || []" @clickAction="postCommand" />
        <topic-checkout-counter
          v-if="showCheckoutCounter"
          :thread-type="thread.type || 0"
          :user="thread.user || {}"
          :amount="payOrRewardAmount"
          :content="article.summaryText || ''"
          :reward-or-pay="rewardOrPay"
          :be-asked-user="question.beUser || {}"
          ask-or-watch-answer="watchAnswer"
          @close="showCheckoutCounter = false"
          @paying="paying"
        />
        <topic-password
          v-if="showPasswordInput"
          :price="payOrRewardAmount"
          :password-error.sync="passwordError"
          :password-error-tip="passwordErrorTip"
          @close="showPasswordInput = passwordError = false"
          @password="onPasswordInputCompleted"
          @findPassword="onFindPassword"
        />
        <topic-wx-pay v-if="showWxPay" :qr-code="payment.wechat_qrcode" @close="showWxPay = false" />
        <find-paypwd
          v-if="findPassword && currentUser.originalMobile"
          :mobile="currentUser.mobile"
          :phonenum="currentUser.originalMobile"
          @close="findPassword = false"
        />
        <!-- 找回密码，没绑定手机 -->
        <without-phone v-if="findPassword && !currentUser.originalMobile" @close="findPassword = false" />
        <comment :thread-id="threadId" />
      </div>
    </main>
    <topic-aside :author="thread.user || {}" />
  </div>
</template>

<script>
const threadInclude = 'posts.replyUser,threadAudio,user.groups,user,user.groups.permissionWithoutCategories,posts,posts.user,posts.likedUsers,posts.images,firstPost,firstPost.likedUsers,firstPost.images,firstPost.attachments,rewardedUsers,category,threadVideo,paidUsers,question,question.beUser,question.images,onlookers'
import handleError from '@/mixin/handleError'
import isLogin from '@/mixin/isLogin'
import payment from '@/mixin/payment'
import env from '@/utils/env'

export default {
  name: 'Topic',
  layout: 'custom_layout',
  mixins: [handleError, isLogin, payment],
  async asyncData({ query, store }) {
    if (!env.isSpider) {
      return {}
    }
    try {
      const threadData = await store.dispatch('jv/get', [`threads/${query.id}`, { params: { include: threadInclude }}])
      return { thread: threadData, article: threadData.firstPost, postId: threadData.firstPost._jv.id }
    } catch (error) {
      return { articleLoading: true }
    }
  },
  data() {
    return {
      thread: {},
      article: {},
      question: {},
      postId: 0,
      actions: [
        { text: this.$t('topic.read'), count: 0, command: '', canOpera: false, icon: 'book' },
        { text: this.$t('topic.getLike'), count: 0, command: 'isLiked', canOpera: false, isStatus: false, icon: 'like' },
        { text: this.$t('topic.collection'), command: 'isFavorite', canOpera: false, isStatus: false, icon: 'favor' },
        { text: this.$t('topic.share'), command: 'showLink', canOpera: true, icon: 'link' }
      ],
      paidInformation: { price: '0', paid: false, paidUsers: [], paidCount: 0, isPaidAttachment: false, attachmentPrice: '0' },
      payment: { wechat_qrcode: '', rewardAmount: '' },
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
      canBeReward: false,
      passwordError: false,
      passwordErrorTip: '',
      findPassword: false
    }
  },
  computed: {
    threadId() {
      return this.$route.query.id
    },
    currentUser() {
      return this.$store.state.user.info.attributes || {}
    },
    forums() {
      return this.$store.state.site.info.attributes || {}
    },
    rewardOrPay() {
      const price = parseFloat(this.paidInformation.price)
      const attachmentPrice = parseFloat(this.paidInformation.attachmentPrice)
      const questionPrice = Object.keys(this.question).length > 0 ? parseFloat(this.question.onlooker_unit_price) : 0
      return price > 0 || attachmentPrice > 0 || questionPrice > 0 ? 'pay' : 'reward'
    },
    payOrRewardAmount() {
      const price = parseFloat(this.paidInformation.price || '0')
      const attachmentPrice = parseFloat(this.paidInformation.attachmentPrice || '0')
      const questionPrice = Object.keys(this.question).length > 0 ? parseFloat(this.question.onlooker_unit_price) : 0
      return price || attachmentPrice || questionPrice || this.payment.rewardAmount
    },
    payOrderType() {
      const price = parseFloat(this.paidInformation.price || '0')
      const attachmentPrice = parseFloat(this.paidInformation.attachmentPrice || '0')
      const questionPrice = Object.keys(this.question).length > 0 ? parseFloat(this.question.onlooker_unit_price) : 0
      // 1：注册，2：打赏，3：付费主题，4：付费用户组，5：问答提问支付，6：问答围观付费, 7: 付费附件
      if (price > 0) {
        return 3
      } else if (attachmentPrice > 0) {
        return 7
      } else if (questionPrice > 0) {
        return 6
      } else {
        return 2
      }
    }
  },
  mounted() {
    if (Object.keys(this.thread).length === 0) this.getThread()
    else this.initData()
  },
  methods: {
    getThread() {
      return this.$store.dispatch('jv/get', [`threads/${this.threadId}`, { params: { include: threadInclude }}]).then(data => {
        if (data.isDeleted) return this.$router.replace('/error')
        this.articleLoading = false
        this.thread = data
        this.article = data.firstPost
        this.postId = this.article._jv.id
        this.initData()
      }, e => this.handleError(e, 'thread'))
    },
    initData() {
      console.log('thread => ', this.thread)
      if (this.thread.user && this.thread.user.groups[0] && this.thread.user.groups[0].permissionWithoutCategories) {
        this.canBeReward = this.thread.user.groups[0].permissionWithoutCategories.filter(item => item.permission === 'canBeReward').length > 0
        if (this.thread.user.groups[0]._jv.id === '1') this.canBeReward = true
      }
      this.initManagementList(this.thread)
      this.initPaidInformation(this.thread)
      this.initActions(this.thread, this.article)
      this.initLocation(this.thread)
      this.initQuestion(this.thread)
    },
    initQuestion(data) {
      if (!data.question) return
      this.question = data.question
      this.question.onlookerState = data.onlookerState
      console.log(this.question, 'question')
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
      if ((this.thread.type === 4 || this.thread.type === 5) && this.managementList.filter(item => item.name === 'canEdit').length > 0) { // 语音贴和问答帖，不支持编辑
        this.managementList.filter(item => item.name === 'canEdit')[0].canOpera = false
      }
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
      if (this.rewardOrPay === 'reward' && (!rewardAmount || parseFloat(rewardAmount) === 0)) return this.$message.error(this.$t('pay.AmountCannotBeLessThan0'))
      this.payment.rewardAmount = rewardAmount
      this.showCheckoutCounter = false
      if (payWay === 'walletPay') {
        this.showPasswordInput = true
        this.createOrder(hideAvatar, this.payOrRewardAmount, this.payOrderType, 20).finally(() => { this.defaultLoading = false })
      } else if (payWay === 'wxPay') {
        if (!this.forums.paycenter.wxpay_close) return this.$message.warning(this.$t('pay.wxPayClose'))
        this.createOrder(hideAvatar, this.payOrRewardAmount, this.payOrderType, 10)
          .then(() => {
            this.payOrder().then(wechatQrcode => {
              this.payment.wechat_qrcode = wechatQrcode
              this.wxPayActive().then(() => {
                this.getThread()
              }, () => console.log('支付失败'))
            }, () => console.log('支付失败'))
          }).finally(() => { this.defaultLoading = false })
      }
    },
    onPasswordInputCompleted(password) {
      this.payOrder(password).then(() => {
        this.getThread()
      }, () => console.log('支付失败'))
    },
    postCommand(item) {
      if (this.defaultLoading) return
      if (!this.isLogin()) return
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
      title: ((this.thread && this.thread.title) ||
      (this.thread && this.thread.firstPost && this.thread.firstPost.summaryText.slice(0, 15)) ||
      '主题详情页') + (this.forums && this.forums.set_site && this.forums.set_site.site_name ? ' - ' + this.forums.set_site.site_name : '\u200E'),
      meta: [
        { hid: 'keywords', name: 'keywords', content: (this.thread.category && this.thread.category.name) || '' },
        { hid: 'description', name: 'description', content: (this.thread.firstPost && this.thread.firstPost.summaryText.slice(0, 80)) || '' }
      ]
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
