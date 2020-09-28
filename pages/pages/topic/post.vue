<template>
  <div class="page-post">
    <div v-if="type" class="title">{{ $t(`post.${typeInformation[type].headerText}`) }}</div>
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
      :location.sync="location"
      :payment.sync="payment"
      :on-publish="onPublish"
      :edit-resource-show="editResourceShow"
      @publish="publish"
    />
  </div>
</template>

<script>
const threadInclude = 'firstPost,firstPost.images,firstPost.attachments,category,threadVideo'
import publishResource from '@/mixin/publishResource'
import handleError from '@/mixin/handleError'
import isLogin from '@/mixin/isLogin'
import tencentCaptcha from '@/mixin/tencentCaptcha'

export default {
  name: 'Post',
  mixins: [tencentCaptcha, handleError, publishResource, isLogin],
  validate({ query }) {
    return parseFloat(query.type) < 4
  },
  data() {
    return {
      categoryList: [],
      post: { id: '', title: '', text: '', imageList: [], videoList: [], attachedList: [] },
      payment: { isPaid: false, price: 0, freeWords: 0 },
      location: { latitude: '', location: '', longitude: '' },
      editResourceShow: { showUploadImg: false, showUploadVideo: false, showUploadAttached: false },
      typeInformation: {
        // 0 文字帖 1 帖子 2 视频 3 图片 4 评论
        0: { type: 0, headerText: 'postText', textLimit: 450, showPayment: false, showLocation: false, showTitle: false, showImage: false, showVideo: false,
          showAttached: false, showMarkdown: false, showEmoji: true, showTopic: true, showCaller: true, placeholder: '请输入您要发表的内容 ...' },

        1: { type: 1, headerText: 'postPost', textLimit: 10000, showPayment: true, showLocation: false, showTitle: true, showImage: true, showVideo: false,
          showAttached: true, showMarkdown: true, showEmoji: true, showTopic: true, showCaller: true, placeholder: '请输入您要发表的内容 ...' },

        2: { type: 2, headerText: 'postVideo', textLimit: 450, showPayment: true, showLocation: false, showTitle: false, showImage: false, showVideo: true,
          showAttached: false, showMarkdown: false, showEmoji: true, showTopic: true, showCaller: true, placeholder: '请输入您要发表的内容 ...' },

        3: { type: 3, headerText: 'postImage', textLimit: 450, showPayment: true, showLocation: false, showTitle: false, showImage: true, showVideo: false,
          showAttached: false, showMarkdown: false, showEmoji: true, showTopic: true, showCaller: true, placeholder: '请输入您要发表的内容 ...' }
      },
      categorySelectedId: '',
      isEditor: false,
      onPublish: false
    }
  },
  computed: {
    type() {
      return this.$route.query.type
    },
    threadId() {
      return this.$route.query.threadId
    },
    categoryId() {
      return this.$route.query.categoryId
    },
    forums() {
      return this.$store.state.site.info.attributes || {}
    },
    textarea() {
      return process.client ? document.querySelector(`#textarea`) : ''
    }
  },
  mounted() {
    if (['0', '1', '2', '3'].indexOf(this.type) < 0) return this.$router.push('/error')
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
        this.initData(data)
        this.$nextTick(() => { this.textarea.style.height = this.textarea.scrollHeight + 'px' }) // TODO 重置textarea 待优

        if (data.firstPost.images.length > 0) {
          this.editResourceShow.showUploadImg = true
          this.initThreadResource(this.post.imageList, data.firstPost.images)
        }
        if (data.firstPost.attachments.length > 0) {
          this.editResourceShow.showUploadAttached = true
          this.initThreadResource(this.post.attachedList, data.firstPost.attachments)
        }
        if (data.threadVideo && Object.keys(data.threadVideo).length > 0) {
          this.editResourceShow.showUploadVideo = true
          this.initThreadResource(this.post.videoList, [data.threadVideo], 'videoList')
          this.post.videoList[0].videoPercent = 1
        }
      }, e => this.handleError(e))
    },
    initData(data) {
      this.categorySelectedId = data.category._jv.id
      this.post.title = data.title
      this.post.text = data.firstPost.content
      this.post.id = data.firstPost._jv.id
      this.payment.price = parseFloat(data.price)
      this.payment.freeWords = parseInt(data.freeWords)
      this.payment.isPaid = parseFloat(data.price) > 0
      this.location.location = data.location
      this.location.latitude = data.latitude
      this.location.longitude = data.longitude
    },
    initThreadResource(target, resource, key = '') {
      resource.forEach(item => {
        const attached = {
          name: key === 'videoList' ? item.file_name : item.fileName,
          url: key === 'videoList' ? item.media_url : item.thumbUrl,
          id: key === 'videoList' ? item.file_id : item._jv.id
        }
        target.push(attached)
      })
    },
    checkPublish() {
      if (!this.isLogin()) return
      // 0 文字帖 1 帖子 2 视频 3 图片
      if (!this.categorySelectedId) return this.$message.warning(this.$t('post.theClassifyCanNotBeBlank'))
      if (this.post.text.length > this.typeInformation[this.type].textLimit) return this.$message.warning(this.$t('post.messageLengthCannotOver'))
      if (this.type === '0' && !this.post.text) return this.$message.warning(this.$t('post.theContentCanNotBeBlank'))
      if (this.type === '1' && !this.post.text) return this.$message.warning(this.$t('post.theContentCanNotBeBlank'))
      if (this.type === '1' && !this.post.title) return this.$message.warning(this.$t('post.theTitleCanNotBeBlank'))
      if (this.type === '2' && this.post.videoList.length === 0) return this.$message.warning(this.$t('post.videoCannotBeEmpty'))
      if (this.type === '3' && this.post.imageList.length === 0) return this.$message.warning(this.$t('post.imageCannotBeEmpty'))
      if (this.type === '4' && !this.post.text) return this.$message.warning(this.$t('post.theContentCanNotBeBlank'))
      return 'success'
    },
    async publish() {
      if (this.checkPublish() !== 'success') return
      this.onPublish = true
      if (this.isEditor) {
        return Promise.all([this.editThreadPublish(), this.editPostPublish()]).then(dataArray => {
          this.$router.push(`/pages/topic/index?id=${dataArray[0]._jv.id}`)
        }, e => this.handleError(e)).finally(() => {
          this.onPublish = false
        })
      }
      let params = {
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
      this.post.title ? params.title = this.post.title : ''
      params.type = this.type
      params = this.publishPayment(params, this.payment)
      params = this.publishLocation(params, this.location)
      params = this.publishThreadResource(params, this.post)
      params = this.publishPostResource(params, this.post)
      if (this.forums.other.create_thread_with_captcha) {
        try {
          params = await this.checkCaptcha(params)
        } catch (e) {
          this.onPublish = false
          return
        }
      }
      return this.$store.dispatch('jv/post', params).then(data => {
        this.$router.push(`/pages/topic/index?id=${data._jv.id}`)
      }, e => this.handleError(e)).finally(() => {
        this.onPublish = false
      })
    },
    editPostPublish() {
      // 用于 更新 content image attached
      let postParams = {
        _jv: {
          type: `posts`,
          relationships: {}
        },
        content: this.post.text
      }
      if (this.threadId) postParams._jv.id = this.threadId
      postParams = this.publishPostResource(postParams, this.post)
      return this.$store.dispatch('jv/patch', [postParams, { url: `/posts/${this.post.id}` }])
    },
    async editThreadPublish() {
      // 用于 更新 title video category payment
      let threadParams = {
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
      threadParams = this.publishPayment(threadParams, this.payment)
      threadParams = this.publishLocation(threadParams, this.location)
      threadParams = this.publishThreadResource(threadParams, this.post)
      if (this.forums.other.create_thread_with_captcha) {
        try {
          threadParams = await this.checkCaptcha(threadParams)
        } catch (e) {
          this.onPublish = false
          return
        }
      }
      return this.$store.dispatch('jv/patch', [threadParams, { url: `/threads/${this.threadId}` }])
    }
  },
  head() {
    return { title: '发布' }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/variable/color.scss';
.page-post {
  min-width: 700px;
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
      background: $background-color-grey;
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
