<template>
  <div class="post-container">
    <div v-if="item.isEssence" class="essence">
      <svg-icon type="index-essence" />
    </div>
    <avatar v-if="item.user" :user="{ id: item.user.id, username: item.user.username, avatarUrl: item.user.avatarUrl}" class="avatar" />
    <div class="main-cont">
      <div class="top-flex">
        <nuxt-link v-if="item.user" :to="`/profile?userId=${item.user.id}`" class="user-info">
          <span class="user-name">{{ item.user.username }}</span>
          <span v-if="item.user && item.user.groups && item.user.groups.length > 0 && item.user.groups[0].isDisplay" class="admin">({{ item.user.groups[0].name }})</span>
        </nuxt-link>
        <div v-if="item.createdAt" class="time">{{ $t('topic.publishAt') }} {{ item.createdAt | formatDate }}</div>
      </div>
      <template v-if="item.firstPost">
        <div class="first-post" @click.self="toDetail">
          <div @click="toDetail">
            <div v-if="item.type === 1" class="title">{{ item.title }}</div>
            <div class="content">
              <div v-html="formatTopicHTML(item.firstPost.contentHtml)" />
            </div>
          </div>
          <!-- 图片 -->
          <div v-if="item.firstPost.images && item.firstPost.images.length > 0" v-viewer="{url: 'data-source'}" class="images" @click.self="toDetail">
            <el-image
              v-for="(image, index) in item.firstPost.images.slice(0, 3)"
              :key="index"
              class="image"
              :src="image.thumbUrl"
              :data-source="unpaid ? '' : image.url"
              :alt="image.filename"
              fit="cover"
              lazy
            >
              <div slot="placeholder" class="image-slot">
                <i class="el-icon-loading" />
              </div>
            </el-image>
          </div>
          <div v-if="item.firstPost.images && item.firstPost.images.length > 3" class="image-count" @click="toDetail">{{ $t('home.total') }} {{ item.firstPost.images.length }} {{ $t('home.seeAllImage') }}</div>
          <!-- 视频 -->
          <div v-if="item.type === 2 && item.threadVideo" class="video-main" @click.stop="openVideo">
            <el-image
              v-if="item.threadVideo.cover_url"
              class="video-img-cover"
              :src="item.threadVideo.cover_url"
              :alt="item.threadVideo.file_name"
              fit="cover"
              lazy
            />
            <div v-else class="no-cover">{{ $t('home.noPoster') }}</div>
            <svg-icon type="video-play" class="video-play" />
          </div>
          <video-pop v-if="showVideoPop" :cover-url="item.threadVideo.cover_url" :url="item.threadVideo.media_url" @remove="showVideoPop = false" />
          <!-- 附件 -->
          <div v-if="item.firstPost.attachments && item.firstPost.attachments.length > 0" class="attachment" @click="toDetail">
            <svg-icon :type="extensionValidate(item.firstPost.attachments[0].extension)" />
            <div class="name">{{ item.firstPost.attachments[0].fileName }}</div>
            <div v-if="item.firstPost.attachments.length > 1" class="total">{{ $t('home.etc') + item.firstPost.attachments.length + $t('home.attachmentTotal') }}</div>
          </div>
        </div>
        <!-- 位置 -->
        <nuxt-link v-if="item.location" :to="`/location?longitude=${item.longitude}&latitude=${item.latitude}`" class="location">
          <span class="flex">
            <svg-icon type="location" class="icon" />
            {{ item.location }}
          </span>
        </nuxt-link>
        <!-- 操作 -->
        <div class="bottom-handle">
          <div class="left">
            <div v-permission:handleLike="''" class="btn like" :class="{'liked': item.firstPost.isLiked}">
              <svg-icon v-permission:handleLike="''" type="like" class="icon" />
              {{ item.firstPost.isLiked ? $t('topic.liked') : $t('topic.like') }} {{ item.firstPost.likeCount > 0 ? item.firstPost.likeCount : '' }}</div>
            <div class="btn comment" @click="toDetail">
              <svg-icon type="post-comment" class="icon" />
              {{ $t('topic.comment') }} {{ item.postCount - 1 > 0 ? item.postCount - 1 : '' }}</div>
            <share-popover v-if="item._jv && item._jv.id && showShare" :threads-id="item._jv.id">
              <div class="btn share">
                <svg-icon type="link" class="icon" />
                {{ $t('topic.share') }}
              </div>
            </share-popover>
          </div>
          <!-- <slot name="bottom-right">
            <div class="reply-btn" @click="toDetail">{{ $t('topic.reply') }}</div>
          </slot> -->
        </div>
      </template>
    </div>
  </div>
