<template>
  <div class="audio">
    <div v-if="currentFile && currentAudio.isPlay" class="control" @click="$emit('pause')">
      <svg-icon type="audio-pause" style="font-size: 32px" />
    </div>
    <div v-else class="control" @click="$emit('play', file)">
      <svg-icon type="audio-play" style="font-size: 32px" />
    </div>
    <div class="info">
      <div class="title">
        <span class="title-audio">{{ file.fileName }}</span>
        <span v-if="currentFile && playing" class="duration-audio">
          {{ formatCurrentTime(currentAudio.currentTime) }} / {{ formatDuration(currentAudio.duration) }}
        </span>
        <span v-else class="duration-audio">--:--</span>
      </div>
      <div v-if="currentFile && playing" id="progress" ref="progress" class="progress">
        <div :style="{ width: convertToPercentage() + '%' }" class="progress-item" />
        <div
          id="control-ball"
          :style="{ left: convertToPercentage() + '%' }"
          class="control-ball"
          @mousedown="onmousedown"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AudioPlayer',
  props: {
    file: {
      type: Object,
      default: () => {
      }
    },
    currentAudio: {
      type: Object,
      default: () => {
      }
    }
  },
  data() {
    return {
      onDragging: false,
      delta: 0
    }
  },
  computed: {
    currentFile() {
      return this.currentAudio.id === this.file._jv.id
    },
    playing() {
      return this.currentAudio.currentTime && this.currentAudio.duration
    }
  },
  methods: {
    formatDuration(duration) {
      const minutes = Math.floor(duration / 60)
      const seconds_int = duration - minutes * 60
      let seconds = seconds_int.toString().substr(0, 2)
      if (seconds[1] === '.') seconds = '0' + seconds[0]
      return minutes + ':' + seconds
    },
    formatCurrentTime(currentTime) {
      // const current_hour = parseInt(currentTime / 3600) % 24
      const current_minute = parseInt(currentTime / 60) % 60
      const current_seconds_long = currentTime % 60
      const current_seconds = current_seconds_long.toFixed()
      return (current_minute < 10 ? '0' + current_minute : current_minute) + ':' + (current_seconds < 10 ? '0' + current_seconds : current_seconds)
    },
    convertToPercentage() {
      return (this.currentAudio.currentTime / this.currentAudio.duration) * 100
    },
    onmousedown() {
      window.document.addEventListener('mousemove', this.dragging)
      window.document.addEventListener('mouseup', this.onMouseUp)
    },
    dragging(e) {
      this.delta = e.clientX - this.$refs.progress.getBoundingClientRect().x
      if (this.delta < 0) this.delta = 0
      if (this.delta > 290) this.delta = 290
      // ball.style.left = this.delta + 'px'
      const time = (this.delta / 290) * this.currentAudio.duration
      this.$emit('seeking', time)
    },
    onMouseUp() {
      const time = (this.delta / 290) * this.currentAudio.duration
      this.$emit('seek', time)
      window.document.removeEventListener('mousemove', this.dragging)
      window.document.removeEventListener('mouseup', this.onMouseUp)
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
      width: 100%;
      padding: 13px 10px;

      > .progress {
        margin-top: 12px;
        position: relative;
        background: #EDEDED;
        width: 290px;
        height: 3px;
        > .progress-item {
          background: #1878F3;
          height: 3px;
        }
        > .control-ball {
          cursor: grab;
          background: #1878F3;
          position: absolute;
          width: 13px;
          height: 13px;
          border-radius: 50%;
          top: 50%;
          transform: translate( -5px, -50%);
        }
      }
      > .title {
        width: 100%;
        display: flex;
        justify-content: space-between;
        > .title-audio {
          -moz-user-select:none; /*火狐*/
          -webkit-user-select:none; /*webkit浏览器*/
          -ms-user-select:none; /*IE10*/
          max-width: 235px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          user-select:none;
          line-height: 20px;
          color: #000000;
          font-size: 14px;
        }
        > .duration-audio {
          -moz-user-select:none; /*火狐*/
          -webkit-user-select:none; /*webkit浏览器*/
          -ms-user-select:none; /*IE10*/
          user-select:none;
          margin-top: 2px;
          line-height: 16px;
          color: #B5B5B5;
          font-size: 12px;
        }
      }
    }
  }
</style>
