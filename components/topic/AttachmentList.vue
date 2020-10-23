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
        <span class="download" @click="preview(file.url)">{{ $t('post.preview') }}</span>
        /
        <span class="download" @click="downloadAttachment(file.url)">{{ $t('post.download') }}</span>
      </div>
      <div v-else class="download" @click="downloadAttachment(file.url)">{{ $t('post.download') }}</div>
    </template>
    <div v-else>
      {{ $t('post.paidAfterDownload') }}
    </div>
    <el-dialog
      v-loading="loading"
      :visible.sync="dialogVisible"
      :show-close="false"
      top="5vh"
      width="800px"
      element-loading-background="transparent"
    >
      <div class="dialog-cont"><img :src="previewData.image" class="img"></div>
      <div slot="footer" class="pagination">
        <el-button :class="{'hidden': previewPage === 1}" type="primary" size="medium" @click="prev">{{ $t('post.prev') }}</el-button>
        <div class="pages">{{ previewPage }} / {{ previewTotal }}</div>
        <el-button :class="{'hidden': previewPage >= +previewTotal}" type="primary" size="medium" @click="next">{{ $t('post.next') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import service from '@/api/request'
import handleError from '@/mixin/handleError'
const extensionList = ['7Z', 'AI', 'APK', 'CAD', 'CDR', 'DOC', 'DOCX', 'EPS', 'EXE', 'IPA', 'MP3', 'MP4', 'PDF', 'PPT', 'PSD', 'RAR', 'TXT', 'XLS', 'XLSX', 'ZIP']
const previewList = ['DOC', 'DOCX', 'PDF', 'PPT', 'TXT', 'XLS', 'XLSX'] // 支持预览的文件格式
export default {
  name: 'AttachmentList',
  mixins: [handleError],
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
      dialogVisible: false,
      previewData: {},
      previewUrl: '',
      previewPage: 1,
      previewTotal: 1,
      loading: false
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
      if (this.unpaid) return
      if (process.client) window.open(url, '_self')
    },
    extensionValidate(extension) {
      return extensionList.indexOf(extension.toUpperCase()) > 0 ? extension.toUpperCase() : 'UNKNOWN'
    },
    isPreviewType(extension) {
      return previewList.indexOf(this.extensionValidate(extension)) !== -1
    },
    preview(url) {
      this.previewUrl = url
      this.getPreviewData()
    },
    getPreviewData() {
      this.dialogVisible = true
      this.loading = true
      service({
        url: `${this.previewUrl}&page=${this.previewPage}`,
        method: 'get'
      }).then((res) => {
        this.loading = false
        if (res.status === 200 && res.data && res.data.data && +res.data.data['X-Total-Page'] > 0) {
          this.previewData = res.data.data
          this.previewTotal = res.data.data['X-Total-Page']
        } else {
          this.dialogVisible = false
        }
      }, (e) => {
        this.dialogVisible = false
        this.loading = false
        this.handleError(e)
      })
    },
    prev() {
      this.previewPage -= 1
      this.getPreviewData()
    },
    next() {
      this.previewPage += 1
      this.getPreviewData()
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

    .download {
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
  .pagination{
    display: flex;
    align-items: center;
    justify-content: space-between;
    .hidden{
      visibility: hidden;
    }
    .pages{
      color: $font-color-grey;
    }
  }
  ::v-deep .el-dialog__header{
    padding: 0;
  }
  .dialog-cont{
    overflow-y: auto;
    height: calc(100vh - 10vh - 130px);
    .img{
      max-width: 100%;
    }
  }
</style>