</template>
<script>
import s9e from '@/utils/s9e'
import { time2MinuteOrHour } from '@/utils/time'
import handleError from '@/mixin/handleError'
const extensionList = ['7Z', 'AI', 'APK', 'CAD', 'CDR', 'DOC', 'DOCX', 'EPS', 'EXE', 'IPA', 'MP3', 'MP4', 'PDF', 'PPT', 'PSD', 'RAR', 'TXT', 'XLS', 'XLSX', 'ZIP']
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
    // 点赞
    handleLike() {
      if (this.loading) return
      if (!this.item.firstPost.canLike) {
        this.$message.error(this.$t('topic.noThreadLikePermission'))
        return
      }
      this.loading = true
      const isLiked = !this.item.firstPost.isLiked
      const params = {
        _jv: {
          type: 'posts',
          id: this.item.firstPost && this.item.firstPost._jv && this.item.firstPost._jv.id
        },
        isLiked: isLiked
      }
      return this.$store.dispatch('jv/patch', params).then(data => {
        this.$message.success(isLiked ? '点赞成功' : '取消点赞成功')
      }, e => {
        this.handleError(e)
      }).finally(() => {
        this.loading = false
      })
    },
    // 跳转详情页
    toDetail() {
      if (!this.canViewPostsFn()) return
      this.$router.push({ path: `/topic/${this.item._jv && this.item._jv.id}` })
    },
    // 点击图片 判断是否付费， 未付费跳转详情页
    onClickImage() {
      if (!this.unpaid || !this.canViewPostsFn()) return
      this.$router.push({ path: `/topic/${this.item._jv && this.item._jv.id}` })
    },
    // 点击视频 判断是否付费， 未付费跳转详情页
    openVideo() {
      if (!this.canViewPostsFn()) return
      if (this.unpaid) {
        this.$router.push({ path: `/topic/${this.item._jv && this.item._jv.id}` })
      } else {
        this.showVideoPop = true
      }
    },
    canViewPostsFn() {
      if (!this.item.canViewPosts) {
        this.$message.error(this.$t('home.noPostingTopic'))
        return false
      }
      return true
    },
    formatTopicHTML(html) {
      return s9e.parse(html)
    },
    extensionValidate(extension) {
      return extensionList.indexOf(extension.toUpperCase()) > 0 ? extension.toUpperCase() : 'UNKNOWN'
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/assets/css/variable/color.scss';
@import '@/assets/css/variable/mixin.scss';
.post-container{
  position: relative;
  display: flex;
  padding:20.5px 20px 30px;
  border-bottom: 1px solid $border-color-base;
  &:hover{
    background: rgba(229, 242, 255, .3);
  }
  .essence{
    position: absolute;
    top:-2px;
    right: 20px;
    font-size: 22px;
  }
  .main-cont{
    flex: 1;
    margin-left: 15px;
    .top-flex{
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .first-post{
      cursor: pointer;
    }
    .user-info{
      flex: 1;
      display: flex;
      align-items: baseline;
      .user-name{
        font-size:16px;
        font-weight: bold;
        display: flex;
        max-width: 50%;
        @include text-hidden();
        @media screen and ( max-width: 1005px ) {
          font-size:14px;
        }
      }
      .admin{
        color: $font-color-grey;
        font-size: 12px;
        margin-left: 10px;
      }
    }
    .time{
      color: $font-color-grey;
      font-size:12px;
    }
    .title{
      font-weight: bold;
      font-size: 20px;
      margin-bottom:6px;
      @include text-hidden();
      flex: 0 0 60%;
      @media screen and ( max-width: 1005px ) {
        font-size:18px;
      }
    }
    .content{
      @include text-hidden(4);
      line-height: 24px;
      font-size: 16px !important;
      color: #000;
      flex: 0 0 60%;
      max-height: 96px;
      ::v-deep p {
        font-size: 16px !important;
      }

      ::v-deep img {
        height: 22px;
      }
      ::v-deep a {
        color: $color-blue-base;
        &:hover {
          border-bottom: 1px solid $color-blue-base;
        }
      }
      @media screen and ( max-width: 1005px ) {
        font-size:14px !important;
        max-height: 80px;
        line-height: 20px;
        ::v-deep p {
          font-size: 14px !important;
        }
        ::v-deep img {
          height: 20px;
        }
      }
    }
    .images{
      padding: 20px 0 0;
      display: flex;
      .image{
        width:185px;
        height: 185px;
        margin-right: 10px;
        @media screen and ( max-width: 1005px ) {
          width:130px;
          height: 130px;
        }
        &:nth-child(3n){
          margin-right: 0;
        }
        .image-slot{
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
    .image-count{
      font-size: 12px;
      color: $font-color-grey;
      text-align: right;
      margin-top: 10px;
    }
    .video-main{
      position: relative;
      margin-top:10px;
      display: inline-block;
      .video-img-cover,.no-cover{
        width:300px;
        height: 200px;
      }
      .no-cover{
        background: #f5f7fa;
        color: #909399;
        line-height: 200px;
        text-align: center;
      }
      .video-play{
        position: absolute;
        font-size: 40px;
        top:50%;
        left:50%;
        transform: translate(-50%,-50%);
      }
    }
    .attachment{
      display: flex;
      align-items: center;
      font-size:16px;
      margin-top: 15px;
      @media screen and ( max-width: 1005px ) {
        font-size:14px;
      }
      .name{
        max-width: 380px;
        margin-left: 5px;
      }
      .total{
        color: #000000;
        margin-left: 16.5px;
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
      margin-top:10px;
      transition: all 0.1s ease-in-out;
      &:hover{
        background-color: #E5F2FF;
        color: $font-color-grey;
      }
      .flex{
        display: flex;
        align-items: center;
      }
      .icon{
        margin-right: 4px;
      }
    }
    .bottom-handle{
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 26px;
      @media screen and ( max-width: 1005px ) {
        font-size:12px;
      }
      .left{
        display: flex;
        align-items: center;
        width: 100%;
        justify-content: space-between;
        .btn{
          color: $font-color-grey;
          cursor: pointer;
          min-width: 100px;
          &:hover{
            color:$color-blue-base;
          }
        }
        .icon{
          margin-right: 3px;
        }
        .like{
          // padding: 10px 15px;
          // line-height: 1;
          // border-radius:2px;
          // border:1px solid transparent;
          // transition: all 0.1s ease-in;
          // &.liked{
          //   color:$color-blue-base;
          //   // padding: 10px 15px;
          //   // background: #E5F2FF;
          //   // &:hover{
          //   //   border-color: #D4E6FC;
          //   // }
          // }
          .icon{
            font-size: 18px;
          }
        }
        .comment .icon{
          font-size: 17px;
        }
        .share{
          min-width: auto;
          .icon{
            font-size: 17px;
          }
        }
      }
      .reply-btn{
        display: inline-block;
        color: $color-blue-base;
        background: #FFFFFF;
        border: 1px solid $color-blue-base;
        border-radius: 2px;
        font-size: 14px;
        padding: 9.5px 20px;
        line-height: 1;
        outline: none;
        cursor: pointer;
        transition: all 0.1s ease-in-out;
        &:hover{
          background: #E5F2FF;
          border-color: #D4E6FC;
        }
      }
    }
  }
}

</style>
