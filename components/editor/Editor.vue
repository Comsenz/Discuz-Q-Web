<template>
  <div class="editor">
    <label v-if="titleShow">
      <input v-model="title" :placeholder="$t('post.pleaseInputPostTitle')" class="input-title" type="text">
    </label>
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
      <div v-if="showUploadImg || showUploadVideo" class="resources-list">
        <el-upload
          v-if="showUploadImg"
          :action="url + '/api/attachments'"
          :headers="header"
          :data="{ type: 1 }"
          multiple
          name="file"
          with-credentials
          accept="image/png, image/jpeg"
          :limit="9"
          :disabled="imageIdList.length >= 9"
          list-type="picture-card"
          class="resources-upload"
          :on-success="(response) => imageIdList.push(response.data.id)"
          :on-preview="handlePictureCardPreview"
          :before-remove="handleRemoveConfirm"
          :on-remove="handlePictureRemove"
          :on-error="() => $message.error('文件上传失败')"
        >
          <i class="el-icon-plus" />
        </el-upload>
        <div v-if="type === 2 && videoList[0]" class="video-upload">
          <video
            class="video"
            :src="videoList[0].url"
            :controls="false"
          />
          <svg-icon type="delete-red" class="icon-delete" style="font-size: 22px" @click="handleVideoRemove" />
          <el-progress v-show="videoPercent < 1" :percentage="videoPercent * 100" color="red" :show-text="false" class="progress" />
        </div>
        <el-upload
          v-if="showUploadVideo"
          v-show="!videoList[0]"
          ref="upload"
          action=""
          list-type="picture-card"
          class="resources-upload"
          :limit="1"
          :disabled="videoList.length > 0"
          :on-change="addVideo"
          :on-error="() => $message.error('文件上传失败')"
        >
          <i class="el-icon-plus" />
        </el-upload>
        <el-dialog :visible.sync="dialogVisible">
          <img width="100%" :src="dialogImageUrl" alt="">
        </el-dialog>
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
              :key="index"
              :type="resource.icon"
              class="svg"
              style="font-size: 20px"
              @click="addResource(resource.toggle)"
            />
          </template>
        </div>
        <div class="block">
          <template v-for="(markdown, index) in markdownList">
            <svg-icon
              :key="index"
              :type="'markdown-' + markdown.icon"
              class="svg"
              style="font-size: 20px"
              @click="editMarkdown(markdown)"
            />
          </template>
        </div>
        <el-button class="button-publish" type="primary" size="small" @click="publish">{{ $t('post.post') }}</el-button>
      </div>
    </div>
    <caller v-if="showCaller" @close="showCaller = false" @selectedCaller="selectActions" />
  </div>
</template>

<script>
import handleError from '@/mixin/handleError'
const TcVod = process.client ? require('vod-js-sdk-v6') : ''

