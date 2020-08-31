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
      v-if="typeInformation && typeInformation.showPayment"
      :payment="payment || {}"
      :type="typeInformation && typeInformation.type"
      @paymentChange="e => onPaymentChange(e.key, e.value)"
    />
    <div class="container-textarea">
      <label>
        <textarea
          id="textarea"
          :value="post && post.text"
          class="input-text"
          :placeholder="$t('post.placeholder')"
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
            :type-limit="attachedTypeLimit"
            :on-upload-attached.sync="onUploadAttached"
            :attached-list="post && post.attachedList"
            @attachedChange="e => onPostContentChange(e.key, e.value)"
          />
        </div>
        <span v-if="typeInformation && typeInformation.text" class="tip">
          {{ typeInformation.textLimit>=typeInformation.text.length ? $t('post.note', { num: textLimit - text.length }) : $t('post.exceed', { num: text.length - textLimit }) }}
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
                v-if="action.show"
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
          <editor-markdown
            v-if="typeInformation && typeInformation.showMarkdown"
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
  </div>
</template>

<script>
import handleError from '@/mixin/handleError'
import forums from '@/mixin/forums'

export default {
  name: 'Editor',
  mixins: [forums, handleError],
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
    onPublish: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
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
    this.autoHeight()
    this.emojiListener()
  },
  methods: {
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
      const textarea = document.getElementById('textarea')
      textarea.onkeyup = function() {
        this.style.height = 'auto'
        this.style.height = this.scrollHeight + 'px'
      }
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
      const _text = this.post.text.slice(0, this.selectionStart) + code + this.post.text.slice(this.selectionStart, this.post.text.length)
      this.onPostContentChange('text', _text)
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
