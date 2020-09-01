<template>
  <div class="post-container">
    <div v-if="item.isEssence" class="essence">
      <svg-icon type="index-essence" />
    </div>
    <Avatar :user="item.user" class="avatar" />
    <div class="main-cont">
      <div class="top-flex">
        <div class="user-name">{{ item.user && item.user.username }}</div>
        <div class="time">{{ $t('topic.publishAt') }} {{ timerDiff(item.createdAt) }}{{ $t('topic.before') }}</div>
      </div>
      <template v-if="item.firstPost">
        <div class="first-post" @click.self="toDetail">
          <div @click="toDetail">
            <div v-if="item.type === 1" class="title">{{ item.title }}</div>
            <div class="content">
              <div v-html="item.firstPost.contentHtml" />
            </div>
          </div>
          <div v-if="item.firstPost.images && item.firstPost.images.length > 0" class="images" @click.self="toDetail">
            <el-image
              v-for="(image, index) in item.firstPost.images.slice(0, 3)"
              :key="index"
              class="image"
              :src="image.thumbUrl"
              :alt="image.filename"
              :preview-src-list="unpaid ? [] : [...item.firstPost.images.map(item => item.thumbUrl)]"
              fit="cover"
              lazy
              @click="onClickImage"
            >
              <div slot="placeholder" class="image-slot">
                <i class="el-icon-loading" />
              </div>
            </el-image>
          </div>
          <div v-if="item.firstPost.images && item.firstPost.images.length > 3" class="image-count" @click="toDetail">共 {{ item.firstPost.images.length }} 张图片，进入查看全部..</div>
          <div v-if="item.type === 2 && item.threadVideo" class="video-main">
            <el-image
              v-if="item.threadVideo.cover_url"
              class="video-img-cover"
              :src="item.threadVideo.cover_url"
              :alt="item.threadVideo.file_name"
              fit="cover"
              lazy
              @click="openVideo"
            />
            <div v-else class="no-cover" @click="openVideo">暂无封面</div>
            <svg-icon type="video-play" class="video-play" @click="openVideo" />
          </div>
          <video-pop v-if="showVideoPop" :cover-url="item.threadVideo.cover_url" :url="item.threadVideo.media_url" @remove="showVideoPop = false" />
        </div>
        <div class="bottom-handle">
          <div class="left">
            <div v-permission:handleLike="''" class="btn like" :class="{'liked': item.firstPost.isLiked}">
              <svg-icon v-permission:handleLike="''" type="like" class="icon" />
              {{ item.firstPost.isLiked ? $t('topic.liked') : $t('topic.like') }} {{ item.firstPost.likeCount > 0 ? item.firstPost.likeCount : '' }}</div>
            <div class="btn comment" @click="toDetail">
              <svg-icon type="comment" class="icon" />
              {{ $t('topic.comment') }} {{ item.firstPost.comment > 0 ? item.firstPost.comment : '' }}</div>
            <share-popover :threads-id="item._jv.id">
              <div class="btn share">
                <svg-icon type="link" class="icon" />
                {{ $t('topic.share') }}
              </div>
            </share-popover>
          </div>
          <div class="reply-btn" @click="toDetail">{{ $t('topic.reply') }}</div>
        </div>
      </template>
    </div>
  </div>
</template>
<script>
import timerDiff from '@/mixin/timerDiff'
import handleError from '@/mixin/handleError'
export default {
  mixins: [timerDiff, handleError],
  props: {
    item: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      loading: false,
      showVideoPop: false
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
      this.$router.push({ path: `/topic/${this.item._jv.id}` })
    },
    // 点击图片 判断是否付费， 未付费跳转详情页
    onClickImage() {
      if (!this.unpaid || !this.canViewPostsFn()) return
      this.$router.push({ path: `/topic/${this.item._jv.id}` })
    },
    // 点击视频 判断是否付费， 未付费跳转详情页
    openVideo() {
      if (!this.canViewPostsFn()) return
      if (this.unpaid) {
        this.$router.push({ path: `/topic/${this.item._jv.id}` })
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
  padding:20px;
  border-bottom: 1px solid $border-color-base;
  // &:hover{
  //   background: #E5F2FF;
  // }
  .essence{
    position: absolute;
    top:0;
    right: 20px;
    font-size: 20px;
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
    .user-name{
      font-size:16px;
      font-weight: bold;
      flex: 0 0 60%;
      @include text-hidden();
    }
    .time{
      color: #8590A6;
      font-size:12px;
    }
    .title{
      font-weight: bold;
      font-size: 20px;
      margin-bottom:6px;
      @include text-hidden();
      flex: 0 0 60%;
    }
    .content{
      @include text-hidden(4);
      line-height: 24px;
      font-size: 16px;
      color: #000;
      flex: 0 0 60%;
      ::v-deep p {
        font-size: 16px;
      }

      ::v-deep img {
        height: 22px;
      }
    }
    .images{
      padding: 20px 0 0;
      display: flex;
      .image{
        width:185px;
        height: 185px;
        border-radius: 5px;
        margin-right: 10px;
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

    .bottom-handle{
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 20px;
      .left{
        display: flex;
        align-items: center;
          .btn{
          color: $font-color-grey;
          margin-right:36px;
          cursor: pointer;
        }
        .icon{
          margin-right: 3px;
        }
        .like{
          padding: 7px 15px;
          line-height: 1;
          border-radius:2px;
          // transition: all 0.1s ease-in;
          &.liked{
            color:#D0D4DC;
          }
          &:hover{
            background: #E5F2FF;
            color:$color-blue-base;
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
        padding: 8px 20px;
        line-height: 1;
        outline: none;
        cursor: pointer;
      }
    }
  }
}

</style>
