<template>
  <div v-viewer class="container-upload">
    <div class="upload">
      <span class="attachment-list">{{ $t('post.attachmentList') }}</span>
      <span class="add-attachment" @click="onClick">{{ $t('post.addAttachment') }}</span>
      <input id="upload" :accept="accept" type="file" multiple @input="onInput">
    </div>
    <div v-for="(file, index) in previewFiles" :key="index" :class="{ 'preview-item': true, 'deleted': file.deleted }">
      <div class="container-item">
        <div class="info">
          <svg-icon :type="extensionValidate(file.name)" style="font-size: 18px; vertical-align: middle;" />
          <span :class="{ 'file-name': true, 'uploading': file.progress < 100 }">{{ file.name }}</span>
        </div>
        <span class="size">{{ parseInt(file.size).toLocaleString() }} KB</span>
        <div v-show="file.progress < 100" class="progress" :style="{ width: file.progress + '%' }" />
      </div>
      <div class="remove">
        <svg-icon v-show="file.progress && file.progress === 100" type="delete" class="remove-icon" @click="removeItem(index)" />
      </div>
    </div>
  </div>
</template>

<script>
import handleError from '@/mixin/handleError'
import handleAttachmentError from '@/mixin/handleAttachmentError'
import { extensionList } from '@/constant/extensionList'
import uploader from '@/mixin/uploader'
import service from '@/api/request'

export default {
  name: 'AttachmentUpload',
  mixins: [handleError, handleAttachmentError, uploader],
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
    onUpload: {
      type: Boolean,
      default: false
    },
    type: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      previewFiles: []
    }
  },
  computed: {
    input() {
      return process.client ? document.getElementById('upload') : ''
    },
    service() {
      return service
    }
  },
  methods: {
    extensionValidate(fileName) {
      const extension = fileName.split('.')[fileName.split('.').length - 1]
      return extensionList.indexOf(extension.toUpperCase()) > 0 ? extension.toUpperCase() : 'UNKNOWN'
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/variable/color.scss';

.container-upload {
  margin-top: 20px;

  > .preview-item {
    position: relative;
    margin-top: 5px;
    height: 35px;
    display: flex;
    &.deleted {
      transition: 1s all;
      transform: translateY(-100%);
      opacity: 0;
    }
    > .remove {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 16px;
      margin-left: 16px;
      > .remove-icon {
        cursor: pointer;
        font-size: 16px;
        fill: #6D6D6D;
        &:hover {
          fill: #1878F3;
        }
      }
    }
    > .container-item {
      flex: 1;
      padding: 0 10px;
      border-radius: 3px;
      border: 1px solid #EDEDED;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 100%;
      background: #F4F5F6;
      .info {
        display: flex;
        align-items: center;
        z-index: 10;
        > .file-name {
          z-index: 10;
          margin-left: 8px;
          font-size: 16px;
          color: #333;
          &.uploading {
            color: #8590A6;
          }
        }
      }
      > .size {
        font-size: 12px;
        color: #B7B7B7;
        z-index: 10;
      }
      > .progress {
        position: absolute;
        top: 0;
        left: 0;
        background: rgba(221, 232, 246);
        height: 100%;
      }
    }
  }

  > .upload {
    margin-bottom: 10px;
    span {
      font-size: 14px;
    }
    .attachment-list {
      color: #6D6D6D;
      font-weight: bold;
    }
    .add-attachment {
      cursor: pointer;
      margin-left: 10px;
      color: $color-blue-base;
    }
    > #upload {
      display: none;
    }
  }
}
</style>
