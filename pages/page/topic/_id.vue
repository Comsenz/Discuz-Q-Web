<template>
  <div v-loading="loading" element-loading-background="#fff" class="page-post">
    <main>
      <topic-header
        :author="author"
        :article="article"
        :management-list="managementList"
        :thread-id="threadId"
        @managementSelected="initManagementList"
      />
      <topic-content
        :article="article"
        :title="title"
        :video="threadVideo"
      />
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
      author: {},
      article: {},
      title: '',
      threadVideo: {},
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
    threadId() {
      return this.$route.params.id
    }
  },
  created() {
    this.getPost()
  },
  methods: {
    getPost() {
      this.$store.dispatch('jv/get', [`threads/${this.threadId}`, { params: { include }}]).then(data => {
        if (data.isDeleted) return this.$router.push('/demo')
        this.author = data.user
        this.article = data.firstPost
        this.title = data.title
        this.threadVideo = data.threadVideo || {}
        this.loading = false
        console.log('data', data)
        console.log('article', this.article)
        console.log('video', this.threadVideo)
        this.initManagementList(data)
      })
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
