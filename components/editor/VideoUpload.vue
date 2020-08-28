<template>
  <div>
    <div v-if="videoList[0]" class="video-upload">
      <video
        ref="video"
        class="video"
        :src="videoList[0].url"
        :controls="false"
      />
      <video-pop v-if="showVideoPop" :url="videoList[0].url" @remove="showVideoPop = false" />
      <svg-icon type="video-play" class="icon-play" style="font-size: 30px" @click="showVideoPop = true" />
      <svg-icon type="delete-red" class="icon-delete" style="font-size: 22px" @click="handleVideoRemove" />
      <el-progress
        v-show="videoPercent < 1"
        :percentage="videoPercent * 100"
        color="red"
        :show-text="false"
        class="progress"
      />
    </div>
    <el-upload
      v-show="!videoList[0]"
      ref="upload"
      action=""
      list-type="picture-card"
      class="image-upload"
      accept="video/*"
      :limit="1"
      :disabled="videoList.length > 0"
      :on-change="addVideo"
      :on-error="() => $message.error('文件上传失败')"
    >
      <i class="el-icon-plus" />
    </el-upload>
  </div>
</template>

<script>
const TcVod = process.client ? require('vod-js-sdk-v6') : ''
export default {
  name: 'VideoUpload',
  props: {
    videoList: {
      type: Array,
      default: () => []
    },
    onUploadVideo: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      videoPercent: 0,
      showVideoPop: false
    }
  },
  methods: {
    handleVideoRemove() {
      return this.$confirm(this.$t('topic.confirmDelete'), this.$t('discuzq.msgBox.title'), {
        confirmButtonText: this.$t('discuzq.msgBox.confirm'),
        cancelButtonText: this.$t('discuzq.msgBox.cancel'),
        type: 'warning'
      }).then(() => {
        this.$refs.upload.clearFiles()
        setTimeout(() => {
          this.$emit('update:videoList', [])
          this.videoPercent = 0
        }, 1000)
      }, () => console.log('取消删除'))
    },
    addVideo(file) {
      this.$emit('update:onUploadVideo', true)
      const _videoList = [...this.videoList]
      _videoList.push({ name: file.name, url: file.url })
      this.$emit('update:videoList', _videoList)
      this.getSignature(getSignature => {
        // eslint-disable-next-line new-cap
        new TcVod.default({ getSignature })
          .upload({ mediaFile: file.raw })
          .on('media_progress', info => {
            this.videoPercent = info.percent
          }).done().then(doneResult => {
            this.postVideo(doneResult.fileId)
          })
      })
    },
    getSignature(callBack = null) {
      this.$store.dispatch('jv/get', ['signature', {}]).then(res => {
        callBack(() => res.signature)
      })
    },
    postVideo(fileId) {
      const params = {
        _jv: { type: 'thread/video' },
        file_id: fileId
      }
      this.$store.dispatch('jv/post', params).then(data => {
        const _videoList = [...this.videoList]
        _videoList[0].id = data.file_id
        this.$emit('update:videoList', _videoList)
      }, e => this.handleError(e))
        .finally(() => {
          this.$emit('update:onUploadVideo', false)
        })
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '@/assets/css/variable/color.scss';

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

  .video-upload {
    position: relative;
    border: 1px solid $border-color-base;
    border-radius: 5px;
    display: inline-block;
    background: #ffffff;

    > .progress {
      position: absolute;
      top: 80px;
      left: 10px;
      width: 80px;
      height: 2px;
    }

    > .icon-play {
      cursor: pointer;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    > .icon-delete {
      cursor: pointer;
      position: absolute;
      top: -11px;
      right: -11px;
    }

    > .video {
      cursor: pointer;
      width: 100px;
      height: 100px;
      display: inline-block;
    }
  }
</style>
