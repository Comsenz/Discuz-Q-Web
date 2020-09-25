<template>
  <div class="editor">
    <label v-if="typeInformation && typeInformation.showTitle">
      <input
        :placeholder="$t('post.pleaseInputPostTitle')"
        class="input-title"
        type="text"
        :value="post && post.title"
        @input="e => onPostContentChange('title', e.target.value)"
      >
    </label>
    <editor-payment
      v-if="typeInformation && typeInformation.showPayment && canCreateThreadPaid"
      :payment="payment || {}"
      :type="typeInformation && typeInformation.type"
      @paymentChange="e => onPaymentChange(e.key, e.value)"
    />
    <div v-if="typeInformation && typeInformation.showLocation" class="location-picker">
      <div class="location-title">{{ $t('post.location') }}:</div>
      <div class="location-input" @click="getLocation">
        <svg-icon type="location" style="font-size: 17px" />
        <span class="value">{{ location && location.location || $t('post.pleaseSelectLocation') }}</span>
        <span v-show="location.location" class="icon-close" @click.stop="$emit('update:location', { location: '', latitude: '', longitude: '' })">
          <svg-icon type="close" style="font-size: 12px" />
        </span>
      </div>
    </div>
    <div id="vditor" style="margin-top: 20px" />
    <div v-show="false" :class="['container-textarea', editorStyle]">
      <label>
        <textarea
          id="textarea"
          :value="post && post.text"
          :class="['input-text', editorStyle]"
          :placeholder="typeInformation ? typeInformation.placeholder : ''"
          :maxlength="post && post.textLimit"
          @input="e => onPostContentChange('text', e.target.value)"
        />
      </label>
      <div>
        <div v-if="showUploadImg || showUploadVideo || showUploadAttached" class="resources-list">
          <image-upload
            v-if="showUploadImg"
            :url="url"
            :header="header"
            :on-upload-image.sync="onUploadImage"
            :image-list="post && post.imageList"
            @imageChange="e => onPostContentChange(e.key, e.value)"
          />
          <video-upload
            v-if="showUploadVideo"
            :on-upload-video.sync="onUploadVideo"
            :video-list="post && post.videoList"
            @videoChange="e => onPostContentChange(e.key, e.value)"
          />
          <attached-upload
            v-if="showUploadAttached"
            :url="url"
            :header="header"
            :on-upload-attached.sync="onUploadAttached"
            :attached-list="post && post.attachedList"
            @attachedChange="e => onPostContentChange(e.key, e.value)"
          />
        </div>
        <span v-if="typeInformation && typeInformation.textLimit" class="tip">
          {{ typeInformation.textLimit>=(post.text.length || 0) ? $t('post.note', { num: typeInformation.textLimit - (post.text.length || 0) }) : $t('post.exceed', { num: (post.text.length || 0 ) - typeInformation.textLimit }) }}
        </span>
        <div :class="['actions', editorStyle]">
          <div class="block">
            <template v-for="(action, index) in actions">
              <popover v-if="action.show && action.icon === 'emoji'" :key="index" :visible="showEmoji" class="svg" @hidePop="hideActions">
                <template v-slot:pop> <emoji-list @selectEmoji="selectActions" /> </template>
                <template v-slot:activeNode><svg-icon :type="action.icon" style="font-size: 20px" @click="onActions(action.toggle)" /></template>
              </popover>
              <popover v-if="action.show && action.icon === 'topic'" :key="index" :visible="showTopic" class="svg" @hidePop="hideActions">
                <template v-slot:pop> <topic-list @selectedTopic="selectActions" /> </template>
                <template v-slot:activeNode> <svg-icon :type="action.icon" style="font-size: 20px" @click="onActions(action.toggle)" /> </template>
              </popover>
              <svg-icon v-else-if="action.show && action.icon === 'call'" :key="index" :type="action.icon" class="svg" style="font-size: 20px" @click="onActions(action.toggle)" />
            </template>
          </div>
          <div class="block">
            <template v-for="(resource, index) in resources">
              <svg-icon v-if="resource.show" :key="index" :type="resource.icon" class="svg" style="font-size: 20px" @click="addResource(resource.toggle)" />
            </template>
          </div>
          <editor-markdown
            v-if="typeInformation && typeInformation.showMarkdown"
            :selector="selector"
            :text="post && post.text"
            class="block"
            @changeText="text => onPostContentChange('text', text)"
          />
          <el-button class="button-publish" :loading="onPublish" type="primary" size="small" @click="publish">
            {{ $t('post.post') }}
          </el-button>
        </div>
        <caller v-if="showCaller" @close="showCaller = false" @selectedCaller="selectActions" />
      </div>
    </div>
    <get-location v-if="pickingLocation" @close="pickingLocation = false" />
  </div>
</template>