export default {
  name: 'Editor',
  mixins: [handleError],
  props: {
    categoryId: {
      type: String,
      default: ''
    },
    type: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      titleShow: true,
      title: '',
      text: '',
      textLimit: 10000,
      selectionStart: 0,
      selectionEnd: 0,
      dialogImageUrl: '',
      dialogVisible: false,
      showEmoji: false,
      showTopic: false,
      showCaller: false,
      showUploadImg: false,
      showUploadVideo: false,
      imageIdList: [],
      videoList: [],
      videoPercent: 0,
      listenerList: ['emoji-list', 'topic-list'],
      actions: [
        { icon: 'emoji', toggle: 'showEmoji' },
        { icon: 'call', toggle: 'showCaller' },
        { icon: 'topic', toggle: 'showTopic' }
      ],
      resources: [
        { icon: 'picture', toggle: 'showUploadImg' },
        { icon: 'video', toggle: 'showUploadVideo' }
      ],
      markdownList: [
        { icon: 'bold', tip: '粗体文字', code: '**', fn: 'markdownWrap' },
        { icon: 'header', tip: '标题', code: '### ', fn: 'markdownPrefix' },
        { icon: 'italics', tip: '斜体文字', code: '__', fn: 'markdownWrap' },
        { icon: 'quote', tip: '引用', code: '> ', fn: 'markdownPrefix' },
        { icon: 'code', tip: '代码块', code: '`', fn: 'markdownWrap' },
        { icon: 'delete-line', tip: '删除线', code: '~~', fn: 'markdownWrap' },
        { icon: 'link', tip: '链接', code: '[链接名](链接url)', fn: 'markdownUrl' },
        { icon: 'list', tip: '无序列表', code: '*', fn: 'markdownPrefix' },
        { icon: 'order-list', tip: '有序列表', code: '1. ', fn: 'markdownPrefix' }
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
    }
  },
  mounted() {
    this.autoHeight()
    this.emojiListener()
  },
  methods: {
    autoHeight() {
      const textarea = document.getElementById('textarea')
      textarea.onkeyup = function() {
        this.style.height = 'auto'
        this.style.height = this.scrollHeight + 'px'
      }
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
    getSelection() {
      this.selectionStart = document.getElementById('textarea').selectionStart
      this.selectionEnd = document.getElementById('textarea').selectionEnd
    },
    onActions(toggle) { this[toggle] = !this[toggle] },
    addResource(toggle) { this[toggle] = true },
    editMarkdown(markdown) {
      this.getSelection()
      const frontText = this.text.slice(0, this.selectionStart)
      const centerText = this.text.slice(this.selectionStart, this.selectionEnd)
      const behindText = this.text.slice(this.selectionEnd, this.text.length)
      this[markdown.fn](frontText, centerText, behindText, markdown.code, markdown.tip)
    },
    markdownWrap(frontText, centerText, behindText, code, tip) {
      centerText = centerText || tip
      this.text = frontText + code + centerText + code + behindText
    },
    markdownPrefix(frontText, centerText, behindText, code, tip) {
      const content = (centerText + behindText) || tip
      frontText = frontText ? frontText + '\n' : ''
      this.text = frontText + code + content
    },
    markdownUrl(frontText, centerText, behindText, code) {
      this.text = frontText + code + centerText + behindText
    },
    selectActions(code) {
      this.getSelection()
      this.text = this.text.slice(0, this.selectionStart) + code + this.text.slice(this.selectionStart, this.text.length)
      this.showEmoji = false
      this.showTopic = false
      this.showCaller = false
    },
    handleRemoveConfirm() {
      return this.$confirm(this.$t('topic.confirmDelete'), this.$t('discuzq.msgBox.title'), {
        confirmButtonText: this.$t('discuzq.msgBox.confirm'),
        cancelButtonText: this.$t('discuzq.msgBox.cancel'),
        type: 'warning'
      })
    },
    handlePictureRemove(file) {
      const id = file.response.data.id
      const params = { _jv: { type: `/attachments/${id}` }}
      return this.$store.dispatch('jv/delete', params).then(() => {
        const index = this.imageIdList.indexOf(id)
        this.imageIdList.splice(index, 1)
      }, e => this.handleError(e))
    },
    handleVideoRemove() {
      return this.$confirm(this.$t('topic.confirmDelete'), this.$t('discuzq.msgBox.title'), {
        confirmButtonText: this.$t('discuzq.msgBox.confirm'),
        cancelButtonText: this.$t('discuzq.msgBox.cancel'),
        type: 'warning'
      }).then(() => {
        this.$refs.upload.clearFiles()
        setTimeout(() => {
          this.videoList = []
          this.videoPercent = 0
        }, 1000)
      }, () => console.log('取消删除'))
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    getSignature(callBack = null) {
      this.$store.dispatch('jv/get', ['signature', {}]).then(res => {
        callBack(() => res.signature)
      })
    },
    postVideo(fileId) {
      const params = {
        _jv: { type: 'thread/video' },
        file_id: fileId
      }
      this.$store.dispatch('jv/post', params).then(data => {
        this.videoList[0].id = data.file_id
      }, e => this.handleError(e))
    },
    addVideo(file) {
      this.videoList.push({ name: file.name, url: file.url })
      this.getSignature(getSignature => {
        // eslint-disable-next-line new-cap
        new TcVod.default({ getSignature })
          .upload({ mediaFile: file.raw })
          .on('media_progress', info => {
            this.videoPercent = info.percent
          }).done().then(doneResult => {
            this.postVideo(doneResult.fileId)
          })
      })
    },
    publish() {
      if (!this.categoryId) this.$message.warning('请选择分类')
      const params = {
        _jv: {
          type: `/threads`,
          relationships: {
            category: {
              data: { type: 'categories', id: this.categoryId }
            }
          }
        },
        title: this.title,
        content: this.text
      }
      if (this.type === 1 && this.imageIdList.length > 0) {
        params._jv.relationships.attachments = {}
        params._jv.relationships.attachments.data = this.imageIdList.splice(',').map(item => {
          const obj = {}
          obj.id = item
          obj.type = 'attachments'
          return obj
        })
      }
      if (this.type === 2 && this.videoList.length > 0) {
        params.file_id = this.videoList[0].id
        params.file_name = this.videoList[0].name
      }
      params.type = this.type
      return this.$store.dispatch('jv/post', params).then(data => {
        console.log(data, 'data')
      }, e => this.handleError(e))
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
      margin-top: 10px;

      > .resources-list {
        background: #f7f7f7;
        padding: 20px;
        > .video-upload {
          position: relative;
          border: 1px solid $border-color-base;
          border-radius: 5px;
          display: inline-block;
          background: #ffffff;
          > .progress {
            position: absolute;
            top: 80px;
            left: 10px;
            width: 80px;
            height: 2px;
          }
          > .icon-delete {
            cursor: pointer;
            position: absolute;
            top: -11px;
            right: -11px;
          }
          > .video {
            width: 100px;
            height: 100px;
            display: inline-block;
          }
        }

        > .resources-upload {
          ::v-deep.el-upload-list {
            > li {
              width: 100px;
              height: 100px;
            }

            .el-progress-circle {
              height: 50px;
              width: 50px;
            }
          }

          ::v-deep.el-upload {
            width: 100px;
            height: 100px;
            display: inline-flex;
            justify-content: center;
            align-items: center;
          }
        }
      }

      > .actions {
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

      > .tip {
        position: absolute;
        bottom: 50px;
        right: 10px;
        color: #D0D4DC;
      }

      > .emoji-list {
        position: absolute;
        bottom: -205px;
        left: 0;
      }

      > .topic-list {
        position: absolute;
        top: calc(100% + 5px);
        left: 88px;
      }
    }
  }
</style>
