<template>
  <div class="container-upload">
    <div class="preview-images">
      <div v-for="(image, index) in previewImages" :key="index" class="preview-item">
        <img :src="image.url" alt="">
        <el-progress
          v-show="image.progress < 1"
          :percentage="image.progress"
          color="red"
          :show-text="false"
          class="progress"
        />
      </div>
    </div>
    <div class="upload" @click="onClick">
      <input id="upload" :accept="accept" type="file" multiple @input="onInput">
      <svg-icon class="upload-icon" type="add" />
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
    }
  },
  data() {
    return {
      previewImages: [],
      oldLength: 0
    }
  },
  computed: {
    input() {
      return process.client ? document.getElementById('upload') : ''
    }
  },
  methods: {
    // TODO image 验证
    onClick() {
      this.input.dispatchEvent(new MouseEvent('click'))
    },
    onInput(e) {
      const files = e.target.files
      console.log(e, 'event')
      const fileArray = []
      for (let i = 0; i < files.length; i++) {
        // eslint-disable-next-line no-undef
        const url = this.getObjectURL(files[i])
        this.oldLength = this.previewImages.length === 0 ? 0 : this.previewImages.length - 1
        this.previewImages.push({ url, progress: 0 })
        fileArray.push(files[i])
      }
      const promiseList = fileArray.reduce((result, file, index) => {
        result.push(this.uploadFile(file, index))
        return result
      }, [])
      this.uploadFiles(promiseList)
    },
    uploadFile(file, index) {
      console.log(index + this.oldLength, 'index')
      const config = {
        onUploadProgress: progressEvent => {
          this.previewImages[index + this.oldLength].progress = parseInt(Math.round((progressEvent.loaded / progressEvent.total) * 100))
        }
      }
      const formData = new FormData()
      formData.append('type', '1')
      formData.append('file', file)
      return service.post(this.action, formData, config)
    },
    uploadFiles(promiseList) {
      Promise.all(promiseList).then(resList => {
        const files = resList.map(item => item.data.data)
        files.forEach(item => this.fileList.push({ id: item.id, name: item.attributes.fileName, url: item.attributes.url }))
        console.log(this.fileList, 'fileList')
      }, e => console.log(e, 'error'))
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
    > .preview-images {
      > .preview-item {
        position: relative;
        border-radius: 5px;
        border: 1px solid $border-color-base;
        margin-right: 10px;
        margin-bottom: 10px;
        width: 100px;
        height: 100px;
        > img {
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
          height: 2px;
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
