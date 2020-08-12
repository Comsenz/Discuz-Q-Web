<template>
  <article class="global">
    <h2 class="title">{{ title }}</h2>
    <div class="content-html" v-html="article.contentHtml || '' " />
    <div class="images">
      <el-image
        v-for="(image, index) in article.images"
        :key="index"
        style="max-width: 100%"
        :src="image.thumbUrl"
        :alt="image.filename"
        fit="fill"
      />
    </div>
    <img v-if="video.cover_url" class="video-img-cover" :src="video.cover_url" :alt="video.file_name" @click.stop="openVideo">
  </article>
</template>

<script>

export default {
  name: 'TopicContent',
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
      default: () => {
      }
    }
  },
  watch: {
    article: {
      handler() {
        this.$nextTick(this.formatTopicTab)
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
    openVideo() {
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
    }

    > .video-img-cover {
      width: 400px;
      cursor: pointer;
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

