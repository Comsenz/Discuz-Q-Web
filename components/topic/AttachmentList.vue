<template>
  <div class="attachment-item">
    <div class="info" @click="downloadAttachment(file.url)">
      <svg-icon :type="extensionValidate(file.extension)" style="font-size: 18px" />
      <span class="file-name">{{ file.fileName }}</span>
    </div>
    <template v-if="!unpaid">
      <div
        v-if="forums && forums.qcloud && forums.qcloud.qcloud_cos
          && isPreviewType(file.extension)
          && ((parseFloat(price) === 0 && parseFloat(attachmentPrice) > 0 && isPaidAttachment) || parseFloat(price) > 0 && isPaid)
          && file.isRemote"
        class="download"
      >
        {{ $t('post.preview') }}
      </div>
      <div v-else class="download" @click="downloadAttachment(file.url)">{{ $t('post.download') }}</div>
    </template>
  </div>
</template>

<script>
const extensionList = ['7Z', 'AI', 'APK', 'CAD', 'CDR', 'DOC', 'DOCX', 'EPS', 'EXE', 'IPA', 'MP3', 'MP4', 'PDF', 'PPT', 'PSD', 'RAR', 'TXT', 'XLS', 'XLSX', 'ZIP']
const previewList = ['DOC', 'DOCX', 'PDF', 'PPT', 'TXT', 'XLS', 'XLSX'] // 支持预览的文件格式
export default {
  name: 'AttachmentList',
  props: {
    file: {
      type: Object,
      default: () => {}
    },
    isPaid: {
      type: Boolean,
      default: false
    },
    price: {
      type: [Number, String],
      default: 0
    },
    isPaidAttachment: {
      type: Boolean,
      default: false
    },
    attachmentPrice: {
      type: [Number, String],
      default: 0
    }
  },
  data() {
    return {
      previewList: ['DOC', 'DOCX', 'PDF', 'PPT', 'TXT', 'XLS', 'XLSX'] // 支持预览的文件格式
    }
  },
  computed: {
    forums() {
      return this.$store.state.site.info.attributes || {}
    },
    unpaid() {
      return (parseFloat(this.price) > 0 && !this.isPaid) || (parseFloat(this.attachmentPrice) > 0 && !this.isPaidAttachment)
    }
  },
  methods: {
    downloadAttachment(url) {
      if (!this.unpaid) return
      if (process.client) window.open(url, '_self')
    },
    extensionValidate(extension) {
      return extensionList.indexOf(extension.toUpperCase()) > 0 ? extension.toUpperCase() : 'UNKNOWN'
    },
    isPreviewType(extension) {
      return previewList.indexOf(this.extensionValidate(extension)) !== -1
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/variable/color.scss';
  .attachment-item {
    cursor: pointer;
    margin-top: 10px;
    display: flex;
    justify-content: space-between;
    width: 100%;
    height: 40px;
    border-radius: 5px;
    border: 1px solid $border-color-base;
    padding: 0 10px;
    align-items: center;

    &:hover {
      background: #F7FBFF;
      border: 1px solid #E5F2FF;
    }

    > .download {
      color: $color-blue-base
    }

    > span {
      font-size: 16px;
      width: 400px;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-left: 10px;
      white-space: nowrap;
    }

    .file-name {
      max-width: 380px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: inline-block;
      white-space: nowrap;
      vertical-align: middle;
      line-height: 18px;
    }
  }
</style>
