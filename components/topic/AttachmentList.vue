<template>
  <div class="attachment-item" @click="downloadAttachment(file.url)">
    <svg-icon :type="extensionValidate(file.extension)" style="font-size: 18px" />
    <span>{{ file.fileName }}</span>
  </div>
</template>

<script>
const extensionList = ['7Z', 'AI', 'APK', 'CAD', 'CDR', 'DOC', 'EPS', 'EXE', 'IPA', 'MP3', 'MP4', 'PDF', 'PPT', 'PSD', 'RAR', 'TXT', 'XLS', 'XLSX', 'ZIP']
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
    width: 100%;
    height: 40px;
    border-radius: 5px;
    border: 1px solid $border-color-base;
    padding: 0 10px;
    display: flex;
    align-items: center;

    &:hover {
      border: 1px solid $color-blue-base;
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
