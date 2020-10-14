<template>
  <div v-viewer class="container-upload">
    <template>
      <div v-for="(image, index) in previewImages" :key="index" :class="{ 'preview-item': true, 'deleted': image.deleted }">
        <img :src="image.url" alt="">
        <el-progress v-show="image.progress < 100" :percentage="image.progress" color="#25A9F6" :show-text="false" class="progress" />
        <div v-show="image.progress < 100" class="cover">图片上传中...</div>
        <div :class="{ 'upload-delete': true, 'show-delete': image.progress === 100}" @click="removeItem(index)">
          <svg-icon type="delete" style="font-size: 14px; fill: white" />
        </div>
      </div>
    </template>
    <div v-show="previewImages.length < limit" class="upload" @click="onClick">
      <input id="upload" :accept="accept" type="file" multiple @input="onInput">
      <svg-icon class="upload-icon" type="add" style="fill: #1878F3" />
    </div>
  </div>
</template>

<script>
import handleError from '@/mixin/handleError'
import service from '@/api/request'

export default {
  name: 'Upload',
  mixins: [handleError],
  props: {
    action: {
      type: String,
      default: '',
      required: true
    },
    fileList: {
      type: Array,
      default: () => [],
      required: true
    },
    accept: {
      type: String,
      default: ''
    },
    limit: {
      type: Number,
      default: 9999
    },
    sizeLimit: {
      type: Number,
      default: 99999999999999999
    },
    onUploadImage: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      previewImages: []
    }
  },
  computed: {
    input() {
      return process.client ? document.getElementById('upload') : ''
    }
  },
  watch: {
    fileList: {
      handler() {
        if (this.fileList.length > this.previewImages.length && this.previewImages.length === 0) { // 初始试，回显
          this.previewImages.push(...this.fileList)
          this.previewImages.map(item => { item.progress = 100 }) // 增加 deleted progress 属性
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    onClick() {
      this.input.dispatchEvent(new MouseEvent('click'))
    },
    onInput(e) {
      const files = e.target.files
      const fileArray = []
      if (this.onUploadImage) return this.$message.warning('请等待上传中的图片完成上传')
      if (!this.checkSizeLimit(files)) return // 文件大小检查
      if (!this.checkLengthLimit(files)) return // 文件数量检查
      for (let i = 0; i < files.length; i++) {
        // eslint-disable-next-line no-undef
        const url = this.getObjectURL(files[i])
        this.previewImages.push({ url, progress: 0, deleted: false })
        fileArray.push(files[i])
      }
      const promiseList = fileArray.reduce((result, file, index, array) => {
        result.push(this.uploadFile(file, index, array.length))
        return result
      }, [])
      this.uploadFiles(promiseList)
    },
    uploadFile(file, index, length) {
      const config = {
        onUploadProgress: progressEvent => {
          if (!progressEvent.lengthComputable) { // 当进度不可估量,直接等于 100
            this.previewImages[this.previewImages.length - length + index].progress = 100
            return
          }
          // processEvent 的进度条不准确，先进行到 80%， 等 upload 请求响应后再 100%
          this.previewImages[this.previewImages.length - length + index].progress = parseInt(Math.round((progressEvent.loaded / progressEvent.total) * 100).toString()) * 0.9
        }
      }
      const formData = new FormData()
      formData.append('type', '1')
      formData.append('file', file)
      return service.post(this.action, formData, config)
    },
    uploadFiles(promiseList) {
      this.$emit('update:onUploadImage', true)
      Promise.all(promiseList).then(resList => {
        this.previewImages.map(item => { item.progress = 100 }) // 请求响应后，更新到 100%
        const files = resList.map(item => item.data.data)
        const _fileList = [...this.fileList]
        files.forEach(item => _fileList.push({ id: item.id, name: item.attributes.fileName, url: item.attributes.url }))
        this.input.value = ''
        this.$emit('success', _fileList)
        this.$emit('update:onUploadImage', false)
      }, e => {
        // 失败的时候取消对应的预览照片
        const length = promiseList.length
        this.previewImages.splice(this.previeImages.length - length, length)
        this.$message.error('图片上传失败, 请稍后再试')
        console.log('error => ', e)
      })
    },
    removeItem(index) {
      this.$confirm(this.$t('topic.confirmDelete'), this.$t('discuzq.msgBox.title'), {
        confirmButtonText: this.$t('discuzq.msgBox.confirm'),
        cancelButtonText: this.$t('discuzq.msgBox.cancel'),
        type: 'warning'
      }).then(() => {
        this.previewImages[index].deleted = true // 删除动画
        const _fileList = [...this.fileList]
        _fileList.splice(index, 1)
        this.$emit('remove', _fileList) // 避免和回显冲突，先修改 fileList
        setTimeout(() => {
          this.previewImages.splice(index, 1)
          this.$message.success('删除成功')
        }, 900)
        // return service.delete(this.action + '/' + this.fileList[index].id).then(() => { 不需要从后台删除
        //   console.log('后台删除成功')
        // }, e => this.handleError(e))
      }, () => console.log('取消删除'))
    },
    checkSizeLimit(files) {
      let pass = true
      for (let i = 0; i < files.length; i++) {
        if (files[i].size > this.sizeLimit) pass = false
      }
      if (!pass) this.$message.error(`图片不可大于 ${this.sizeLimit / 1024 / 1024} MB`)
      return pass
    },
    checkLengthLimit(files) {
      if (this.previewImages.length + files.length > this.limit) {
        this.$message.warning(`图片最多上传${this.limit}张`)
        this.$emit('exceed', files)
        return false
      } else {
        return true
      }
    },
    getObjectURL(file) {
      let url = null
      if (window.createObjectURL) { // basic
        url = window.createObjectURL(file)
      } else if (window.URL) { // mozilla(firefox)
        url = window.URL.createObjectURL(file)
      } else if (window.webkitURL) { // webkit or chrome
        url = window.webkitURL.createObjectURL(file)
      }
      return url
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/variable/color.scss';

.container-upload {
  display: flex;
  flex-wrap: wrap;
  max-width: 660px;

  > .preview-item {
    position: relative;
    border-radius: 5px;
    border: 1px solid $border-color-base;
    margin-right: 10px;
    margin-bottom: 10px;
    width: 100px;
    height: 100px;

    &.deleted {
      transition: 1s all;
      transform: translateY(-100%);
      opacity: 0;
    }

    > img {
      cursor: pointer;
      border-radius: 5px;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    > .progress {
      position: absolute;
      top: 80px;
      left: 10px;
      width: 80px;
      height: 1px;
    }

    > .cover {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      color: #6D6D6D;
      background: rgba(255, 255, 255, 0.5);
      font-size: 12px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    > .upload-delete {
      cursor: pointer;
      position: absolute;
      left: 0;
      bottom: 0;
      height: 20px;
      width: 100%;
      display: none;
      justify-content: center;
      align-items: center;
      background: rgba(0, 0,0 ,0.3);
    }

    &:hover {
      .upload-delete.show-delete {
        display: flex;
      }
    }
  }

  > .upload {
    cursor: pointer;
    width: 100px;
    height: 100px;
    border-radius: 5px;
    border: 1px dashed $color-blue-base;
    position: relative;

    > #upload {
      cursor: pointer;
      display: none;
    }

    > .upload-icon {
      font-size: 30px;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
}
</style>
