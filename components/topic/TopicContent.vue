<template>
  <article class="global">
    <h2 class="title">{{ title }}</h2>
    <div class="content-html" v-html="article.contentHtml || '' " />
    <img
      v-if="video.cover_url"
      class="video-img-cover"
      :src="video.cover_url"
      :alt="video.file_name"
      @click.stop="openVideo"
    >
    <div class="images">
      <el-image
        v-for="(image, index) in article.images"
        :key="index"
        style="width: 200px; height: 200px;border-radius: 5px; margin-right: 20px"
        :src="image.thumbUrl"
        :alt="image.filename"
        :preview-src-list="unpaid ? [] : [...article.images.map(item => item.thumbUrl)]"
        fit="contain"
      />
    </div>
    <div v-if="unpaid && threadType === 1" class="hide-content-tip">{{ $t('pay.contentHide') }}</div>
  </article>
</template>

<script>

export default {
  name: 'TopicContent',
  props: {
    article: {
      type: Object,
      default: () => {}
    },
    title: {
      type: String,
      default: () => ''
    },
    video: {
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
    }
  },
  computed: {
    unpaid() {
      return !(this.paidInformation.paid || parseInt(this.paidInformation.price) === 0)
    }
  },
  watch: {
    article: {
      handler() {
        this.$nextTick(() => {
          this.formatTopicTab()
          this.addTextHideCover()
        })
      },
      deep: true
    }
  },
  methods: {
    formatTopicTab() {
      const topic = document.getElementById('topic')
      if (topic) {
        topic.innerHTML = `<a href=/pages/topic/content?id=${topic.getAttribute('value')}>${topic.innerText}</a>`
      }
    },
    addTextHideCover() {
      if (!this.unpaid && this.threadType === 1) return
      const contentHtml = document.querySelector('.content-html')
      if (parseInt(contentHtml.offsetHeight) > 100) contentHtml.classList.add('hide-cover')
    },
    openVideo() {
      if (this.unpaid) return alert('大哥，请付费')
      if (document.getElementById('video-pop')) return
      const div = document.createElement('div')
      div.innerHTML = `<div id="video-pop" class="video-pop">
        <video controls poster="${this.video.cover_url}" preload="auto" bindpause="handlepause" playsinline webkit-playsinline x5-playsinline
          show-fullscreen-btn="true" show-play-btn="true" auto-pause-if-open-native="true" auto-pause-if-navigate="true" enable-play-gesture="false"
          object-fit="cover" src="${this.video.media_url}" />
       <div/>`
      div.classList.add('cover')
      document.querySelector('.global').appendChild(div)
      document.addEventListener('click', this.removeVideoPop)
    },
    removeVideoPop(e) {
      let pass = true
      e.path.forEach(item => { if (item.id === 'video-pop') pass = false })
      if (!pass) return
      document.querySelector('.cover').remove()
      document.removeEventListener('click', this.removeVideoPop)
    }
  }

}
</script>

<style lang="scss" scoped>
  $colorBlue: #1878F3;

  article {
    margin-top: 20px;

    > .title {
      font-size: 20px;
    }

    > .content-html {
      margin-top: 22px;

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

      ::v-deep p {
        font-size: 16px;
      }

      ::v-deep img {
        height: 22px;
      }

      ::v-deep a {
        color: $colorBlue;
      }
    }

    > .images {
      margin-top: 30px;
      width: 660px;
    }

    > .video-img-cover {
      margin-top: 30px;
      width: 400px;
      cursor: pointer;
    }

    > .hide-content-tip {
      font-size: 16px;
      text-align: center;
    }

    ::v-deep .cover {
      position: absolute;
      top: 0;
      left: 0;
      background: rgba(0, 0, 0, 0.45);
      z-index: 5;
      width: 100%;
      height: 100%;

      .video-pop {
        background: #ffffff;
        padding: 15px;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 760px;

        > video {
          width: 730px;
        }
      }
    }

  }

</style>

