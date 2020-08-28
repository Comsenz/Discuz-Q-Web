<template>
  <div>
    <el-upload
      :action="url + '/api/attachments'"
      :headers="header"
      :data="{ type: 1 }"
      multiple
      name="file"
      with-credentials
      accept="image/png, image/jpeg"
      :limit="9"
      :disabled="imageIdList.length >= 9"
      list-type="picture-card"
      class="resources-upload"
      :on-progress="() => $emit('update:onUploadImage', true)"
      :on-success="handleSuccess"
      :on-preview="handlePictureCardPreview"
      :before-remove="handleRemoveConfirm"
      :on-remove="handlePictureRemove"
      :on-error="handleError"
    >
      <i class="el-icon-plus" />
    </el-upload>
    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="dialogImageUrl" alt="">
    </el-dialog>
  </div>
</template>

<script>
import handleError from '@/mixin/handleError'

export default {
  name: 'PictureUpload',
  mixins: [handleError],
  props: {
    imageIdList: {
      type: Array,
      default: () => []
    },
    onUploadImage: {
      type: Boolean,
      default: false
    },
    url: {
      type: String,
      default: ''
    },
    header: {
      type: Object,
      default: () => {
      }
    }
  },
  data() {
    return {
      dialogImageUrl: '',
      dialogVisible: false
    }
  },
  methods: {
    handleRemoveConfirm() {
      return this.$confirm(this.$t('topic.confirmDelete'), this.$t('discuzq.msgBox.title'), {
        confirmButtonText: this.$t('discuzq.msgBox.confirm'),
        cancelButtonText: this.$t('discuzq.msgBox.cancel'),
        type: 'warning'
      })
    },
    handlePictureRemove(file) {
      const id = file.response.data.id
      const params = { _jv: { type: `/attachments/${id}` }}
      return this.$store.dispatch('jv/delete', params).then(() => {
        const _imageIdList = [...this.imageIdList]
        const index = _imageIdList.indexOf(id)
        _imageIdList.splice(index, 1)
        this.$emit('update:imageIdList', _imageIdList)
      }, e => this.handleError(e))
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    handleSuccess(response) {
      const _imageIdList = [...this.imageIdList]
      _imageIdList.push(response.data.id)
      this.$emit('update:imageIdList', _imageIdList)
      this.$emit('update:onUploadImage', false)
    },
    handleError() {
      this.$emit('update:onUploadImage', false)
      this.$message.error('文件上传失败')
    }
  }
}
</script>

<style lang="scss" scoped>
  .resources-upload {
    ::v-deep .el-upload-list {
      > li {
        width: 100px;
        height: 100px;
      }

      .el-progress-circle {
        height: 50px;
        width: 50px;
      }
    }

    ::v-deep .el-upload {
      width: 100px;
      height: 100px;
      display: inline-flex;
      justify-content: center;
      align-items: center;
    }
  }
</style>
