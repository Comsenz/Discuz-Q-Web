<template>
  <div>
    <el-upload
      :action="url + '/api/attachments'"
      :headers="header"
      :data="{ type: 1 }"
      name="file"
      with-credentials
      accept="image/*"
      :file-list="imageList"
      :limit="9"
      :disabled="imageList.length > 9"
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
  name: 'ImageUpload',
  mixins: [handleError],
  props: {
    imageList: {
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
      const id = file.id
      const _imageList = [...this.imageList]
      const deleteImage = _imageList.filter(item => item.id === id)[0]
      const index = _imageList.indexOf(deleteImage)
      _imageList.splice(index, 1)
      this.$emit('imageChange', { key: 'imageList', value: _imageList })
      // TODO delete 请求报错
      return this.$store.dispatch('jv/delete', [`/attachments/${id}`, {}]).catch(() => '')
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    handleSuccess(response, file) {
      const _imageList = [...this.imageList]
      _imageList.push({ name: file.name, url: file.url, id: response.data.id })
      this.$emit('imageChange', { key: 'imageList', value: _imageList })
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
      margin-bottom: 8px;
    }
  }
</style>
