module.exports = {
  watch: {
    fileList: {
      handler() {
        if (this.fileList.length > this.previewFiles.length && this.previewFiles.length === 0) { // 初始试，回显
          this.previewFiles.push(...this.fileList)
          this.previewFiles.map(item => { item.progress = 100 }) // 增加 deleted progress 属性
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    onClick() {
      this.input.dispatchEvent(new MouseEvent('click'))
    },
    onInput(e) {
      const files = e.target.files
      const fileArray = []
      if (this.onUploadImage) return this.$message.warning('请等待上传中的图片完成上传')
      if (!this.checkSizeLimit(files)) return // 文件大小检查
      if (!this.checkLengthLimit(files)) return // 文件数量检查
      for (let i = 0; i < files.length; i++) {
        // eslint-disable-next-line no-undef
        const url = this.getObjectURL(files[i])
        this.previewFiles.push({ name: files[i].name, url, progress: 0, deleted: false, size: files[i].size })
        fileArray.push(files[i])
      }
      const promiseList = fileArray.reduce((result, file, index, array) => {
        result.push(this.uploadFile(file, index, array.length))
        return result
      }, [])
      this.uploadFiles(promiseList)
    },
    uploadFile(file, index, length) {
      const config = {
        onUploadProgress: progressEvent => {
          if (!progressEvent.lengthComputable) { // 当进度不可估量,直接等于 100
            this.previewFiles[this.previewFiles.length - length + index].progress = 100
            return
          }
          // processEvent 的进度条不准确，先进行到 80%， 等 upload 请求响应后再 100%
          this.previewFiles[this.previewFiles.length - length + index].progress = parseInt(Math.round((progressEvent.loaded / progressEvent.total) * 100).toString()) * 0.9
        }
      }
      const formData = new FormData()
      const type = this.type === 'Image' ? 1 : 0
      formData.append('type', type)
      formData.append('file', file)
      return this.service.post(this.action, formData, config)
    },
    uploadFiles(promiseList) {
      this.$emit(`update:onUpload${this.type}`, true)
      Promise.all(promiseList).then(resList => {
        this.previewFiles.map(item => { item.progress = 100 }) // 请求响应后，更新到 100%
        const files = resList.map(item => item.data.data)
        const _fileList = [...this.fileList]
        files.forEach(item => _fileList.push({ id: item.id, name: item.attributes.fileName, url: item.attributes.url }))
        this.input.value = ''
        this.$emit('success', _fileList)
        this.$emit(`update:onUpload${this.type}`, false)
      }, (e) => {
        // 失败的时候取消对应的预览照片
        this.input.value = ''
        const length = promiseList.length
        this.$emit(`update:onUpload${this.type}`, false)
        this.previewFiles.splice(this.previewFiles.length - length, length)
        this.handleError(e).then(() => {})
        // if (e && e.message) {
        //   this.$message.error(`core.${e.message}`)
        // } else {
        //   this.$message.error('图片上传失败，请稍后再试')
        // }
      })
    },
    removeItem(index) {
      this.$confirm(this.$t('topic.confirmDelete'), this.$t('discuzq.msgBox.title'), {
        confirmButtonText: this.$t('discuzq.msgBox.confirm'),
        cancelButtonText: this.$t('discuzq.msgBox.cancel'),
        type: 'warning'
      }).then(() => {
        this.previewFiles[index].deleted = true // 删除动画
        const _fileList = [...this.fileList]
        _fileList.splice(index, 1)
        this.$emit('remove', _fileList) // 避免和回显冲突，先修改 fileList
        setTimeout(() => {
          this.previewFiles.splice(index, 1)
          this.$message.success('删除成功')
        }, 900)
      }, () => console.log('取消删除'))
    },
    checkSizeLimit(files) {
      let pass = true
      for (let i = 0; i < files.length; i++) {
        if (files[i].size > this.sizeLimit) pass = false
      }
      if (!pass) this.$message.error(`图片不可大于 ${this.sizeLimit / 1024 / 1024} MB`)
      return pass
    },
    checkLengthLimit(files) {
      if (this.previewFiles.length + files.length > this.limit) {
        this.$message.warning(`图片最多上传${this.limit}张`)
        this.$emit('exceed', files)
        return false
      } else {
        return true
      }
    },
    getObjectURL(file) {
      let url = null
      if (window.createObjectURL) { // basic
        url = window.createObjectURL(file)
      } else if (window.URL) { // mozilla(firefox)
        url = window.URL.createObjectURL(file)
      } else if (window.webkitURL) { // webkit or chrome
        url = window.webkitURL.createObjectURL(file)
      }
      return url
    }
  }
}
