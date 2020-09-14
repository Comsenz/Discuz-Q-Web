<template>
  <div>
    <el-upload
      :action="url + '/api/attachments'"
      :headers="header"
      :data="{ type: 0 }"
      name="file"
      with-credentials
      :file-list="attachedList"
      :accept="typeLimit"
      :limit="3"
      :disabled="attachedList.length >= 3"
      class="resources-upload"
      :before-upload="checkSize"
      :on-progress="() => $emit('update:onUploadAttached', true)"
      :on-success="handleSuccess"
      :before-remove="handleRemoveConfirm"
      :on-remove="handleAttachedRemove"
    >
      <el-button size="small" type="primary">附件上传</el-button>
    </el-upload>
  </div>
</template>

<script>
import handleError from '@/mixin/handleError'

export default {
  name: 'PictureUpload',
  mixins: [handleError],
  props: {
    attachedList: {
      type: Array,
      default: () => []
    },
    onUploadAttached: {
      type: Boolean,
      default: false
    },
    typeLimit: {
      type: String,
      default: ''
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
      overSize: false
    }
  },
  methods: {
    checkSize(file) {
      const result = file.size < 10485760
      if (!result) {
        this.overSize = true
        this.$message.error(this.$t('profile.filesizecannotexceed') + '10 MB')
      } else this.overSize = false
      return result
    },
    handleRemoveConfirm() {
      if (this.overSize) return
      return this.$confirm(this.$t('topic.confirmDelete'), this.$t('discuzq.msgBox.title'), {
        confirmButtonText: this.$t('discuzq.msgBox.confirm'),
        cancelButtonText: this.$t('discuzq.msgBox.cancel'),
        type: 'warning'
      })
    },
    handleAttachedRemove(file) {
      if (this.overSize) return
      const id = file.id
      const _attachedList = [...this.attachedList]
      const deleteAttached = _attachedList.filter(item => item.id === id)[0]
      const index = _attachedList.indexOf(deleteAttached)
      _attachedList.splice(index, 1)
      this.$emit('attachedChange', { key: 'attachedList', value: _attachedList })
      // TODO delete 请求报错
      return this.$store.dispatch('jv/delete', [`/attachments/${id}`, {}]).catch(() => '')
    },
    handleSuccess(response, file) {
      const _attachedList = [...this.attachedList]
      _attachedList.push({ name: file.name, url: file.url, id: response.data.id })
      this.$emit('attachedChange', { key: 'attachedList', value: _attachedList })
      this.$emit('update:onUploadAttached', false)
    },
    handleError() {
      this.$emit('update:onUploadAttached', false)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
