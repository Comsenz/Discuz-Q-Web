<template>
  <div class="attachment-item" @click="downloadAttachment(file.url)">
    <div>
      <svg-icon :type="extensionValidate(file.extension)" style="font-size: 18px" />
      <span>{{ file.fileName }}</span>
    </div>
    <div class="download">{{ $t('post.download') }}</div>
  </div>
</template>

<script>
const extensionList = ['7Z', 'AI', 'APK', 'CAD', 'CDR', 'DOC', 'DOCX', 'EPS', 'EXE', 'IPA', 'MP3', 'MP4', 'PDF', 'PPT', 'PSD', 'RAR', 'TXT', 'XLS', 'XLSX', 'ZIP']
export default {
  name: 'AttachmentList',
  props: {
    file: {
      type: Object,
      default: () => {}
    }
  },
  methods: {
    downloadAttachment(url) {
      if (process.client) window.open(url, '_self')
    },
    extensionValidate(extension) {
      return extensionList.indexOf(extension.toUpperCase()) > 0 ? extension.toUpperCase() : 'UNKNOWN'
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
  }
</style>
