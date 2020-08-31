<template>
  <article class="global">
    <h2 class="title">{{ title }}</h2>
    <div class="content-html" v-html="formatTopicTab(article.contentHtml || '')" />
    <img
      v-if="video.cover_url"
      class="video-img-cover"
      :src="video.cover_url"
      :alt="video.file_name"
      @click.stop="openVideo"
    >
    <div v-if="article.images && article.images.length > 0" class="images">
      <el-image
        v-for="(image, index) in article.images"
        :key="index"
        style="width: 200px; height: 200px;border-radius: 5px; margin-right: 20px"
        :src="image.thumbUrl"
        :alt="image.filename"
        :preview-src-list="unpaid ? [] : [...article.images.map(item => item.thumbUrl)]"
        fit="cover"
      />
    </div>
    <div v-if="unpaid && threadType === 1" class="hide-content-tip">{{ $t('pay.contentHide') }}</div>
    <div class="tag" @click="skipIndexPage">{{ category.name }}</div>
    <video-pop v-if="showVideoPop" :cover-url="video.cover_url" :url="video.media_url" @remove="showVideoPop = false" />
  </article>
</template>

<script>
import s9e from '@/utils/s9e'

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
      return !(this.paidInformation.paid || parseFloat(this.paidInformation.price) === 0)
    }
  },
  watch: {
    article: {
      handler() {
        this.$nextTick(this.addTextHideCover)
      },
      deep: true
    }
  },
  methods: {
    formatTopicTab(html) {
      return s9e.parse(html)
    },
    addTextHideCover() {
      if (!this.unpaid && this.threadType === 1) return
      const contentHtml = document.querySelector('.content-html')
      if (parseInt(contentHtml.offsetHeight) > 100) contentHtml.classList.add('hide-cover')
    },
    openVideo() {
      if (this.unpaid) return this.$emit('payForVideo')
      this.showVideoPop = true
    },
    skipIndexPage() {
      // TODO
      console.log('跳到首页的某个地方')
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

    > .images {
      margin-top: 30px;
      width: 660px;
    }

    > .video-img-cover {
      display: block;
      margin-top: 30px;
      width: 400px;
      cursor: pointer;
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
      background: #F7F7F7;
      color: #777;
      font-size: 12px;
    }

  }

</style>

