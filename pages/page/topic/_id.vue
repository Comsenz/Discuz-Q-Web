<template>
  <div v-loading="loading" element-loading-background="#fff" class="page-post">
    <main>
      <topic-header
        :author="thread.user || {}"
        :article="thread.firstPost || {}"
        :management-list="managementList"
        :thread-id="threadId"
        @managementSelected="initManagementList"
      />
      <topic-content
        :article="thread.firstPost || {}"
        :title="thread.title || ''"
        :video="thread.threadVideo || {}"
        :paid-information="paidInformation"
        :thread-type="thread.type || 0"
        :category="thread.category || {}"
      />
      <topic-actions />
      <div class="tags" />
      <div class="actions" />
    </main>
    <aside>我是一个伟大的侧栏</aside>
  </div>
</template>

<script>
const include = 'posts.replyUser,user.groups,user,posts,posts.user,posts.likedUsers,posts.images,firstPost,firstPost.likedUsers,firstPost.images,firstPost.attachments,rewardedUsers,category,threadVideo,paidUsers'

export default {
  layout: 'custom_layout',
  name: 'Post',
  data() {
    return {
      thread: {},
      // TODO 后端数据不完整，留着后面做
      actions: [
        { text: '阅读', count: 0, command: '' },
        { text: '点赞', count: 0, command: 'isLiked', isStatus: false },
        { text: '收藏', count: 0, command: 'isFavorite', isStatus: false },
        { text: '分享', count: 0, command: 'showLink' }
      ],
      paidInformation: { price: 0, paid: false, paidUsers: [], paidCount: 0 },
      managementList: [
        { name: 'canEdit', command: 'toEdit', isStatus: false, text: this.$t('topic.edit'), type: '0' },
        { name: 'canEssence', command: 'isEssence', isStatus: false, text: this.$t('topic.essence'), type: '1' },
        { name: 'canSticky', command: 'isSticky', isStatus: false, text: this.$t('topic.sticky'), type: '2' },
        { name: 'canHide', command: 'isDeleted', isStatus: false, text: this.$t('topic.delete'), type: '3' }
      ], // 管理菜单
      loading: true
    }
  },
  computed: {
    threadId() { return this.$route.params.id }
  },
  created() {
    this.getPost()
  },
  methods: {
    getPost() {
      this.$store.dispatch('jv/get', [`threads/${this.threadId}`, { params: { include }}]).then(data => {
        if (data.isDeleted) return this.$router.push('/demo')
        this.thread = data
        this.loading = false
        this.initManagementList(data)
        this.initPaidInformation(data)
        this.initActions(data)
        console.log('data', data)
        console.log(this.paidInformation, 'paidInformation')
      })
    },
    initPaidInformation(data) {
      for (const key in this.paidInformation) { this.paidInformation[key] = data[key] }
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
    initActions(data) {
      // TODO 后端数据不完整，留着后面做
      this.actions[1].count = data.firstPost.likeCount
      this.actions[0].count = data.viewCount
      this.actions[1].count = data.firstPost.likeCount
      this.actions[1].isStatus = data.firstPost.isLiked
      this.actions[2].count = 1000
      this.actions[2].isStatus = data.isFavorite
      this.actions[3].count = 157
      console.log(this.actions, 'actions')
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
