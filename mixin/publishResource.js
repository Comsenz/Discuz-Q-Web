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
      params.price = payment.isPaid ? payment.price : 0
      params.free_words = payment.isPaid ? payment.freeWords : 0
      return params
    },
    publishLocation(params, location) {
      if (location.location && location.latitude && location.longitude) {
        params.location = location.location
        params.latitude = location.latitude
        params.longitude = location.longitude
      }
      return params
    }
  }
}
