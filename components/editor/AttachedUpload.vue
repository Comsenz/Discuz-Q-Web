<template>
  <div>
    <el-upload
      :action="url + '/api/attachments'"
      :headers="header"
      :data="{ type: 0 }"
      multiple
      name="file"
      with-credentials
      :accept="typeLimit"
      :limit="3"
      :disabled="attachedIdList.length >= 3"
      class="resources-upload"
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
    attachedIdList: {
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
  methods: {
    // TODO 类型和大小强验证
    handleRemoveConfirm() {
      return this.$confirm(this.$t('topic.confirmDelete'), this.$t('discuzq.msgBox.title'), {
        confirmButtonText: this.$t('discuzq.msgBox.confirm'),
        cancelButtonText: this.$t('discuzq.msgBox.cancel'),
        type: 'warning'
      })
    },
    handleAttachedRemove(file) {
      console.log(123123)
      const id = file.response.data.id
      const params = { _jv: { type: `/attachments/${id}` }}
      return this.$store.dispatch('jv/delete', params).then(() => {
        const _attachedIdList = [...this.attachedIdList]
        const index = _attachedIdList.indexOf(id)
        _attachedIdList.splice(index, 1)
        this.$emit('update:attachedIdList', _attachedIdList)
      }, e => this.handleError(e))
    },
    handleSuccess(response) {
      const _attachedIdList = [...this.attachedIdList]
      _attachedIdList.push(response.data.id)
      console.log(_attachedIdList)
      this.$emit('update:attachedIdList', _attachedIdList)
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
