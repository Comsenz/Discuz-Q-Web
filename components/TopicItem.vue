<template>
  <div class="topic-container">
    <div class="main-cont">
      <div class="top-flex">
        <div class="topic-title">
          #<span class="topic-name">{{ item.content }}</span>#
          <svg-icon v-if="item.recommended === 1" type="recommend" />
        </div>
        <div class="view-count">{{ $t('home.topicViewCount', {total: item.view_count }) }}</div>
      </div>
      <template v-if="thread && thread.firstPost">
        <div class="first-post" @click.self="toDetail">
          <div @click="onClickContent">
            <div class="content">
              <svg-icon v-show="parseFloat(thread.price) > 0" type="pay-yuan" class="icon-pay-yuan" />
              <div
                :class="{'content-block': parseFloat(thread.price) > 0}"
                v-html="$xss(formatTopicHTML(thread.firstPost.summary))"
              />
            </div>
          </div>
          <!-- 图片 -->
          <div
            v-if="thread"
            v-viewer="{ url: 'data-source' }"
            class="images"
            @click.self="toDetail"
          >
            <el-image
              v-for="(image, index) in thread.firstPost.images.slice(0, 3)"
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
            v-if="thread.firstPost.images && thread.firstPost.images.length > 3"
            class="image-count"
            @click="toDetail"
          >
            {{ $t("home.total") }} {{ thread.firstPost.images.length }}
            {{ $t("home.seeAllImage") }}
          </div>
          <!-- 视频 -->
          <!-- <div
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
          /> -->
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
  name: 'TopicItem',
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
    // 话题最新主题
    thread() {
      return (this.item && this.item.lastThread && this.item.lastThread.length > 0 && this.item.lastThread[0]) || {}
    },
    // 未付费
    unpaid() {
      return this.thread && !(this.thread.paid || parseFloat(this.thread.price) === 0)
    }
  },
  methods: {
    // 跳转详情页
    toDetail() {
      if (!this.canViewPostsFn()) return
      this.routerLink()
    },
    // 点击图片 判断是否付费， 未付费跳转详情页
    onClickImage() {
      if ((this.thread && !this.thread.unpaid) || !this.canViewPostsFn()) return
      this.routerLink()
    },
    // 点击视频 判断是否付费， 未付费跳转详情页
    openVideo() {
      if (!this.canViewPostsFn()) return
      if (this.thread && this.thread.unpaid) {
        this.routerLink()
      } else {
        this.showVideoPop = true
      }
    },
    // 详情路由
    routerLink() {
      window.open(
        `/thread/${this.thread && this.thread._jv && this.thread._jv.id}`,
        '_blank'
      )
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
      if (this.thread && !this.thread.canViewPosts) {
        this.$message.error(this.$t('home.noPostingTopic'))
        return false
      }
      return true
    },
    // 格式化html
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
    .icon-pay-yuan {
      height: 24px;
      font-size: 15px;
      position: absolute;
      top: 0;
      left: 0;
      color: #8590A6;
    }
    .content-block{
      text-indent: 20px;
    }
    ::v-deep .content {
      @include text-hidden(4);
      line-height: 24px;
      font-size: 14px !important;
      color: #000;
      max-width: 585px;
      position: relative;
      //max-height: 96px;
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
        max-width: 100%;
        max-height: 200px;
        overflow: hidden;
      }
      .qq-emotion {
        height: 22px;
        vertical-align: middle;
        margin-top: -2px;
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
        .qq-emotion {
          height: 20px;
          margin-top: -1px;
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
