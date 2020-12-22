<template>
  <div v-viewer class="container-upload">
    <template>
      <div
        v-for="(image, index) in previewFiles"
        :key="index"
        :class="{ 'preview-item': true, deleted: image.deleted }"
      >
        <img :src="image.url" alt="">
        <el-progress
          v-show="image.progress < 100"
          :percentage="image.progress"
          color="#25A9F6"
          :show-text="false"
          class="progress"
        />
        <div v-show="image.progress < 100" class="cover">图片上传中...</div>
        <div
          :class="{
            'upload-delete': true,
            'show-delete': image.progress === 100
          }"
          @click="removeItem(index)"
        >
          <svg-icon type="delete" style="font-size: 14px; fill: white" />
        </div>
      </div>
    </template>
    <div
      v-show="previewFiles.length < limit"
      class="upload"
      @click="onClick($event)"
    >
      <input
        id="upload"
        ref="uploadImage"
        :accept="accept"
        type="file"
        multiple
        @input="onInput"
      >
      <svg-icon class="upload-icon" type="add" />
    </div>
  </div>
</template>

<script>
import handleError from '@/mixin/handleError';
import handleAttachmentError from '@/mixin/handleAttachmentError';
import uploader from '@/mixin/uploader';
import service from '@/api/request';

export default {
  name: 'ImageUpload',
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
      previewFiles: [],
      currentInput: ''
    };
  },
  computed: {
    input() {
      return process.client ? document.getElementById('upload') : '';
    },
    service() {
      return service;
    }
  },
  methods: {
    onClick() {
      const currentObj = this.$refs.uploadImage;
      this.currentInput = currentObj;
      this.uploaderFile(currentObj);
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/variable/color.scss";

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
      color: #6d6d6d;
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
      background: rgba(0, 0, 0, 0.3);
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
      color: #1878f3;
    }
  }
}
</style>
