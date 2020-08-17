<template>
  <div v-loading="loading" element-loading-background="#fff" class="page-post">
    <main>
      <topic-header
        :author="thread.user || {}"
        :article="article"
        :management-list="managementList"
        :thread-id="threadId"
        @managementSelected="initManagementList"
      />
      <topic-content
        :article="article"
        :title="thread.title || ''"
        :video="thread.threadVideo || {}"
        :paid-information="paidInformation"
        :thread-type="thread.type || 0"
        :category="thread.category || {}"
      />
      <topic-reward-list
        :paid-information="paidInformation"
        :thread-type="thread.type || 0"
        :user-lists="[thread.paidUsers || [], thread.rewardedUsers || [], article.likedUsers || []]"
        @payOrReward="showCheckoutCounter = true"
      />
      <topic-actions />
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
    </main>
    <aside>我是一个伟大的侧栏</aside>
  </div>
</template>

<script>
const include = 'posts.replyUser,user.groups,user,posts,posts.user,posts.likedUsers,posts.images,firstPost,firstPost.likedUsers,firstPost.images,firstPost.attachments,rewardedUsers,category,threadVideo,paidUsers'

export default {
  name: 'Post',
  layout: 'custom_layout',
  data() {
    return {
      thread: {},
      article: {},
      // TODO 后端数据不完整，留着后面做
      actions: [
        { text: '阅读', count: 0, command: '' },
        { text: '点赞', count: 0, command: 'isLiked', isStatus: false },
        { text: '收藏', count: 0, command: 'isFavorite', isStatus: false },
        { text: '分享', count: 0, command: 'showLink' }
      ],
      paidInformation: { price: '0', paid: false, paidUsers: [], paidCount: 0 },
      userWallet: { availableAmount: '0.00', canWalletPay: false },
      managementList: [
        { name: 'canEdit', command: 'toEdit', isStatus: false, text: this.$t('topic.edit'), type: '0' },
        { name: 'canEssence', command: 'isEssence', isStatus: false, text: this.$t('topic.essence'), type: '1' },
        { name: 'canSticky', command: 'isSticky', isStatus: false, text: this.$t('topic.sticky'), type: '2' },
        { name: 'canHide', command: 'isDeleted', isStatus: false, text: this.$t('topic.delete'), type: '3' }
      ],
      showCheckoutCounter: false,
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
    this.getPost()
    this.getWalletBalance()
  },
  methods: {
    getPost() {
      this.$store.dispatch('jv/get', [`threads/${this.threadId}`, { params: { include }}]).then(data => {
        if (data.isDeleted) return this.$router.push('/demo')
        this.thread = data
        this.article = data.firstPost
        this.loading = false
        this.initManagementList(data)
        this.initPaidInformation(data)
        this.initActions(data)
        console.log('data', data)
      })
    },
    getWalletBalance() {
      const params = { _jv: { type: `/wallet/user/${this.userId}` }}
      this.$store.dispatch('jv/get', params).then(data => {
        console.log(data, 'dddd')
        this.userWallet.availableAmount = data.available_amount
        this.userWallet.canWalletPay = data.user.canWalletPay
      })
    },
    initPaidInformation(data) {
      for (const key in this.paidInformation) {
        this.paidInformation[key] = data[key]
      }
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
    paying({ payWay, hideAvatar }) {
      console.log('准备支付啦', payWay, hideAvatar)
      if (payWay === 'walletPay' && !this.userWallet.canWalletPay) { // 没设置初始密码
        this.setPayPassword()
      }
    },
    setPayPassword() {
      const params = {
        _jv: { type: `/users/${this.userId}` },
        payPassword: '123456',
        pay_password_confirmation: '123456',
        pay_password_token: ''
      }
      this.$store.dispatch('jv/patch', params).then(data => {
        console.log(data, 'data')
      })
    },
    initActions(data) {
      // TODO 后端数据不完整，留着后面做
      this.actions[1].count = data.firstPost.likeCount
      this.actions[0].count = data.viewCount
      this.actions[1].count = data.firstPost.likeCount
      this.actions[1].isStatus = data.firstPost.isLiked
      this.actions[2].count = 1000
      this.actions[2].isStatus = data.isFavorite
      this.actions[3].count = 157
    }
  }
}
</script>

<style lang="scss" scoped>
  $fontColor: #8590A6;
  $activeColor: #1878F3;

  .page-post {
    background: #F4F5F6;
    width: 100%;
    display: flex;
    justify-content: space-between;

    main {
      background: #ffffff;
      width: 690px;
      padding: 20px;

      > article {
        margin-top: 25px;

        .timer {
          margin-top: 5px;
          color: #8590a6;
          font-size: 12px;
        }
      }
    }

  }

  aside {
    background: #ffffff;
    width: 300px;
    min-height: 300px;
  }
</style>
