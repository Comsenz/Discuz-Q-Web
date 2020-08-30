<template>
  <div class="editor">
    <label v-if="showTitle">
      <input v-model="title" :placeholder="$t('post.pleaseInputPostTitle')" class="input-title" type="text">
    </label>
    <editor-payment v-if="type !== 0 && type !== 4" :is-paid.sync="isPaid" :free-words.sync="freeWords" :price.sync="price" :type="type" />
    <div class="container-textarea">
      <label>
        <textarea
          id="textarea"
          v-model="text"
          class="input-text"
          :placeholder="$t('post.placeholder')"
          :maxlength="textLimit"
        />
      </label>
      <div>
        <div v-if="showUploadImg || showUploadVideo || showUploadAttached" class="resources-list">
          <image-upload v-if="showUploadImg" :url="url" :header="header" :on-upload-image.sync="onUploadImage" :image-list.sync="imageList" />
          <video-upload v-if="showUploadVideo" :on-upload-video.sync="onUploadVideo" :video-list.sync="videoList" />
          <attached-upload
            v-if="showUploadAttached"
            :url="url"
            :header="header"
            :type-limit="attachedTypeLimit"
            :on-upload-attached.sync="onUploadAttached"
            :attached-list.sync="attachedList"
          />
        </div>
        <span class="tip">
          {{ textLimit>=text.length ? $t('post.note', { num: textLimit - text.length }) : $t('post.exceed', { num: text.length - textLimit }) }}
        </span>
        <div class="emoji-list">
          <emoji-list v-show="showEmoji" @selectEmoji="selectActions" />
        </div>
        <div class="topic-list">
          <topic-list v-show="showTopic" @selectedTopic="selectActions" />
        </div>
        <div class="actions">
          <div class="block">
            <template v-for="(action, index) in actions">
              <svg-icon
                :key="index"
                :type="action.icon"
                class="svg"
                style="font-size: 20px"
                @click="onActions(action.toggle)"
              />
            </template>
          </div>
          <div class="block">
            <template v-for="(resource, index) in resources">
              <svg-icon
                v-if="resource.show"
                :key="index"
                :type="resource.icon"
                class="svg"
                style="font-size: 20px"
                @click="addResource(resource.toggle)"
              />
            </template>
          </div>
          <editor-markdown v-if="showMarkdown" :text="text" class="block" @changeText="changeText" />
          <el-button class="button-publish" :loading="onPublish" type="primary" size="small" @click="publish">{{ $t('post.post') }}
          </el-button>
        </div>
        <caller v-if="showCaller" @close="showCaller = false" @selectedCaller="selectActions" />
      </div>
    </div>
  </div>
</template>

