<template>
  <article class="global">
    <h2 class="title">{{ title }}</h2>
    <div class="content-html" v-html="formatTopicHTML(article.contentHtml || '')" />
    <div v-if="video.cover_url" class="container-video-img-cover">
      <img
        class="video-img-cover"
        :src="video.cover_url"
        :alt="video.file_name"
        @click.stop="openVideo"
      >
      <svg-icon type="video-play" class="icon-play" style="font-size: 50px" @click="openVideo" />
    </div>
    <div v-if="article.images && article.images.length > 0" v-viewer="{url: 'data-source'}" class="images" @click="unpaid ? openVideo() : ''">
      <el-image
        v-for="(image, index) in article.images"
        :key="index"
        class="image"
        :data-source="image.url"
        :src="image.thumbUrl"
        :alt="image.filename"
        fit="cover"
      >
        <div slot="placeholder" class="image-slot">
          <i class="el-icon-loading" />
        </div>
      </el-image>
    </div>
    <div v-if="(article.attachments || []).length > 0" class="container-attachment">
      <h3 class="name">{{ $t('topic.attachment') }}</h3>
      <div>
        <template v-for="(file, index) in audioList">
          <audio-player :key="index" :file="file" />
        </template>
      </div>
      <div>
        <template v-for="(file, index) in attachmentList">
          <attachment-list :key="index" :file="file" />
        </template>
      </div>
    </div>
    <div v-if="unpaid && threadType === 1" class="hide-content-tip">{{ $t('pay.contentHide') }}</div>
    <nuxt-link v-if="category.name" :to="{path: '/', query: { categoryId: category._jv.id } }" class="tag">{{ category.name }}</nuxt-link>
    <video-pop v-if="showVideoPop" :cover-url="video.cover_url" :url="video.media_url" @remove="showVideoPop = false" />
  </article>
</template>

<script>
import s9e from '@/utils/s9e'
import isLogin from '@/mixin/isLogin'

export default {
  name: 'TopicContent',
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
    }
  },
  data() {
    return {
      showVideoPop: false
    }
  },
  computed: {
    unpaid() {
      if (process.client && this.paidInformation.paid) this.removeTextHideCover()
      return !(this.paidInformation.paid || parseFloat(this.paidInformation.price) === 0)
    },
    audioList() {
      return this.article.attachments.filter(item => item.extension === 'mp3')
    },
    attachmentList() {
      return this.article.attachments.filter(item => item.extension !== 'mp3')
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
      if (this.unpaid) return this.$emit('payForVideo')
      this.showVideoPop = true
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '@/assets/css/variable/color.scss';

  article {
    margin-top: 20px;

    > .title {
      font-size: 20px;
    }

    > .content-html {
      margin-top: 22px;
      font-size: 16px;
      word-break: break-all;

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
        color: $color-blue-base;
      }
    }

    @media screen and ( max-width: 1005px ) {
      .title {
        font-size: 18px;
      }
      .content-html {
        font-size: 16px;
        ::v-deep p {
          font-size: 14px;
        }
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
      position: relative;
      margin-top: 30px;
      max-width: 400px;
      cursor: pointer;
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

    > .hide-content-tip {
      margin-top: 20px;
      font-size: 16px;
      text-align: center;
    }

    > .tag {
      height: 25px;
      line-height: 25px;
      text-align: center;
      padding: 0 8px;
      display: inline-block;
      border-radius: 12.5px;
      margin-right: 15px;
      margin-top: 35px;
      background: $background-color-grey;
      color: #777;
      font-size: 12px;
    }

  }

</style>

