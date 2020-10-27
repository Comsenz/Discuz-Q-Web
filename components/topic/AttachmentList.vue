<template>
  <div class="attachment-item" @click.self="downloadAttachment(file.url)">
    <div class="info">
      <div>
        <svg-icon :type="extensionValidate(file.extension)" style="font-size: 18px; vertical-align: middle;" />
        <span class="file-name">{{ file.fileName }}</span>
      </div>
      <span class="size">{{ parseInt(file.fileSize).toLocaleString() }} KB</span>
    </div>
    <div class="action">
      <div v-if="!unpaid">
        <span v-if="canReview" class="download" @click.self="preview(file.url)">{{ $t('post.preview') }}</span>
        <span class="download" @click.self="downloadAttachment(file.url)">{{ $t('post.download') }}</span>
      </div>
      <span v-else>{{ $t('post.paidAfterDownload') }}</span>
    </div>
    <!--TODO 放在外面-->
    <el-dialog v-loading="loading" :visible.sync="dialogVisible" :show-close="false" top="5vh" width="800px" element-loading-background="transparent">
      <div class="dialog-cont"><img :src="previewData.image" alt="" class="img"></div>
      <div slot="footer" class="pagination">
        <el-button :class="{'hidden': previewPage === 1}" type="primary" size="medium" @click="prev">{{ $t('post.prev') }}</el-button>
        <div class="pages">{{ previewPage }} / {{ previewTotal }}</div>
        <el-button :class="{'hidden': parseInt(previewPage)>=parseInt(previewTotal)}" size="medium" type="primary" @click="next">{{ $t('post.next') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import service from '@/api/request'
import handleError from '@/mixin/handleError'
import { extensionList } from '@/constant/extensionList'
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
    },
    canReview() {
      return this.forums && this.forums.qcloud && this.forums.qcloud.qcloud_cos &&
        this.forums.qcloud.qcloud_cos_doc_preview &&
        this.isPreviewType(this.file.extension) &&
        ((parseFloat(this.price) === 0 && parseFloat(this.attachmentPrice) > 0 && this.isPaidAttachment) || parseFloat(this.price) > 0 && this.isPaid) &&
        this.file.isRemote
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
    padding: 8px 10px;
    width: 100%;
    height: 60px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 5px;
    border: 1px solid $border-color-base;
    > .info {
      > .size {
        color: #B7B7B7;
        font-size: 12px;
        margin-left: 25px;
      }

      .file-name {
        max-width: 380px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: inline-block;
        white-space: nowrap;
        vertical-align: middle;
        line-height: 18px;
        margin-left: 5px;
      }
    }

    > .action {
      .download {
        font-size: 14px;
        margin-left: 10px;
        color: #343434;
      }
    }
    &:hover {
      background: #F7FBFF;
      border: 1px solid #E5F2FF;
      .download {
        color: $color-blue-base
      }
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