<script>
import handleError from '@/mixin/handleError'
import forums from '@/mixin/forums'
export default {
  name: 'Editor',
  mixins: [forums, handleError],
  props: {
    categoryId: {
      type: String,
      default: ''
    },
    threadId: {
      type: String,
      default: ''
    },
    type: {
      type: Number,
      default: 0
    },
    post: {
      type: Object,
      default: () => {}
    },
    isEditor: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      title: '',
      text: '',
      textLimit: 10000,
      selectionStart: 0,
      selectionEnd: 0,
      // actions
      showTitle: false,
      showEmoji: false,
      showTopic: false,
      showCaller: false,
      showMarkdown: false,
      // resource
      showUploadImg: false,
      showUploadVideo: false,
      showUploadAttached: false,
      onUploadImage: false,
      onUploadVideo: false,
      onUploadAttached: false,
      onPublish: false,
      imageList: [],
      videoList: [],
      attachedList: [],
      // payment
      isPaid: false,
      freeWords: 0,
      price: 0,

      typeShow: {
        // 0 文字帖 1 帖子 2 视频 3 图片 4 评论
        0: { textLimit: 450, showTitle: false, showImage: false, showVideo: false, showAttached: false, showMarkdown: false },
        1: { textLimit: 10000, showTitle: true, showImage: true, showVideo: false, showAttached: true, showMarkdown: true },
        2: { textLimit: 450, showTitle: false, showImage: false, showVideo: true, showAttached: false, showMarkdown: false },
        3: { textLimit: 450, showTitle: false, showImage: true, showVideo: false, showAttached: false, showMarkdown: false },
        4: { textLimit: 450, showTitle: false, showImage: true, showVideo: false, showAttached: false, showMarkdown: false }
      },
      listenerList: ['emoji-list', 'topic-list'],
      actions: [
        { icon: 'emoji', toggle: 'showEmoji' },
        { icon: 'call', toggle: 'showCaller' },
        { icon: 'topic', toggle: 'showTopic' }
      ],
      resources: [
        { icon: 'picture', toggle: 'showUploadImg', show: false },
        { icon: 'video', toggle: 'showUploadVideo', show: false },
        { icon: 'attached', toggle: 'showUploadAttached', show: false }
      ]
    }
  },
  computed: {
    url() {
      // if (process.client) return window.location.origin
      return 'https://dq.comsenz-service.com'
    },
    header() {
      if (process.client) {
        const token = window.localStorage.getItem('access_token')
        return { authorization: `Bearer ${token}` }
      }
      return ''
    },
    attachedTypeLimit() {
      if (this.forums.set_attach) {
        const limitText = this.forums.set_attach.support_file_ext + this.forums.set_attach.support_img_ext
        return limitText.split(',').map(item => '.' + item).join(',')
      }
      return ''
    }
  },
  watch: {
    post: {
      handler() {
        if (this.isEditor) this.initThread()
      },
      deep: true
    }
  },
  mounted() {
    this.initActions()
    this.autoHeight()
    this.emojiListener()
  },
  methods: {
    initThread() {
      this.text = this.post.content
      this.title = this.post.title
      this.price = parseFloat(this.post.price)
      this.freeWords = parseInt(this.post.freeWords)
      this.isPaid = this.post.price > 0
      if (this.post.images.length > 0) {
        this.showUploadImg = true
        this.initThreadResource('imageList')
      }
      if (this.post.attachments.length > 0) {
        this.showUploadAttached = true
        this.initThreadResource('attachedList')
      }
      if (this.post.videoList && this.post.videoList.length > 0) {
        this.showUploadVideo = true
        this.initThreadResource('videoList')
        this.videoList[0].videoPercent = 1
      }
    },
    initThreadResource(key) {
      this.post[key].forEach(item => {
        const attached = {
          name: key === 'videoList' ? item.file_name : item.attachment,
          url: key === 'videoList' ? item.media_url : item.thumbUrl,
          id: item._jv.id
        }
        this[key].push(attached)
      })
    },
    changeText(newText) { this.text = newText },
    autoHeight() {
      const textarea = document.getElementById('textarea')
      textarea.onkeyup = function() {
        this.style.height = 'auto'
        this.style.height = this.scrollHeight + 'px'
      }
    },
    initActions() {
      const typeShow = this.typeShow[this.type]
      this.textLimit = typeShow.textLimit
      this.showTitle = typeShow.showTitle
      this.showMarkdown = typeShow.showMarkdown
      this.resources[0].show = typeShow.showImage
      this.resources[1].show = typeShow.showVideo
      this.resources[2].show = typeShow.showAttached
    },
    getSelection() {
      this.selectionStart = document.getElementById('textarea').selectionStart
      this.selectionEnd = document.getElementById('textarea').selectionEnd
    },
    emojiListener() {
      document.addEventListener('click', e => {
        let pass = true
        e.path.forEach(item => {
          if (item.classList) {
            if (item.classList.contains('emoji-list') || item.classList.contains('topic-list') || item.classList.contains('actions')) pass = false
          }
        })
        if (pass) {
          this.showTopic = false
          this.showEmoji = false
        }
      })
    },
    onActions(toggle) {
      this[toggle] = !this[toggle]
    },
    addResource(toggle) {
      this[toggle] = true
    },
    selectActions(code) {
      this.getSelection()
      this.text = this.text.slice(0, this.selectionStart) + code + this.text.slice(this.selectionStart, this.text.length)
      this.showEmoji = false
      this.showTopic = false
      this.showCaller = false
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
      const imageData = this.createAttachmentsData(this.imageList)
      const attachedData = this.createAttachmentsData(this.attachedList)
      if (imageData.length > 0 || attachedData.length > 0) {
        params._jv.relationships.attachments = {}
        params._jv.relationships.attachments.data = []
        params._jv.relationships.attachments.data.push(...imageData)
        params._jv.relationships.attachments.data.push(...attachedData)
      }
      return params
    },
    publishThreadResource(params) {
      if (this.videoList.length > 0) {
        params.file_id = this.videoList[0].id
        params.file_name = this.videoList[0].name
      }
      return params
    },
    checkPublish() {
      if (!this.categoryId && this.type !== 4) return this.$message.warning(this.$t('post.theClassifyCanNotBeBlank'))
      // 0 文字帖 1 帖子 2 视频 3 图片 4 评论
      if (this.type === 0 && !this.text) return this.$message.warning(this.$t('post.theContentCanNotBeBlank'))

      if (this.type === 1 && !this.text) return this.$message.warning(this.$t('post.theContentCanNotBeBlank'))
      if (this.type === 1 && !this.title) return this.$message.warning(this.$t('post.theTitleCanNotBeBlank'))
      if (this.type === 1 && this.onUploadImage) return this.$message.warning(this.$t('post.pleaseWaitForTheImageUploadToComplete'))
      if (this.type === 1 && this.onUploadAttached) return this.$message.warning(this.$t('post.pleaseWaitForTheAttachedUploadToComplete'))

      if (this.type === 2 && this.onUploadVideo) return this.$message.warning(this.$t('post.pleaseWaitForTheVideoUploadToComplete'))
      if (this.type === 2 && this.videoList.length === 0) return this.$message.warning(this.$t('post.videoCannotBeEmpty'))

      if (this.type === 3 && this.onUploadImage) return this.$message.warning(this.$t('post.pleaseWaitForTheImageUploadToComplete'))
      if (this.type === 3 && this.imageList.length === 0) return this.$message.warning(this.$t('post.imageCannotBeEmpty'))

      if (this.type === 4 && !this.text) return this.$message.warning(this.$t('post.theContentCanNotBeBlank'))
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
              data: { type: 'categories', id: this.categoryId }
            }
          }
        },
        content: this.text
      }
      params.type = this.type
      this.title ? params.title = this.title : ''
      if (this.isPaid) {
        params.price = this.price
        params.free_words = this.freeWords
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
        content: this.text
      }
      if (this.post.threadId) postParams._jv.id = this.post.threadId
      this.publishPostResource(postParams)
      return this.$store.dispatch('jv/patch', [postParams, { url: `/posts/${this.post._jv.id}` }])
    },
    editThreadPublish() {
      // 用于 更新 title video category payment
      const threadParams = {
        _jv: {
          type: `threads`,
          relationships: {
            category: {
              data: { type: 'categories', id: this.categoryId }
            }
          }
        }
      }
      if (this.post.threadId) threadParams._jv.id = this.post.threadId
      this.title ? threadParams.title = this.title : ''
      threadParams.type = this.type
      threadParams.price = this.isPaid ? this.price : 0
      threadParams.free_words = this.isPaid ? this.freeWords : 0
      this.publishThreadResource(threadParams)
      return this.$store.dispatch('jv/patch', [threadParams, { url: `/threads/${this.post.threadId}` }])
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '@/assets/css/variable/color.scss';

  .editor {
    width: 100%;
    margin-top: 20px;

    label {
      width: 100%;

      > input {
        width: 100%;
        background: #f7f7f7;
      }

      > .input-title {
        height: 40px;
        padding: 0 15px;
        border-radius: 3px;
        border: 1px solid $border-color-base;
      }

      > .input-text {
        width: 100%;
        background: #f7f7f7;
        border: none;
        display: block;
        position: relative;
        resize: none;
        line-height: 16px;
        padding: 15px;
        min-height: 200px;
        overflow: hidden;
        transition: all 200ms linear;
      }

    }

    > .container-textarea {
      border: 1px solid $border-color-base;
      border-radius: 3px;
      position: relative;
      margin-top: 30px;
    }

    .resources-list {
      background: #f7f7f7;
      padding: 20px;
    }

    .actions {
      width: 100%;
      height: 45px;
      display: flex;
      padding: 0 10px;
      align-items: center;
      background: #ffffff;

      > .block {
        padding: 0 10px;
        border-left: 1px solid $border-color-base;

        &:first-child {
          border: 0;
        }

        > .svg {
          cursor: pointer;
          margin-left: 20px;

          &:first-child {
            margin-left: 0;
          }
        }
      }

      > .button-publish {
        margin-left: auto;
      }
    }

    .tip {
      position: absolute;
      bottom: 50px;
      right: 10px;
      color: #D0D4DC;
    }

    .emoji-list {
      position: absolute;
      bottom: -205px;
      left: 0;
    }

    .topic-list {
      position: absolute;
      top: calc(100% + 5px);
      left: 80px;
    }
  }
</style>
