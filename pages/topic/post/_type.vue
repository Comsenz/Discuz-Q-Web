<template>
  <div class="page-post">
    <div class="title">{{ $t('post.postThread') }}</div>
    <div v-loading="categoryList.length === 0" class="category-list">
      <template v-for="(category, index) in categoryList">
        <span
          v-if="category.canCreateThread"
          :key="index"
          :class="{ category: true, selected: categorySelectedId === category._jv.id}"
          @click="categorySelectedId = category._jv.id"
        >{{ category.name }}</span>
      </template>
    </div>
    <editor
      :type-information="typeInformation[type]"
      :post.sync="post"
      :payment.sync="payment"
      :on-publish="onPublish"
      :edit-resource-show="editResourceShow"
      @publish="publish"
    />
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
      post: {
        id: '',
        title: '',
        text: '',
        imageList: [],
        videoList: [],
        attachedList: []
      },
      payment: {
        isPaid: false,
        price: 0,
        freeWords: 0
      },
      editResourceShow: {
        showUploadImg: false,
        showUploadVideo: false,
        showUploadAttached: false
      },
      typeInformation: {
        // 0 文字帖 1 帖子 2 视频 3 图片 4 评论
        0: { type: 0, textLimit: 450, showPayment: false, showTitle: false, showImage: false, showVideo: false, showAttached: false, showMarkdown: false },
        1: { type: 1, textLimit: 10000, showPayment: true, showTitle: true, showImage: true, showVideo: false, showAttached: true, showMarkdown: true },
        2: { type: 2, textLimit: 450, showPayment: true, showTitle: false, showImage: false, showVideo: true, showAttached: false, showMarkdown: false },
        3: { type: 3, textLimit: 450, showPayment: true, showTitle: false, showImage: true, showVideo: false, showAttached: false, showMarkdown: false },
        4: { type: 4, textLimit: 450, showPayment: false, showTitle: false, showImage: true, showVideo: false, showAttached: false, showMarkdown: false }
      },
      categorySelectedId: '',
      isEditor: false,
      onPublish: false
    }
  },
  computed: {
    type() {
      return this.$route.params.type
    },
    threadId() {
      return this.$route.query.threadId
    },
    categoryId() {
      return this.$route.query.categoryId
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
        if (this.categoryId) this.categorySelectedId = this.categoryId
      }, e => this.handleError(e))
    },
    getThread() {
      if (!this.threadId) return
      return this.$store.dispatch('jv/get', [`threads/${this.threadId}`, { params: { include: threadInclude }}]).then(data => {
        if (data.isDeleted) return this.$router.push('/')
        this.isEditor = true
        this.categorySelectedId = data.category._jv.id
        this.post.title = data.title
        this.post.text = data.firstPost.content
        this.post.id = data.firstPost._jv.id
        this.payment.price = parseFloat(data.price)
        this.payment.freeWords = parseInt(data.freeWords)
        this.payment.isPaid = parseFloat(data.price) > 0

        if (data.firstPost.images.length > 0) {
          this.editResourceShow.showUploadImg = true
          this.initThreadResource(this.post.imageList, data.firstPost.images)
        }
        if (data.firstPost.attachments.length > 0) {
          this.editResourceShow.showUploadAttached = true
          this.initThreadResource(this.post.attachedList, data.firstPost.attachments)
        }
        if (data.threadVideo && data.threadVideo.length > 0) {
          this.editResourceShow.showUploadVideo = true
          this.initThreadResource(this.post.videoList, data.videoList, 'videoList')
          this.videoList[0].videoPercent = 1
        }
      }, e => this.handleError(e))
    },
    initThreadResource(target, resource, key = '') {
      resource.forEach(item => {
        const attached = {
          name: key === 'videoList' ? item.file_name : item.attachment,
          url: key === 'videoList' ? item.media_url : item.thumbUrl,
          id: item._jv.id
        }
        target.push(attached)
      })
    },
    createAttachmentsData(resource) {
      return resource.map(item => {
        const obj = {}
        obj.id = item.id
        obj.type = 'attachments'
        return obj
      })
    },
    publishPostResource(params) {
      const imageData = this.createAttachmentsData(this.post.imageList)
      const attachedData = this.createAttachmentsData(this.post.attachedList)
      if (imageData.length > 0 || attachedData.length > 0) {
        params._jv.relationships.attachments = {}
        params._jv.relationships.attachments.data = []
        params._jv.relationships.attachments.data.push(...imageData)
        params._jv.relationships.attachments.data.push(...attachedData)
      }
      return params
    },
    publishThreadResource(params) {
      if (this.post.videoList.length > 0) {
        params.file_id = this.videoList[0].id
        params.file_name = this.videoList[0].name
      }
      return params
    },
    checkPublish() {
      // 0 文字帖 1 帖子 2 视频 3 图片 4 评论
      if (!this.categorySelectedId && this.type !== 4) return this.$message.warning(this.$t('post.theClassifyCanNotBeBlank'))
      if (this.type === '0' && !this.post.text) return this.$message.warning(this.$t('post.theContentCanNotBeBlank'))
      if (this.type === '1' && !this.post.text) return this.$message.warning(this.$t('post.theContentCanNotBeBlank'))
      if (this.type === '1' && !this.post.title) return this.$message.warning(this.$t('post.theTitleCanNotBeBlank'))
      if (this.type === '2' && this.post.videoList.length === 0) return this.$message.warning(this.$t('post.videoCannotBeEmpty'))
      if (this.type === '3' && this.post.imageList.length === 0) return this.$message.warning(this.$t('post.imageCannotBeEmpty'))
      if (this.type === '4' && !this.post.text) return this.$message.warning(this.$t('post.theContentCanNotBeBlank'))
      return 'success'
    },
    publish() {
      if (this.checkPublish() !== 'success') return
      this.onPublish = true
      if (this.type === 4) return this.postPublish() // 发布评论
      if (this.isEditor) {
        return Promise.all([this.editThreadPublish(), this.editPostPublish()]).then(dataArray => {
          this.$router.push(`/topic/${dataArray[0]._jv.id}`)
        }, e => handleError(e)).finally(() => {
          this.onPublish = false
        })
      }
      const params = {
        _jv: {
          type: `threads`,
          relationships: {
            category: {
              data: { type: 'categories', id: this.categorySelectedId }
            }
          }
        },
        content: this.post.text
      }
      params.type = this.type
      this.post.title ? params.title = this.post.title : ''
      if (this.payment.isPaid) {
        params.price = this.payment.price
        params.free_words = this.payment.freeWords
      }
      this.publishThreadResource(params)
      this.publishPostResource(params)
      return this.$store.dispatch('jv/post', params).then(data => {
        this.$router.push(`/topic/${data._jv.id}`)
      }, e => this.handleError(e)).finally(() => {
        this.onPublish = false
      })
    },
    postPublish() {
      const postParams = {
        _jv: {
          type: `posts`,
          relationships: {
            thread: { data: { type: 'threads', id: this.threadId }}
          }
        },
        content: this.text
      }
      this.publishPostResource(postParams)
      return this.$store.dispatch('jv/post', postParams).then(() => {
        this.$emit('publish')
      }, e => handleError(e)).finally(() => { this.onPublish = false })
    },
    editPostPublish() {
      // 用于 更新 content image attached
      const postParams = {
        _jv: {
          type: `posts`,
          relationships: {}
        },
        content: this.post.text
      }
      if (this.threadId) postParams._jv.id = this.threadId
      this.publishPostResource(postParams)
      return this.$store.dispatch('jv/patch', [postParams, { url: `/posts/${this.post.id}` }])
    },
    editThreadPublish() {
      // 用于 更新 title video category payment
      const threadParams = {
        _jv: {
          type: `threads`,
          relationships: {
            category: {
              data: { type: 'categories', id: this.categorySelectedId }
            }
          }
        }
      }
      if (this.threadId) threadParams._jv.id = this.threadId
      this.post.title ? threadParams.title = this.post.title : ''
      threadParams.type = this.type
      threadParams.price = this.payment.isPaid ? this.payment.price : 0
      threadParams.free_words = this.payment.isPaid ? this.payment.freeWords : 0
      this.publishThreadResource(threadParams)
      return this.$store.dispatch('jv/patch', [threadParams, { url: `/threads/${this.threadId}` }])
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
