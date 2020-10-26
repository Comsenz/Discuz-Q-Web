<template>
  <div class="editor">
    <label v-if="typeInformation && typeInformation.showTitle">
      <input :placeholder="$t('post.pleaseInputPostTitle')" class="input-title" type="text" :value="post && post.title" @input="e => onPostContentChange('title', e.target.value)">
    </label>
    <editor-payment v-if="typeInformation && typeInformation.showPayment && canCreateThreadPaid" :payment="payment || {}" :type="typeInformation && typeInformation.type" @paymentChange="e => onPaymentChange(e.key, e.value)" />
    <attachment-upload
      v-if="isPost"
      :file-list="post && post.attachedList"
      :on-upload.sync="onUploadAttached"
      action="/attachments"
      :accept="attachedTypeLimit"
      :limit="99999"
      type="Attached"
      :size-limit="attachedSizeLimit"
      @success="files => onPostContentChange('attachedList', files)"
      @remove="files => onPostContentChange('attachedList', files)"
    />
    <Vditor
      v-if="isPost"
      :text-limit="typeInformation && typeInformation.textLimit"
      :text-length="post && post.text && post.text.length"
      :placeholder="typeInformation && typeInformation.placeholder"
      :image-accept="imageTypeLimit"
      :text="post && post.text"
      :show-caller="showCaller"
      :show-topic="showTopic"
      :show-emoji="showEmoji"
      :is-edit="isEdit"
      :on-publish="onPublish"
      :attachment-size-limit="attachedSizeLimit"
      :on-upload-image.sync="onUploadImage"
      @textChange="value => onPostContentChange('text', value)"
      @close="showCaller = false"
      @hideActions="hideActions"
      @onActions="onActions"
      @publish="publish"
    />
    <!--my editor 除了帖子以外，不使用 vditor-->
    <div v-if="!isPost" :class="['container-textarea', editorStyle]">
      <!--bar-->
      <editor-tool-bar
        v-if="editorStyle === 'post'"
        :text-limit="typeInformation && typeInformation.textLimit"
        :text-length="post && post.text && post.text.length"
        :actions="actions"
        :show-emoji="showEmoji"
        :show-topic="showTopic"
        :show-caller="showCaller"
        :resources="resources"
        :on-publish="onPublish"
        :editor-style="editorStyle"
        @publish="publish"
        @selectActions="selectActions"
        @addResource="addResource"
        @hidePop="hideActions"
        @onActions="onActions"
      />
      <label>
        <textarea id="textarea" :value="post && post.text" :class="['input-text', editorStyle]" :placeholder="typeInformation ? typeInformation.placeholder : ''" :maxlength="post && post.textLimit" @input="e => onPostContentChange('text', e.target.value)" />
      </label>
      <div>
        <!--uploader-->
        <div v-if="showUploadImg || showUploadVideo" class="resources-list">
          <image-upload v-if="showUploadImg" :file-list="post && post.imageList" :on-upload.sync="onUploadImage" action="/attachments" :accept="imageTypeLimit" :limit="9" type="Image" :size-limit="attachedSizeLimit" @success="imageList => onPostContentChange('imageList', imageList)" @remove="imageList => onPostContentChange('imageList', imageList)" />
          <video-upload v-if="showUploadVideo" :on-upload-video.sync="onUploadVideo" :video-list="post && post.videoList" @videoChange="e => onPostContentChange(e.key, e.value)" />
        </div>
        <!--bar-->
        <editor-tool-bar
          v-if="editorStyle !== 'post'"
          :text-limit="typeInformation && typeInformation.textLimit || 450"
          :text-length="post && post.text && post.text.length || 0"
          :actions="actions"
          :show-emoji="showEmoji"
          :show-topic="showTopic"
          :show-caller="showCaller"
          :resources="resources"
          :on-publish="onPublish"
          :editor-style="editorStyle"
          @publish="publish"
          @selectActions="selectActions"
          @addResource="addResource"
          @hidePop="hideActions"
          @onActions="onActions"
        />
      </div>
    </div>
    <caller v-if="showCaller && !isPost" @close="showCaller = false" @selectedCaller="selectActions" />
  </div>
</template>

<script>
import handleError from '@/mixin/handleError'

