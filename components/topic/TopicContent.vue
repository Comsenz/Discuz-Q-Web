<template>
  <article class="global">
    <div class="title">{{ title }}</div>
    <viewer :trigger="$xss(formatTopicHTML(article.contentHtml || ''))" :options="options">
      <div class="content-html" v-html="$xss(formatTopicHTML(article.contentHtml || ''))" />
    </viewer>
    <div v-if="video.cover_url" class="container-video-img-cover">
      <div class="warp-video-img-cover">
        <img class="video-img-cover" :src="video.cover_url" :alt="video.file_name" @click.stop="openVideo">
        <svg-icon type="video-play" class="icon-play" style="font-size: 50px" @click="openVideo" />
      </div>
    </div>
    <!--帖子只展示图文混排的图片-->
    <div v-if="article.images && article.images.length > 0 && threadType !== 1" v-viewer="{url: 'data-source'}" class="images" @click="unpaid ? openVideo() : ''">
      <el-image v-for="(image, index) in article.images" :key="index" class="image" :data-source="unpaid ? '' : image.url" :src="image.thumbUrl" :alt="image.filename" fit="cover">
        <div slot="placeholder" class="image-slot">
          <i class="el-icon-loading" />
        </div>
      </el-image>
    </div>
    <div v-if="(article.attachments || []).length > 0" class="container-attachment">
      <h3 class="name">{{ $t('topic.attachment') }}</h3>
      <div>
        <template v-for="(file, index) in article.attachments">
          <attachment-list
            :key="index"
            :file="file"
            :price="paidInformation.price"
            :is-paid="paidInformation.paid"
            :is-paid-attachment="paidInformation.isPaidAttachment"
            :attachment-price="paidInformation.attachmentPrice"
          />
        </template>
      </div>
    </div>
    <div v-if="unpaid && threadType === 1" class="hide-content-tip">{{ $t('pay.contentHide') }}</div>
    <nuxt-link v-if="category.name" :to="{path: '/', query: { categoryId: category._jv.id } }" class="tag">{{ category.name }}</nuxt-link>
    <div v-if="location && location.location">
      <nuxt-link :to="`/topic/position?longitude=${location.longitude}&latitude=${location.latitude}`" class="location">
        <span class="flex">
          <svg-icon type="location" class="icon" />
          <span> {{ location.location }} </span>
        </span>
      </nuxt-link>
    </div>
    <div v-if="threadType === 6" class="product">
      <product-item :item="article && article.postGoods" />
    </div>
    <div v-if="threadType === 4" class="audio">
      <template v-for="(file, index) in [...audio]">
        <audio-player :key="index" :file="file" :current-audio="currentAudio" @play="play" @pause="pause" @seek="seek" @seeking="seeking" />
      </template>
    </div>
    <video-pop v-if="showVideoPop" :cover-url="video.cover_url" :url="video.media_url" @remove="showVideoPop = false" />
    <audio id="audio-player" :src="currentAudio.url" style="display: none" />
  </article>
</template>

<script>
import s9e from '@/utils/s9e'
import isLogin from '@/mixin/isLogin'
import 'viewerjs/dist/viewer.css'
import Viewer from 'v-viewer/src/component.vue'

