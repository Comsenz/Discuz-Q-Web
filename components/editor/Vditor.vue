<template>
  <div v-loading="onUploadImage || onUploadAttached" element-loading-background="hsla(0,0%,100%,0.6)" class="vditor-container">
    <div id="vditor" style="margin-top: 20px" />
    <caller v-if="showCaller" @close="showCaller = false" @selectedCaller="selectActions" />
    <topic-list v-show="showTopic" class="action-vditor" @selectedTopic="selectActions" />
    <emoji-list v-show="showEmoji" class="action-vditor" @selectEmoji="selectActions" />
  </div>
</template>

<script>
const Vditor = process.client ? require('vditor') : ''
import { call, emoji, topic, picture, file } from '@/assets/svg-icons/vditor-icon'
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
    attachmentSizeLimit: {
      type: Number,
      default: 999999999999999999999
    },
    attachmentAccept: {
      type: String,
      default: ''
    },
    imageAccept: {
      type: String,
      default: ''
    },
    onUploadImage: {
      type: Boolean,
      default: false
    },
    onUploadAttached: {
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
  mounted() {
    Vditor && this.initVditor()
  },
  methods: {
    initVditor() {
      this.vditor = new Vditor('vditor', {
        minHeight: 450,
        placeholder: '请输入',
        mode: 'wysiwyg',
        blur: (value) => {
          this.$emit('textChange', value)
        },
        toolbar: [
          {
            hotkey: '',
            name: '@',
            tipPosition: 'ne',
            tip: '@ 好友',
            className: 'right',
            icon: call,
            click: () => {
              this.$emit('onActions', 'showCaller')
            }
          },
          {
            hotkey: '',
            name: '#',
            tipPosition: 'ne',
            tip: '新增话题',
            className: 'right',
            icon: topic,
            click: () => {
              this.$emit('onActions', 'showTopic')
            }
          },
          {
            hotkey: '',
            name: 'my-emoji',
            tipPosition: 'ne',
            tip: '插入表情',
            className: 'right',
            icon: emoji,
            click: () => {
              this.$emit('onActions', 'showEmoji')
            }
          },
          'headings', 'bold', 'italic', 'strike', 'link', 'list', 'ordered-list', 'check', 'outdent', 'indent', 'quote',
          {
            hotkey: '',
            name: 'picture',
            tipPosition: 'ne',
            tip: '插入图片',
            className: 'right',
            icon: picture,
            click: () => {
              this.uploader('image')
            }
          },
          {
            hotkey: '',
            name: 'file',
            tipPosition: 'ne',
            tip: '插入文件',
            className: 'right',
            icon: file,
            click: () => {
              this.uploader('attachment')
            }
          },
          'line', 'code', 'inline-code', 'table', 'both', 'br', 'undo', 'redo'],
        toolbarConfig: { pin: true },
        cache: { enable: false },
        after: () => {
          // this.contentEditor.setValue('hello, Vditor + Vue!')
        }
      })
    },
    uploader(type) {
      if (this.onUploadImage) return this.$message.warning('请等待上传中的图片完成上传')
      if (this.onUploadAttached) return this.$message.warning('请等待上传中的文件完成上传')
      this.input = document.createElement('input')
      this.input.type = 'file'
      this.input.multiple = true
      this.input.accept = type === 'image' ? this.imageAccept : this.attachmentAccept
      this.input.dispatchEvent(new MouseEvent('click'))
      this.input.oninput = (e) => {
        const files = e.target.files
        const fileArray = []
        // if (this.onUploadImage) return this.$message.warning('请等待上传中的图片完成上传')
        if (!this.checkSizeLimit(files)) return // 文件大小检查
        for (let i = 0; i < files.length; i++) { fileArray.push(files[i]) }
        const promiseList = fileArray.reduce((result, file) => {
          result.push(this.uploadFile(file, type))
          return result
        }, [])
        this.uploadFiles(promiseList, type)
      }
    },
    uploadFile(file, type) {
      const formData = new FormData()
      formData.append('type', type === 'image' ? 1 : 0) // image 1 attachment 0
      formData.append('file', file)
      return service.post('/attachments', formData)
    },
    uploadFiles(promiseList, type) {
      type === 'image' ? this.$emit('update:onUploadImage', true) : this.$emit('update:onUploadAttached', true)
      Promise.all(promiseList).then(resList => {
        const files = resList.map(item => item.data.data)
        if (type === 'image') {
          files.forEach(item => { this.vditor.insertValue(`![${item.attributes.fileName}](${item.attributes.url})`) })
        } else if (type === 'attachment') {
          files.forEach(item => { this.vditor.insertValue(`[${item.attributes.fileName}](${item.attributes.url})`) })
        }
        this.input.value = ''
      }, (e) => {
        this.input.value = ''
        if (e && e.message) {
          this.$message.error(`core.${e.message}`)
        } else {
          this.$message.error('图片上传失败，请稍后再试')
        }
      }).finally(() => {
        type === 'image' ? this.$emit('update:onUploadImage', false) : this.$emit('update:onUploadAttached', false)
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
  > .action-vditor {
    position: absolute;
    top: 35px;
    left: 2px;
  }
}

</style>