export default {
  name: 'Editor',
  mixins: [handleError],
  props: {
    post: {
      type: Object,
      default: () => {}
    },
    payment: {
      type: Object,
      default: () => {}
    },
    typeInformation: {
      type: Object,
      default: () => {}
    },
    editResourceShow: {
      type: Object,
      default: () => {}
    },
    isEdit: {
      type: Boolean,
      default: false
    },
    onPublish: {
      type: Boolean,
      default: false
    },
    editorStyle: { // post chat comment reply 代表不同的编辑器风格
      type: String,
      default: 'post'
    },
    selector: { // 当页面出现多个编辑器时，必须传入 selector (对应的 class name) 作为唯一的选择器，保证 textarea 元素选择正确
      type: String,
      default: 'editor'
    }
  },
  data() {
    return {
      input: {},
      vditor: {},
      selectionStart: 0,
      selectionEnd: 0,
      // 是否显示弹窗
      showEmoji: false,
      showCaller: false,
      showTopic: false,
      showUploadImg: false,
      showUploadVideo: false,
      showUploadAttached: false,

      onUploadImage: false,
      onUploadVideo: false,
      onUploadAttached: false,

      listenerList: ['emoji-list', 'topic-list'],
      actions: [
        { icon: 'emoji', toggle: 'showEmoji', show: false },
        { icon: 'call', toggle: 'showCaller', show: false },
        { icon: 'topic', toggle: 'showTopic', show: false }
      ],
      resources: [
        { icon: 'picture', toggle: 'showUploadImg', show: false },
        { icon: 'video', toggle: 'showUploadVideo', show: false }
        // { icon: 'attached', toggle: 'showUploadAttached', show: false }
      ]
    }
  },
  computed: {
    url() {
      return '/api'
    },
    header() {
      if (process.client) {
        const token = window.localStorage.getItem('access_token')
        return { authorization: `Bearer ${token}` }
      }
      return {}
    },
    textarea() {
      return process.client ? document.querySelector(`.${this.selector} #textarea`) : ''
    },
    canCreateThreadPaid() {
      const forums = this.$store.state.site.info.attributes
      if (forums) {
        return forums.other ? forums.other.can_create_thread_paid : false
      } else return false
    },
    forums() {
      return this.$store.state.site.info.attributes || {}
    },
    attachedSizeLimit() {
      if (this.forums.set_attach) {
        return this.forums.set_attach.support_max_size * 1024 * 1024
      }
      return 10485760
    },
    imageTypeLimit() {
      if (this.forums.set_attach) {
        const limitText = this.forums.set_attach.support_img_ext
        return limitText.split(',').map(item => '.' + item).join(',')
      }
      return ''
    },
    attachedTypeLimit() {
      if (this.forums.set_attach) {
        const limitText = this.forums.set_attach.support_file_ext
        return limitText.split(',').map(item => '.' + item).join(',')
      }
      return ''
    },
    isPost() { // 帖子类型 type 1
      return this.typeInformation && this.typeInformation.type === 1 || false
    }
  },
  watch: {
    editResourceShow: {
      handler(val) {
        if (!val) return
        for (const key in val) this[key] = val[key]
      },
      deep: true,
      immediate: true
    },
    typeInformation: {
      handler(val) {
        if (!val) return
        this.actions[0].show = val.showEmoji
        this.actions[1].show = val.showCaller
        this.actions[2].show = val.showTopic
        this.resources[0].show = val.showImage
        this.resources[1].show = val.showVideo
        // this.resources[2].show = val.showAttached
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
    this.textarea && this.autoHeight()
    this.emojiListener()
  },
  methods: {
    onPostContentChange(key, value) {
      const _post = Object.assign({}, this.post)
      _post[key] = value
      this.$emit(`update:post`, _post)
    },
    onPaymentChange(key, value) {
      const _payment = Object.assign({}, this.payment)
      _payment[key] = value
      this.$emit(`update:payment`, _payment)
    },
    autoHeight() {
      if (this.editorStyle === 'chat') return // 聊天框不需要自动高度
      // 编辑评论时需要改变内容才会触发自动高度，这里判断评论字数超过一定数量时给textarea一个初始高度以防高度不变导致内容无法展示
      if (this.post.text.length > 310) this.textarea.style.height = '180px'
      this.textarea.onkeyup = function() {
        // textarea 自动高度，通过 scrollHeight 赋值给 height
        // 当行数减少是 scrollHeight 只增不减，所以需要先把 height = auto
        // 但是会引起页面滚动条往上滚动，因为 textarea 高度瞬间减少了
        // 所以需要记录 oldScroll 重置滚动条
        const oldScroll = document.scrollingElement.scrollTop
        this.style.height = 'auto'
        this.style.height = this.scrollHeight + 'px'
        document.scrollingElement.scrollTop = oldScroll
      }
    },
    getSelection() {
      this.selectionStart = this.textarea.selectionStart
      this.selectionEnd = this.textarea.selectionEnd
    },
    emojiListener() {
      document.addEventListener('click', e => {
        let pass = true
        const path = e.path || (e.composedPath && e.composedPath())
        path.forEach(item => {
          if (item.classList) {
            if (item.classList.contains('emoji-list') || item.classList.contains('topic-list') || item.classList.contains('editor-bar')) pass = false
          }
        })
        if (pass) {
          this.showTopic = false
          this.showEmoji = false
        }
      })
    },
    onActions(toggle) {
      this.hideActions()
      setTimeout(() => { this[toggle] = !this[toggle] })
    },
    addResource(toggle) {
      this[toggle] = true
    },
    selectActions(code) {
      this.getSelection()
      const _text = this.post.text.slice(0, this.selectionStart) + code + this.post.text.slice(this.selectionStart, this.post.text.length)
      this.onPostContentChange('text', _text)
      this.hideActions()
    },
    hideActions() {
      this.showEmoji = false
      this.showTopic = false
      this.showCaller = false
    },
    publish() {
      if (this.onUploadAttached) return this.$message.warning(this.$t('post.pleaseWaitForTheAttachedUploadToComplete'))
      if (this.onUploadImage) return this.$message.warning(this.$t('post.pleaseWaitForTheImageUploadToComplete'))
      if (this.onUploadVideo) return this.$message.warning(this.$t('post.pleaseWaitForTheVideoUploadToComplete'))
      this.$emit('update:onPublish', true)
      this.$emit('publish')
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '@/assets/css/variable/color.scss';

  /* editor placeholder */
  ::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.3); -webkit-border-radius: 100px; }
  ::-webkit-scrollbar-thumb:active { font-family: inherit; background: rgba(0, 0, 0, 0.4); -webkit-border-radius: 100px; }
  ::-webkit-input-placeholder { /* Chrome/Opera/Safari */ font-family: inherit; font-size: 16px; color: #DDD; }
  ::-moz-placeholder { /* Firefox 19+ */ font-family: inherit; font-size: 16px; color: #DDD; }
  :-ms-input-placeholder { /* IE 10+ */ font-family: inherit; font-size: 16px; color: #DDD; }
  :-moz-placeholder { /* Firefox 18- */ font-family: inherit; font-size: 16px; color: #DDD; }

  .editor {
    width: 100%;
    margin-top: 20px;

    label {
      width: 100%;

      > input {
        width: 100%;
        background: $background-color-editor;
      }

      > .input-title {
        height: 40px;
        padding: 0 15px;
        border-radius: 3px;
        border: 1px solid $border-color-base;
      }

      > .input-text {
        font-family: inherit;
        background: $background-color-editor;
        width: 100%;
        border: none;
        display: block;
        position: relative;
        resize: none;
        line-height: 16px;
        padding: 15px 15px 20px;
        overflow: hidden;
        overscroll-behavior: contain;
        transition: all 100ms linear;
        &.post { min-height: 200px; }
        &.comment { min-height: 120px; }
        &.reply { min-height: 80px; }
        &.chat { height: 120px; background: #fff; overflow: auto; }
      }

    }

    > .container-textarea {
      border: 1px solid $border-color-base;
      border-radius: 3px;
      position: relative;
      margin-top: 30px;
      &.reply { margin-top: 0; margin-left: 60px; }
      &.chat { margin-top: 0 }
      &.comment { margin-top: 0 }
    }

    .resources-list {
      background: $background-color-grey;
      padding: 20px 20px 30px;
    }
  }
</style>
