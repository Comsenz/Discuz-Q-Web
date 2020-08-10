<template>
  <div class="page-post">
    <main>
      <div class="title">
        <img class="avatar" :src="author.avatarUrl" :alt="author.username">
        <div class="title-info">
          <div class="author-name">{{ author.username }}</div>
          <div class="timer">发布于 {{ formatDate(article.createdAt) }}（编辑于 {{ formatDate(article.updatedAt) }}）</div>
        </div>
      </div>
      <article>
        <div class="content">
          {{ article.content }}
        </div>
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
import dayjs from 'dayjs'

export default {
  name: 'Post',
  data() {
    return {
      author: {},
      article: {}
    }
  },
  created() {
    this.getPost()
  },
  methods: {
    getPost() {
      const id = 1766 // 以后需要从导航取
      const params = { _jv: { type: `/threads/${id}` }}
      this.$store.dispatch('jv/get', params).then(data => {
        this.author = data.user
        this.article = data.firstPost
        console.log('author', this.author)
        console.log('article', this.article)
      })
    },
    formatDate(date) {
      return dayjs(date).format('YYYY-MM-DD HH:mm')
    }
  }
}
</script>

<style lang="scss" scoped>
  .page-post {
    background: #F4F5F6;
    width: 100%;
    display: flex;
    justify-content: space-between;

    main {
      background: #ffffff;
      width: 690px;
      padding: 20px;

      > .title {
        height: 50px;
        display: flex;

        > .avatar {
          width: 50px;
        }

        > .title-info {
          margin-left: 6px;

          .author-name {
            font-size: 16px;
            font-weight: bold;
          }

          .timer {
            margin-top: 5px;
            color: #8590A6;
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
