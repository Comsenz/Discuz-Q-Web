<template>
  <div>
    <el-upload
      :action="url + '/attachments'"
      :headers="header"
      :data="{ type: 0 }"
      name="file"
      with-credentials
      :file-list="attachedList"
      :accept="attachedTypeLimit"
      :limit="3"
      :disabled="attachedList.length > 3"
      class="resources-upload"
      :before-upload="checkSize"
      :on-progress="() => $emit('update:onUploadAttached', true)"
      :on-success="handleSuccess"
      :on-error="handleError"
      :before-remove="handleRemoveConfirm"
      :on-remove="handleAttachedRemove"
    >
      <el-button size="small" type="primary">{{ $t('post.attachmentUpload') }}</el-button>
    </el-upload>
  </div>
</template>

<script>
import handleAttachmentError from '@/mixin/handleAttachmentError.js'
export default {
  name: 'PictureUpload',
  mixins: [handleAttachmentError],
  props: {
    attachedList: {
      type: Array,
      default: () => []
    },
    onUploadAttached: {
      type: Boolean,
      default: false
    },
    url: {
      type: String,
      default: ''
    },
    isEdit: {
      type: Boolean,
      default: false
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
  computed: {
    forums() {
      return this.$store.state.site.info.attributes || {}
    },
    attachedTypeLimit() {
      if (this.forums.set_attach) {
        // const limitText = this.forums.set_attach.support_file_ext + ',' + this.forums.set_attach.support_img_ext
        const limitText = this.forums.set_attach.support_file_ext
        return limitText.split(',').map(item => '.' + item).join(',')
      }
      return ''
    },
    attachedSizeLimit() {
      if (this.forums.set_attach) {
        return this.forums.set_attach.support_max_size * 1024 * 1024
      }
      return 10485760
    }
  },
  watch: {
    attachedList: {
      handler(val) {
        this.handleExceed(val)
      },
      deep: true
    }
  },
  mounted() {
    this.handleExceed(this.attachedList)
  },
  methods: {
    checkSize(file) {
      const result = file.size < this.attachedSizeLimit
      if (!result) {
        this.overSize = true
        this.$message.error(this.$t('profile.filesizecannotexceed') + ` ${this.forums.set_attach.support_max_size} MB`)
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
      // 编辑主题时，图片在延后到发布时删除，发布主题时图片立即删除
      !this.isEdit && this.$store.dispatch('jv/delete', [`/attachments/${id}`, {}]).catch(() => '')
    },
    handleSuccess(response, file) {
      const _attachedList = [...this.attachedList]
      _attachedList.push({ name: file.name, url: file.url, id: response.data.id })
      this.$emit('attachedChange', { key: 'attachedList', value: _attachedList })
      this.$emit('update:onUploadAttached', false)
    },
    handleError(e) {
      this.$emit('update:onUploadAttached', false)
      this.handleAttachmentError(e)
    },
    handleExceed(fileList) {
      // el-upload--text 是附件上传组件的特定样式, 和 图片上传 区分
      const elUpload = document.querySelector('.el-upload.el-upload--text')
      elUpload.style.display = fileList.length >= 3 ? 'none' : 'inline-block'
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
