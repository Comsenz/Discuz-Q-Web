<template>
  <div id="video-pop" class="video-pop">
    <Cover />
    <video id="videoPlayer" class="video-js" controls width="800px" height="600px" preload="auto" data-setup="{}">
      <source :src="url">
      <source :src="url" type="video/webm">
    </video>
  </div>
</template>

<script>
import videoJs from 'video.js';
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
  data() {
    return {
      options: {
        autoplay: true,
        controls: true
      },
      player: null
    };
  },
  mounted() {
    document.addEventListener('click', this.removeVideoPop);
    this.initVideoJs();
  },
  methods: {
    initVideoJs() {
      const self = this;
      this.player = videoJs('videoPlayer', this.options, function onPlayerReady() {
        videoJs.log('Your player is ready!');
        this.play();
        this.on('error', () => {
          this.errorDisplay.close();
          this.createModal(self.$t('core.videoError'));
        });
      });
    },
    removeVideoPop(e) {
      let pass = true;
      const path = e.path || (e.composedPath && e.composedPath());
      path.forEach(item => {
        if (item.id === 'video-pop') pass = false;
        if (item.classList && item.classList.contains('svg-icon-video-play')) pass = false;
      });
      if (!pass) return;
      this.$emit('remove');
      this.player.dispose();
      document.removeEventListener('click', this.removeVideoPop);
    }
  }
};
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
    max-width: 830px;
    max-height: 630px;
  }
</style>
