<template>
  <div v-loading="loading" element-loading-background="#fff" class="page-post">
    <main>
      <PostHeader :author="author" :article="article" :management-list="managementList" />
      <article>
        <div class="content" v-html="article.contentHtml" />
        <div class="images">
          <el-image
            v-for="(image, index) in article.images"
            :key="index"
            style="max-width: 100%"
            :src="image.thumbUrl"
            :alt="image.filename"
            fit="fill"
          />
        </div>
      </article>
      <div class="tags" />
      <div class="actions" />
    </main>
    <aside>我是一个伟大的侧栏</aside>
  </div>
</template>

<script>
import PostHeader from '../../../components/PostHeader'

export default {
  name: 'Post',
  components: { PostHeader },
  data() {
    return {
      author: {},
      article: {},
      managementList: [
        { name: 'canEdit', isStatus: false, text: this.$t('topic.edit'), type: '0' },
        { name: 'canEssence', isStatus: false, text: this.$t('topic.essence'), type: '1' },
        { name: 'canSticky', isStatus: false, text: this.$t('topic.sticky'), type: '2' },
        { name: 'canHide', isStatus: false, text: this.$t('topic.delete'), type: '3' }
      ], // 管理菜单
      loading: true
    }
  },
  created() {
    this.getPost()
  },
  methods: {
    getPost() {
      const id = 1796 // 以后需要从导航取
      // const params = {
      //   include: [
      //     'posts.replyUser',
      //     'user.groups',
      //     'user',
      //     'posts',
      //     'posts.user',
      //     'posts.likedUsers',
      //     'posts.images',
      //     'firstPost',
      //     'firstPost.likedUsers',
      //     'firstPost.images',
      //     'firstPost.attachments',
      //     'rewardedUsers',
      //     'category',
      //     'threadVideo',
      //     'paidUsers'
      //   ]
      // }
      this.$store.dispatch('jv/get', `threads/${id}`).then(data => {
        this.author = data.user
        this.article = data.firstPost
        this.loading = false
        console.log('data', data)
        console.log('author', this.author)
        console.log('article', this.article)
        this.initManagementList(data)
      })
    },
    initManagementList(data) {
      this.managementList.forEach(item => {
        item.canOpera = data[item.name]
        if (item.name === 'canEssence') {
          item.isStatus = data.isEssence
          item.isStatus ? item.text = this.$t('cancelEssence') : item.text
        } else if (item.name === 'canSticky') {
          item.isStatus = data.isSticky
          item.isStatus ? item.text = this.$t('cancelSticky') : item.text
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  $fontColor: #8590A6;
  $activeColor: #1878F3;

  .el-dropdown-menu__item:hover {
    background: #ffffff;
    color: $activeColor;
  }

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

    > article {
      margin-top: 20px;

      > .images {
        margin-top: 30px;
      }
    }
  }

  aside {
    background: #ffffff;
    width: 300px;
    min-height: 300px;
  }
}
</style>
