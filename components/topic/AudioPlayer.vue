<template>
  <div class="audio">
    <div v-if="!isPlay" class="control" @click="play">
      <svg-icon type="audio-play" style="font-size: 32px" />
    </div>
    <div v-else class="control" @click="pause">
      <svg-icon type="add" style="font-size: 32px" />
    </div>
    <div class="info">
      <span class="title-audio">{{ file.fileName }}</span>
      <span class="duration-audio">04:47</span>
    </div>
    <div class="size">3.4MB</div>
  </div>
</template>

<script>
export default {
  name: 'AudioPlayer',
  props: {
    file: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      isPlay: false,
      audio: '',
      currentTime: 0
    }
  },
  mounted() {
    console.log(this.file, 'file')
  },
  methods: {
    play() {
      // TODO 清除其他
      if (!this.audio) {
        this.audio = document.createElement('audio')
        this.audio.src = this.file.url
        this.audio.id = 'audio-player'
        this.audio.classList.add('audio-player')
        this.audio.style.display = 'none'
        document.body.appendChild(this.audio)
      }
      this.isPlay = true
      this.audio.play()
    },
    pause() {
      this.audio.pause()
      this.isPlay = false
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/variable/color.scss';
  .audio {
    margin-top: 10px;
    position: relative;
    width: 370px;
    height: 60px;
    border-radius: 3px;
    background: $background-color-grey;
    display: flex;

    > .control {
      cursor: pointer;
      width: 60px;
      border-top-left-radius: 3px;
      border-bottom-left-radius: 3px;
      background: #FA5151;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    > .info {
      margin-left: 10px;
      padding: 10px 0;

      > .title-audio {
        line-height: 20px;
        color: #000000;
        font-size: 14px;
      }

      > .duration-audio {
        margin-top: 5px;
        line-height: 16px;
        color: #B5B5B5;
        font-size: 12px;
      }

      > span {
        display: block;
      }
    }

    > .size {
      right: 10px;
      bottom: 10px;
      color: #B5B5B5;
      font-size: 14px;
      position: absolute;
    }
  }
</style>
