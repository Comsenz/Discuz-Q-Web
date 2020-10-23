module.exports = {
  methods: {
    createAttachmentsData(resource) {
      return resource.map(item => {
        const obj = {}
        obj.id = item.id
        obj.type = 'attachments'
        return obj
      })
    },
    publishPostResource(params, post) {
      const imageData = this.createAttachmentsData(post.imageList)
      const attachedData = this.createAttachmentsData(post.attachedList)
      if (imageData.length > 0 || attachedData.length > 0) {
        params._jv.relationships.attachments = {}
        params._jv.relationships.attachments.data = []
        params._jv.relationships.attachments.data.push(...imageData)
        params._jv.relationships.attachments.data.push(...attachedData)
      }
      return params
    },
    publishThreadResource(params, thread) {
      if (thread.videoList.length > 0) {
        params.file_id = this.post.videoList[0].id
        params.file_name = this.post.videoList[0].name
      }
      return params
    },
    publishPayment(params, payment) {
      // free 免费， paid 全部付费，attachmentPaid 文章免费，附件付费
      params.price = 0
      params.free_words = 0
      params.attachment_price = 0
      if (payment.paidType === 'attachmentPaid') {
        params.attachment_price = payment.attachmentPrice
      } else if (payment.paidType === 'paid') {
        params.price = payment.price
        params.free_words = payment.freeWords
      }
      return params
    },
    publishLocation(params, location) {
      params.location = location.location ? location.location : ''
      params.latitude = location.latitude ? location.latitude : ''
      params.longitude = location.longitude ? location.longitude : ''
      return params
    },
    deleteAttachmentsAfterEdit(oldData, newData) {
      const afterEditImageIds = newData.map(item => item.id)
      const beforeEditImageIds = oldData.map(item => item._jv.id)
      const deleteImageIds = beforeEditImageIds.filter(item => afterEditImageIds.indexOf(item) < 0)
      deleteImageIds.forEach(id => {
        this.$store.dispatch('jv/delete', [`/attachments/${id}`, {}]).catch(() => '')
      })
    }
  }
}
