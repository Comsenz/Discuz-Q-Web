<template>
  <div id="video-pop" class="video-pop">
    <Cover />
    <video
      controls
      controlslist="nodownload"
      disablePictureInPicture
      preload="auto"
      :src="url"
      :poster="coverUrl || ''"
      :playsinline="true"
      auto-pause-if-open-native="true"
      auto-pause-if-navigate="true"
    />
  </div>
</template>

<script>
export default {
  name: 'VideoPop',
  props: {
    url: {
      type: String,
      default: ''
    },
    coverUrl: {
      type: String,
      default: ''
    }
  },
  mounted() {
    document.addEventListener('click', this.removeVideoPop)
  },
  methods: {
    removeVideoPop(e) {
      let pass = true
      const path = e.path || (e.composedPath && e.composedPath())
      path.forEach(item => {
        if (item.id === 'video-pop') pass = false
        if (item.classList && item.classList.contains('svg-icon-video-play')) pass = false
      })
      if (!pass) return
      this.$emit('remove')
      document.removeEventListener('click', this.removeVideoPop)
    }
  }
}
</script>

<style lang="scss" scoped>
  .video-pop {
    z-index: 100;
    background: #ffffff;
    padding: 15px;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-width: 760px;
    max-height: 600px;

    > video {
      max-width: 730px;
      max-height: 570px;
    }
  }
</style>
