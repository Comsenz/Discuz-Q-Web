<template>
  <div v-loading="onUploadImage" element-loading-background="hsla(0,0%,100%,0.6)" class="vditor-container">
    <div class="sticky-box">
      <topic-list v-show="showTopic" class="action-vditor" @selectedTopic="selectActions" />
      <emoji-list v-show="showEmoji" class="action-vditor" @selectEmoji="selectActions" />
    </div>
    <div id="vditor" />
    <span v-if="textLimit" class="tip">{{ textLimit>= textLength ? $t('post.note', { num: textLimit - textLength }) : $t('post.exceed', { num: textLength - typeInformation.textLimit }) }}</span>
    <caller v-if="showCaller" @close="$emit('close')" @selectedCaller="selectActions" />
    <el-button class="button-publish" :loading="onPublish" type="primary" size="small" @click="$emit('publish')">{{ $t('post.post') }}</el-button>
  </div>
</template>

<script>
const Vditor = process.client ? require('vditor') : ''
import { call, emoji, topic, picture } from '@/assets/svg-icons/vditor-icon'
import service from '@/api/request'

export default {
  name: 'Vditor',
  props: {
    showCaller: {
      type: Boolean,
      default: false
    },
    showTopic: {
      type: Boolean,
      default: false
    },
    showEmoji: {
      type: Boolean,
      default: false
    },
    text: {
      type: String,
      default: ''
    },
    textLimit: {
      type: [Number, String],
      default: 450
    },
    textLength: {
      type: [Number, String],
      default: 0
    },
    isEdit: {
      type: Boolean,
      default: false
    },
    attachmentSizeLimit: {
      type: Number,
      default: 999999999999999999999
    },
    imageAccept: {
      type: String,
      default: ''
    },
    onUploadImage: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: ''
    },
    onPublish: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      vditor: {},
      input: {}
    }
  },
  watch: {
    isEdit: {
      handler(isEdit) {
        if (isEdit && this.text && this.vditor) this.vditor.setValue(this.text, false)
      },
      immediate: true
    }
  },
  mounted() {
    Vditor && this.initVditor()
  },
  methods: {
    initVditor() {
      this.vditor = new Vditor('vditor', {
        minHeight: 450,
        placeholder: this.placeholder,
        mode: 'wysiwyg',
        input: (value) => { this.$emit('textChange', value) },
        toolbar: [
          { hotkey: '', name: '@', tipPosition: 'ne', tip: '@ 好友', className: 'right', icon: call, click: () => { this.$emit('onActions', 'showCaller') } },
          { hotkey: '', name: '#', tipPosition: 'ne', tip: '新增话题', className: 'right', icon: topic, click: () => { this.$emit('onActions', 'showTopic') } },
          { hotkey: '', name: 'my-emoji', tipPosition: 'ne', tip: '插入表情', className: 'right', icon: emoji, click: () => { this.$emit('onActions', 'showEmoji') } },
          'headings', 'bold', 'italic', 'strike', 'link', 'list', 'ordered-list', 'check', 'outdent', 'indent', 'quote',
          { hotkey: '', name: 'picture', tipPosition: 'ne', tip: '插入图片', className: 'right', icon: picture, click: () => { this.uploader() } },
          'line', 'code', 'inline-code', 'table', 'both', 'br', 'undo', 'redo'],
        toolbarConfig: { pin: true },
        cache: { enable: false }
      })
    },
    uploader() {
      if (this.onUploadImage) return this.$message.warning('请等待上传中的图片完成上传')
      this.input = document.createElement('input')
      this.input.type = 'file'
      this.input.multiple = true
      this.input.accept = this.imageAccept
      this.input.dispatchEvent(new MouseEvent('click'))
      this.input.oninput = (e) => {
        const files = e.target.files
        const fileArray = []
        // if (this.onUploadImage) return this.$message.warning('请等待上传中的图片完成上传')
        if (!this.checkSizeLimit(files)) return // 文件大小检查
        for (let i = 0; i < files.length; i++) { fileArray.push(files[i]) }
        const promiseList = fileArray.reduce((result, file) => {
          result.push(this.uploadFile(file))
          return result
        }, [])
        this.uploadFiles(promiseList)
      }
    },
    uploadFile(file) {
      const formData = new FormData()
      formData.append('type', 1) // image 1
      formData.append('file', file)
      return service.post('/attachments', formData)
    },
    uploadFiles(promiseList) {
      this.$emit('update:onUploadImage', true)
      Promise.all(promiseList).then(resList => {
        const files = resList.map(item => item.data.data)
        files.forEach(item => { this.vditor.insertValue(`![${item.attributes.fileName}](${item.attributes.url})`) })
        this.input.value = ''
      }, (e) => {
        this.input.value = ''
        if (e && e.message) {
          this.$message.error(`core.${e.message}`)
        } else {
          this.$message.error('图片上传失败，请稍后再试')
        }
      }).finally(() => {
        this.$emit('update:onUploadImage', false)
      })
    },
    selectActions(code) {
      this.vditor.insertValue(code)
      this.$emit('hideActions')
    },
    checkSizeLimit(files) {
      let pass = true
      for (let i = 0; i < files.length; i++) {
        if (files[i].size > this.attachmentSizeLimit) pass = false
      }
      if (!pass) this.$message.error(`图片不可大于 ${this.attachmentSizeLimit / 1024 / 1024} MB`)
      return pass
    }
  }
}
</script>

<style lang="scss" scoped>
.vditor-container {
  position: relative;
  margin-top: 20px;

  > .sticky-box { // 保证 topicList 和 emojiList 的定位正确
    position: sticky;
    background: rgba(0,0,0,0);
    top: 65px;
    z-index: 1000;
    height: 1px;
    > .action-vditor {
      position: absolute;
      top: 38px;
      left: 2px;
    }
  }
  > .tip {
    position: absolute;
    color: #D0D4DC;
    top: 8px;
    z-index: 10;
    right: 10px;
  }
  > .button-publish {
    margin-top: 20px;
  }
  ::v-deep.vditor-toolbar {
    background: #F5F6F7;
    top: 65px;
    padding-left: 10px !important;
    //height: 45px;
    //background: white;
    //padding-left: 14px !important;
    //> .vditor-toolbar__item {
    //  line-height: 45px;
    //  svg {
    //    width: 20px;
    //    height: 20px;
    //  }
    //}
  }
}

</style>
