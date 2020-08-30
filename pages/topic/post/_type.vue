<template>
  <div class="page-post">
    <div class="title">{{ $t('post.postThread') }}</div>
    <div v-loading="categoryList.length === 0" class="category-list">
      <template v-for="(category, index) in categoryList">
        <span
          v-if="category.canCreateThread"
          :key="index"
          :class="{ category: true, selected: categorySelectedId === category._jv.id}"
          @click="selectCategory(category)"
        >{{ category.name }}</span>
      </template>
    </div>
    <editor :category-id="categorySelectedId" :type="type" :is-editor="threadId !== '' && threadId !== undefined" :post="post" />
  </div>
</template>

<script>
const threadInclude = 'firstPost,firstPost.images,firstPost.attachments,category,threadVideo'
import handleError from '@/mixin/handleError'
export default {
  name: 'Post',
  mixins: [handleError],
  data() {
    return {
      categoryList: [],
      post: {},
      categorySelectedId: undefined
    }
  },
  computed: {
    type() {
      return parseInt(this.$route.params.type)
    },
    threadId() {
      return this.$route.query.threadId
    }
  },
  created() {
    this.getCategoryList()
    this.getThread()
  },
  methods: {
    // TODO 未登录
    getCategoryList() {
      this.$store.dispatch('jv/get', ['categories', {}]).then(res => {
        this.categoryList = res
      }, e => this.handleError(e))
    },
    getThread() {
      if (!this.threadId) return
      return this.$store.dispatch('jv/get', [`threads/${this.threadId}`, { params: { include: threadInclude }}]).then(data => {
        if (data.isDeleted) return this.$router.push('/')
        this.categorySelectedId = data.category._jv.id
        this.post = data.firstPost
        this.post.threadId = data._jv.id
        this.post.title = data.title
        this.post.price = data.price
        this.post.freeWords = data.freeWords
        this.post.paid = data.paid
        data.threadVideo ? this.post.videoList = [data.threadVideo] : ''
        // 改 key 的名字，为了 Editor init 数据中可以循环 init
        this.post.attachedList = data.firstPost.attachments
        this.post.imageList = data.firstPost.images
      }, e => this.handleError(e))
    },
    selectCategory(category) {
      this.categorySelectedId = category._jv.id
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/variable/color.scss';
.page-post {
  width: 100%;
  height: 100%;
  margin: 60px 140px 30px 140px;
  > .title {
    font-weight: bold;
    font-size: 26px;
  }
  > .category-list {
    min-height: 25px;
    margin-top: 50px;
    > .category {
      display: inline-block;
      height: 25px;
      line-height: 25px;
      padding: 0 10px;
      border-radius: 12.5px;
      background: #F7F7F7;
      font-size: 14px;
      color: #777777;
      margin-right: 10px;
      margin-bottom: 10px;
      cursor: pointer;
      &.selected {
        color: white;
        background: $color-blue-base;
      }
    }
  }
}
</style>