<script>
import handleError from '@/mixin/handleError'
const Vditor = process.client ? require('vditor') : ''

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
    location: {
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
    onPublish: {
      type: Boolean,
      default: false
    },
    editorStyle: {
      type: String,
      default: 'post'
    },
    selector: {
      type: String,
      default: 'editor'
    }
  },
  data() {
    return {
      contentEditor: {},

      selectionStart: 0,
      selectionEnd: 0,
      pickingLocation: false,
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
        { icon: 'video', toggle: 'showUploadVideo', show: false },
        { icon: 'attached', toggle: 'showUploadAttached', show: false }
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
      return ''
    },
    textarea() {
      return process.client ? document.querySelector(`.${this.selector} #textarea`) : ''
    },
    canCreateThreadPaid() {
      const forums = this.$store.state.site.info.attributes
      return forums ? forums.other.can_create_thread_paid : false
    }
  },
  watch: {
    editResourceShow: {
      handler(val) {
        for (const key in val) this[key] = val[key]
      },
      deep: true
    },
    typeInformation: {
      handler(val) {
        this.actions[0].show = val.showEmoji
        this.actions[1].show = val.showCaller
        this.actions[2].show = val.showTopic
        this.resources[0].show = val.showImage
        this.resources[1].show = val.showVideo
        this.resources[2].show = val.showAttached
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
    Vditor && this.initVditor()

    this.autoHeight()
    // this.emojiListener()
  },
  // destroyed() {
  //   this.contentEditor && this.contentEditor.destroy() // TODO 真的能删吗？
  // },
  methods: {
    initVditor() {
      this.contentEditor = new Vditor('vditor', {
        minHeight: 450,
        placeholder: '请输入',
        mode: 'wysiwyg',
        toolbar: ['emoji', 'headings', 'bold', 'italic', 'strike', 'link', 'list', 'ordered-list', 'check', 'outdent', 'indent', 'quote', 'upload', 'line', 'code', 'inline-code', 'table', 'both', 'br', 'undo', 'redo'],
        toolbarConfig: { pin: true },
        cache: { enable: false },
        after: () => {
          // this.contentEditor.setValue('hello, Vditor + Vue!')
        }
      })
    },
    onPostContentChange(key, value) {
      this.$emit(`update:post`, _post)
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
      this.hideActions()
      this.$nextTick(() => { this[toggle] = !this[toggle] })
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
    getLocation() {
      this.pickingLocation = true
      window.addEventListener('message', this.onMessage, false)
    },
    onMessage(event) {
      const loc = event.data
      // 防止其他应用也会向该页面post信息，需判断module是否为'locationPicker'
      if (loc && loc.module === 'locationPicker') {
        const latitude = loc.latlng.lat
        const longitude = loc.latlng.lng
        const location = loc.poiname === '我的位置' ? loc.poiaddress : loc.poiname
        this.pickingLocation = false
        this.$emit('update:location', { latitude, longitude, location })
      }
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
  ::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.3);
    -webkit-border-radius: 100px;
  }

  ::-webkit-scrollbar-thumb:active {
    font-family: inherit;
    background: rgba(0, 0, 0, 0.4);
    -webkit-border-radius: 100px;
  }

  ::-webkit-input-placeholder { /* Chrome/Opera/Safari */
    font-family: inherit;
    font-size: 16px;
    color: #8590A6;
  }

  ::-moz-placeholder { /* Firefox 19+ */
    font-family: inherit;
    font-size: 16px;
    color: #8590A6;
  }

  :-ms-input-placeholder { /* IE 10+ */
    font-family: inherit;
    font-size: 16px;
    color: #8590A6;
  }

  :-moz-placeholder { /* Firefox 18- */
    font-family: inherit;
    font-size: 16px;
    color: #8590A6;
  }

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
        &.chat { min-height: 120px; background: #fff; overflow: auto; }
      }

    }

    > .location-picker {
      margin-top: 10px;
      min-width: 230px;
      display: inline-block;
      color: #6D6D6D;
      font-size: 14px;
      line-height: 20px;
      > .location-input {
        cursor: pointer;
        margin-top: 10px;
        width: 100%;
        height: 35px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 15px;
        border: 1px solid $border-color-base;
        border-radius: 4px;
        background: $background-color-editor;
        > .value {
          white-space: nowrap;
          margin: 0 auto 0 10px;
        }
        > .icon-close {
          margin-left: 10px;
        }
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

    .actions {
      width: 100%;
      height: 45px;
      display: flex;
      padding: 0 10px;
      align-items: center;
      background: #ffffff;
      &.chat { background: $background-color-grey }

      > .block {
        display: flex;
        padding: 0 10px;

        &:first-child {
          border: 0;
        }

        .svg {
          cursor: pointer;
          margin-left: 20px;

          &:first-child {
            margin-left: 0;
          }
        }
      }

      > .button-publish {
        margin-left: auto;
        ::v-deep span {
          font-size: 14px;
        }
      }
    }

    .tip {
      position: absolute;
      bottom: 50px;
      right: 10px;
      color: #D0D4DC;
    }

  }
</style>
