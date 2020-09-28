<template>
  <div class="topic-container">
    <div class="main-cont">
      <div class="top-flex">
        <div class="topic-title">
          #<span class="topic-name">{{ item.content }}</span># <svg-icon v-if="item.recommended === 1" type="recommend" />
        </div>
        <div class="view-count">{{ $t('home.topicViewCount', {total: item.view_count }) }}</div>
      </div>
      <template v-if="item && item.lastThread && item.lastThread.length > 0 && item.lastThread[0].firstPost">
        <div class="first-post" @click.self="toDetail">
          <div @click="onClickContent">
            <div class="content">
              <div v-html="formatTopicHTML(item.lastThread[0].firstPost.contentHtml)" />
            </div>
          </div>
          <!-- 图片 -->
          <div
            v-if="item.lastThread[0].firstPost.images && item.lastThread[0].firstPost.images.length > 0"
            v-viewer="{ url: 'data-source' }"
            class="images"
            @click.self="toDetail"
          >
            <el-image
              v-for="(image, index) in item.lastThread[0].firstPost.images.slice(0, 3)"
              :key="index"
              class="image"
              :src="image.thumbUrl"
              :data-source="unpaid ? '' : image.url"
              :alt="image.filename"
              fit="cover"
              lazy
              @click.self="onClickImage"
            >
              <div slot="placeholder" class="image-slot">
                <i class="el-icon-loading" />
              </div>
            </el-image>
          </div>
          <div
            v-if="item.lastThread[0].firstPost.images && item.lastThread[0].firstPost.images.length > 3"
            class="image-count"
            @click="toDetail"
          >
            {{ $t("home.total") }} {{ item.lastThread[0].firstPost.images.length }}
            {{ $t("home.seeAllImage") }}
          </div>
          <!-- 视频 -->
          <div
            v-if="item.type === 2 && item.threadVideo"
            class="video-main"
            @click.stop="openVideo"
          >
            <el-image
              v-if="item.threadVideo.cover_url"
              class="video-img-cover"
              :src="item.threadVideo.cover_url"
              :alt="item.threadVideo.file_name"
              fit="cover"
              lazy
            />
            <div v-else class="no-cover">{{ $t("home.noPoster") }}</div>
            <svg-icon type="video-play" class="video-play" />
          </div>
          <video-pop
            v-if="showVideoPop"
            :cover-url="item.threadVideo.cover_url"
            :url="item.threadVideo.media_url"
            @remove="showVideoPop = false"
          />
        </div>
      </template>
      <div class="thread-count">{{ $t('home.topicCount', {total: item.thread_count}) }}</div>
    </div>
  </div>
</template>
<script>
import s9e from '@/utils/s9e'
import { time2MinuteOrHour } from '@/utils/time'
import handleError from '@/mixin/handleError'
export default {
  filters: {
    formatDate(date) {
      return time2MinuteOrHour(date)
    }
  },
  mixins: [handleError],
  props: {
    item: {
      type: Object,
      default: () => {}
    },
    showShare: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      loading: false,
      showVideoPop: false,
      showViewer: false
    }
  },
  computed: {
    unpaid() {
      return !(this.item.paid || parseFloat(this.item.price) === 0)
    }
  },
  methods: {
    // 跳转详情页
    toDetail() {
      if (!this.canViewPostsFn()) return
      // this.$router.push({ path: `/pages/topic/${this.item._jv && this.item._jv.id}` })
      window.open(
        `/pages/topic/index?id=${this.item._jv && this.item._jv.id}`,
        '_blank'
      )
    },
    // 点击图片 判断是否付费， 未付费跳转详情页
    onClickImage() {
      if (!this.unpaid || !this.canViewPostsFn()) return
      window.open(
        `/pages/topic/index?id=${this.item._jv && this.item._jv.id}`,
        '_blank'
      )
    },
    // 点击视频 判断是否付费， 未付费跳转详情页
    openVideo() {
      if (!this.canViewPostsFn()) return
      if (this.unpaid) {
        window.open(
          `/pages/pages/topic/index?id=${this.item._jv && this.item._jv.id}`,
          '_blank'
        )
      } else {
        this.showVideoPop = true
      }
    },
    // 点击正文，使用事件委托判断a标签
    onClickContent(e) {
      const event = e || window.event
      const target = event.target || event.srcElement
      if (target.nodeName.toLocaleLowerCase() !== 'a') {
        this.toDetail()
      }
    },
    // 是否有查看详情的权限
    canViewPostsFn() {
      if (!this.item.canViewPosts) {
        this.$message.error(this.$t('home.noPostingTopic'))
        return false
      }
      return true
    },
    formatTopicHTML(html) {
      return s9e.parse(html)
    }
  }
}
</script>
<style lang="scss" scoped>
@import "@/assets/css/variable/color.scss";
@import "@/assets/css/variable/mixin.scss";
.topic-container {
  position: relative;
  display: flex;
  padding: 20.5px 22px 30px;
  border-bottom: 1px solid $line-color-base;
  .main-cont {
    flex: 1;
    .top-flex{
      display: flex;
    }
    .topic-title{
      font-weight: bold;
      font-size:16px;
      word-break: break-word;
      flex: 1;
      margin-right: 20px;
    }
    .view-count{
      color: $font-color-grey;
      font-size:12px;
      margin-top: 10px;
    }
    .first-post {
      cursor: pointer;
    }
    ::v-deep .content {
      @include text-hidden(4);
      line-height: 24px;
      font-size: 14px !important;
      color: #000;
      max-width: 585px;
      max-height: 96px;
      p,
      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        font-size: 14px !important;
      }
      img {
        height: 22px;
      }
      a {
        color: $color-blue-base;
        &:hover {
          border-bottom: 1px solid $color-blue-base;
        }
      }
      @media screen and (max-width: 1005px) {
        max-height: 80px;
        line-height: 20px;
        max-width: 410px;
        img {
          height: 20px;
        }
      }
    }
    .images {
      padding: 20px 0 0;
      display: flex;
      .image {
        width: 208px;
        height: 208px;
        margin-right: 10px;
        @media screen and (max-width: 1005px) {
          width: 145px;
          height: 145px;
        }
        &:nth-child(3n) {
          margin-right: 0;
        }
        .image-slot {
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
    .image-count {
      font-size: 12px;
      color: $font-color-grey;
      text-align: right;
      margin-top: 10px;
    }
    .video-main {
      position: relative;
      margin-top: 10px;
      display: inline-block;
      .video-img-cover,
      .no-cover {
        width: 300px;
        height: 200px;
      }
      .no-cover {
        background: #f5f7fa;
        color: #909399;
        line-height: 200px;
        text-align: center;
      }
      .video-play {
        position: absolute;
        font-size: 40px;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }
    .thread-count{
      font-size: 12px;
      color: $font-color-grey;
      margin-top: 10px;
    }
  }
}
</style>