export default {
  name: 'TopicContent',
  components: { Viewer },
  mixins: [isLogin],
  props: {
    article: {
      type: Object,
      default: () => {
      }
    },
    title: {
      type: String,
      default: () => ''
    },
    video: {
      type: Object,
      default: () => {}
    },
    audio: {
      type: Object,
      default: () => {}
    },
    paidInformation: {
      type: Object,
      default: () => {}
    },
    threadType: {
      type: Number,
      default: 0
    },
    category: {
      type: Object,
      default: () => {}
    },
    location: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      showVideoPop: false,
      options: {
        filter(image) {
          return [...image.classList].indexOf('qq-emotion') < 0
        }
      },
      currentAudio: {
        id: '',
        url: '',
        currentTime: '',
        duration: '',
        audio: '',
        seeking: false,
        isPlay: false,
        isLoading: false
      }
    }
  },
  computed: {
    unpaid() {
      if (process.client && this.paidInformation.paid) this.removeTextHideCover()
      return !(this.paidInformation.paid || parseFloat(this.paidInformation.price) === 0)
    }
  },
  watch: {
    article: {
      handler() {
        this.addTextHideCover()
      },
      deep: true
    }
  },
  mounted() {
    this.currentAudio.audio = document.getElementById('audio-player')
  },
  methods: {
    formatTopicHTML(html) {
      return s9e.parse(html)
    },
    addTextHideCover() {
      if (this.threadType !== 1) return
      if (!this.unpaid) return
      const contentHtml = document.querySelector('.content-html')
      if (parseInt(contentHtml.offsetHeight) > 100) contentHtml.classList.add('hide-cover')
    },
    removeTextHideCover() {
      const contentHtml = document.querySelector('.content-html')
      if (contentHtml) contentHtml.classList.remove('hide-cover')
    },
    openVideo() {
      if (!this.isLogin()) return
      if (this.unpaid) return this.$emit('payForThread')
      this.showVideoPop = true
    },
    play(file) {
      if (!this.isLogin()) return
      if (this.unpaid) return this.$emit('payForThread')
      if (this.currentAudio.id !== file._jv.id) {
        this.resetAudio(this.currentAudio.audio)
        this.currentAudio.url = file.media_url
        this.currentAudio.id = file._jv.id
        this.currentAudio.audio.src = this.currentAudio.url
        this.currentAudio.isLoading = true
        this.currentAudio.audio.load()
      }
      window.setTimeout(() => {
        this.currentAudio.audio.play()
        this.currentAudio.isPlay = true
        this.currentAudio.audio.addEventListener('timeupdate', this.onProgressing)
        this.currentAudio.audio.addEventListener('ended', this.onEnded)
      }, 0)
    },
    onProgressing() {
      if (this.currentAudio.seeking) return
      this.currentAudio.isLoading = false
      this.currentAudio.duration = this.currentAudio.audio.duration
      this.currentAudio.currentTime = this.currentAudio.audio.currentTime
    },
    onEnded() {
      this.resetAudio(this.currentAudio.audio)
    },
    resetAudio(audio) {
      audio.removeEventListener('timeupdate', this.onProgressing)
      audio.removeEventListener('ended', this.onEnded)
      this.currentAudio.isPlay = false
      this.currentAudio.duration = ''
      this.currentAudio.currentTime = ''
    },
    pause() {
      this.currentAudio.isLoading = false
      this.currentAudio.isPlay = false
      this.currentAudio.audio.pause()
    },
    seek(time) {
      this.currentAudio.seeking = false
      this.currentAudio.currentTime = time
      this.currentAudio.audio.currentTime = time
    },
    seeking(time) {
      this.currentAudio.seeking = true
      this.currentAudio.currentTime = time
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '@/assets/css/variable/color.scss';

  article {
    margin-top: 20px;

    > .title {
      font-weight: bold;
      font-size: 20px;
      word-break: break-all;
      max-width: 650px;
    }

    .content-html {
      max-width: 650px;
      margin-top: 22px;
      /*font-size: 16px;*/
      /*word-break: break-all;*/

      &.hide-cover {
        position: relative;

        &:after {
          position: absolute;
          display: block;
          left: 0;
          bottom: 0;
          content: '';
          width: 100%;
          height: 100px;
          background: linear-gradient(rgba(255, 255, 255, 0), rgba(255, 255, 255, 1));
        }
      }
    }

    @media screen and ( max-width: 1005px ) {
      .title {
        font-size: 18px;
      }
    }

    > .images {
      cursor: pointer;
      margin-top: 30px;
      width: 660px;
      > .image {
        width: 200px;
        height: 200px;
        border-radius: 5px;
        margin-right: 20px;
        margin-bottom: 20px;
        > .image-slot{
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100%;
          background: #f5f7fa;
          color: #909399;
          font-size: 22px;
        }
      }
    }

    @media screen and ( max-width: 1005px ) {
      > .images {
        max-width: 470px;
        width: 100%;
        > .image {
          width: 150px;
          height: 150px;
          border-radius: 5px;
          margin-right: 5px;
          margin-bottom: 5px
        }
      }
    }

    > .container-audio {

    }

    > .container-attachment {
      margin-top: 30px;
      > .name {
        color: #6D6D6D;
        font-weight: bold;
        font-size: 16px;
      }
    }

    > .container-video-img-cover {
      margin-top: 30px;
      > .warp-video-img-cover {
        cursor: pointer;
        position: relative;
        display: inline-block;
        > .video-img-cover {
          display: block;
          max-width: 400px;
        }
        > .icon-play {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      }
    }

    > .hide-content-tip {
      margin-top: 20px;
      font-size: 16px;
      text-align: center;
    }

    > .tag {
      height: 25px;
      padding: 0 8px;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      border-radius: 12.5px;
      margin-right: 15px;
      margin-top: 35px;
      background: $background-color-grey;
      border: 1px solid $background-color-grey;
      color: #777;
      font-size: 12px;
      &:hover {
        color: $color-blue-base;
        background: #fff;
        border: 1px solid $color-blue-base;
      }
    }
    .location{
      display: inline-block;
      background: #F7F7F7;
      border-radius: 13px;
      font-size:12px;
      color: #777777;
      padding:4px 10px;
      line-height: 16px;
      margin-top: 10px;
      background: $background-color-grey;
      border: 1px solid $background-color-grey;
      &:hover {
        color: $color-blue-base;
        background: #fff;
        border: 1px solid $color-blue-base;
        .icon{
          fill: $color-blue-base;
        }
      }
      .flex{
        display: flex;
        align-items: center;
      }
      .icon{
        margin-right: 4px;
        fill: #777;
      }
    }
    .product{
      margin: 45px auto 0;
      width: 450px;
    }
    .audio {
      margin: 45px auto 0;
    }
  }

</style>

