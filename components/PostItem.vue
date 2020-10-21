<template>
  <div class="post-container">
    <div v-if="item.isEssence" class="essence">
      <svg-icon type="index-essence" />
    </div>
    <avatar
      v-if="item.user"
      :user="{ id: item.user.id,
               username: item.user.username,
               avatarUrl: item.user.avatarUrl,
               isReal: item.user.isReal
      }"
      class="avatar"
    />
    <div class="main-cont">
      <div class="top-flex">
        <nuxt-link v-if="item.user" :to="`/pages/profile/index?userId=${item.user.id}`" class="user-info">
          <span class="user-name">{{ item.user.username }}</span>
          <span
            v-if="item.user && item.user.groups && item.user.groups.length > 0 && item.user.groups[0].isDisplay"
            class="admin"
          >
            ({{ item.user.groups[0].name }})
          </span>
        </nuxt-link>
        <div v-if="item.createdAt" class="time">
          {{ $t("topic.publishAt") }} {{ item.createdAt | formatDate }}
        </div>
      </div>
      <div v-if="item.type === 5">
        <!-- 未回答 -->
        <template v-if="item.question && item.question.is_answer === 0">
          <nuxt-link
            v-if="item.user"
            :to="`/pages/profile/index?userId=${item.user.id}`"
            class="blue"
          >@{{ item.user.username }}</nuxt-link>
          {{ $t('topic.be') }}
          <nuxt-link
            v-if="item.question && item.question.beUser"
            :to="`/pages/profile/index?userId=${item.question.beUser.id}`"
            class="blue"
          >@{{ item.question.beUser.username }}</nuxt-link>
          {{ $t('topic.question') }}
        </template>
        <!-- 已回答 -->
        <template v-if="item.question && item.question.is_answer === 1">
          <nuxt-link
            v-if="item.question && item.question.beUser"
            :to="`/pages/profile/index?userId=${item.question.beUser.id}`"
            class="blue"
          >@{{ item.question.beUser.username }}</nuxt-link>
          {{ $t('topic.answer') }}
          <nuxt-link
            v-if="item.user"
            :to="`/pages/profile/index?userId=${item.user.id}`"
            class="blue"
          >@{{ item.user.username }}</nuxt-link>
          {{ $t('topic.of') }}{{ $t('topic.question') }}
        </template>
      </div>
      <template v-if="item.firstPost">
        <div class="first-post" @click.self="toDetail">
          <div @click="onClickContent">
            <div v-if="item.type === 1" class="title">{{ $t('home.released') }}
              <svg-icon
                v-show="parseFloat(item.price) > 0"
                type="pay-yuan"
                class="blue"
                style="font-size: 17px; display: inline-block; margin-right: 5px;"
              />
              <span class="blue ">{{ item.title }}</span></div>
            <div v-else class="content">
              <svg-icon v-show="parseFloat(item.price) > 0" type="pay-yuan" class="icon-pay-yuan" />
              <div
                :class="{'content-block': parseFloat(item.price) > 0}"
                v-html="$xss(formatTopicHTML(item.firstPost.summary))"
              />
            </div>
          </div>
          <!-- 图片 -->
          <div
            v-if="item.firstPost.images && item.firstPost.images.length > 0"
            v-viewer="{ url: 'data-source' }"
            class="images"
            @click.self="toDetail"
          >
            <el-image
              v-for="(image, index) in item.firstPost.images.slice(0, 3)"
              :key="index"
              :class="{'image': true,'infoimage': infoimage}"
              :src="image.thumbUrl"
              :data-source="unpaid ? '' : image.url"
              :alt="image.filename"
              fit="cover"
              :lazy="lazy"
              @click.self="onClickImage"
            >
              <div slot="placeholder" class="image-slot">
                <i class="el-icon-loading" />
              </div>
            </el-image>
          </div>
          <div
            v-if="item.firstPost.images && item.firstPost.images.length > 3"
            class="image-count"
            @click="toDetail"
          >
            {{ $t("home.total") }} {{ item.firstPost.images.length }}
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
              :lazy="lazy"
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
          <!-- 附件 -->
          <div
            v-if="
              item.firstPost.attachments &&
                item.firstPost.attachments.length > 0
            "
            class="attachment"
            @click="toDetail"
          >
            <svg-icon
              :type="extensionValidate(item.firstPost.attachments[0].extension)"
            />
            <div class="name text-hidden">
              {{ item.firstPost.attachments[0].fileName }}
            </div>
            <div v-if="item.firstPost.attachments.length > 1" class="total">
              {{
                $t("home.etc") +
                  item.firstPost.attachments.length +
                  $t("home.attachmentTotal")
              }}
            </div>
          </div>
        </div>
        <!-- 位置 -->
        <nuxt-link
          v-if="item.location"
          :to="`/pages/topic/position?longitude=${item.longitude}&latitude=${item.latitude}`"
          class="location"
        >
          <span class="flex">
            <svg-icon type="location" class="icon" />
            {{ item.location }}
          </span>
        </nuxt-link>
        <!-- 操作 -->
        <div class="bottom-handle">
          <div class="left">
            <div
              v-permission:handleLike="''"
              class="btn like"
              :class="{ liked: isLiked }"
            >
              <svg-icon v-permission:handleLike="''" type="like" class="icon" />
              {{ isLiked ? $t("topic.liked") : $t("topic.like") }}
              {{ likeCount > 0 ? likeCount : "" }}
            </div>
            <div v-permission:toDetail="''" class="btn comment">
              <svg-icon type="post-comment" class="icon" />
              {{ $t("topic.comment") }}
              {{ item.postCount - 1 > 0 ? item.postCount - 1 : "" }}
            </div>
            <share-popover
              v-if="item._jv && item._jv.id && showShare"
              :threads-id="item._jv.id"
            >
              <div class="btn share">
                <svg-icon type="link" class="icon" />
                {{ $t("topic.share") }}
              </div>
            </share-popover>
          </div>
          <slot name="bottom-right" />
        </div>
      </template>
    </div>
  </div>
</template>
<script>
import s9e from '@/utils/s9e'
import { time2MinuteOrHour } from '@/utils/time'
import handleError from '@/mixin/handleError'
const extensionList = [
  '7Z',
  'AI',
  'APK',
  'CAD',
  'CDR',
  'DOC',
  'DOCX',
  'EPS',
  'EXE',
  'IPA',
  'MP3',
  'MP4',
  'PDF',
  'PPT',
  'PSD',
  'RAR',
  'TXT',
  'XLS',
  'XLSX',
  'ZIP'
]
export default {
  filters: {
    formatDate(date) {
      return time2MinuteOrHour(date)
    }
  },
  mixins: [handleError],
  props: {
    // 主题详情
    item: {
      type: Object,
      default: () => {}
    },
    // 是否显示分享按钮
    showShare: {
      type: Boolean,
      default: true
    },
    // 是否图片懒加载
    lazy: {
      type: Boolean,
      default: true
    },
    infoimage: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      showVideoPop: false, // 视频弹窗
      isLiked: false // 当前主题是否点赞
    }
  },
  computed: {
    // 当前主题是否付费
    unpaid() {
      return !(this.item.paid || parseFloat(this.item.price) === 0)
    }
  },
  watch: {
    item: {
      handler(val) {
        this.isLiked = val.firstPost && val.firstPost.isLiked
        this.likeCount = val.firstPost && val.firstPost.likeCount
      },
      deep: true,
      immediate: true
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
      const isLiked = !this.isLiked
      const params = {
        _jv: {
          type: 'posts',
          id:
            this.item.firstPost &&
            this.item.firstPost._jv &&
            this.item.firstPost._jv.id
        },
        isLiked
      }
      return this.$store
        .dispatch('jv/patch', params)
        .then(
          () => {
            this.$message.success(isLiked ? this.$t('discuzq.msgBox.likeSuccess') : this.$t('discuzq.msgBox.cancelLikeSuccess'))
            if (isLiked) {
              this.likeCount += 1
            } else {
              this.likeCount -= 1
            }
            this.isLiked = isLiked
            this.$emit('change')
          },
          (e) => {
            this.handleError(e)
          }
        )
        .finally(() => {
          this.loading = false
        })
    },
    // 跳转详情页
    toDetail() {
      if (!this.canViewPostsFn()) return
      this.routerLink()
    },
    // 点击图片 判断是否付费， 未付费跳转详情页
    onClickImage() {
      if (!this.unpaid || !this.canViewPostsFn()) return
      this.routerLink()
    },
    // 点击视频 判断是否付费， 未付费跳转详情页
    openVideo() {
      if (!this.canViewPostsFn()) return
      if (this.unpaid) {
        this.routerLink()
      } else {
        this.showVideoPop = true
      }
    },
    // 详情路由
    routerLink() {
      window.open(
        `/topic/index?id=${this.item._jv && this.item._jv.id}`,
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
      if (!this.item.canViewPosts) {
        this.$message.error(this.$t('home.noPostingTopic'))
        return false
      }
      return true
    },
    // 格式化html
    formatTopicHTML(html) {
      return s9e.parse(html)
    },
    // 根据附件格式显示不同svg
    extensionValidate(extension) {
      return extensionList.indexOf(extension.toUpperCase()) > 0
        ? extension.toUpperCase()
        : 'UNKNOWN'
    }
  }
}
</script>
<style lang="scss" scoped>
@import "@/assets/css/variable/color.scss";
@import "@/assets/css/variable/mixin.scss";
.post-container {
  position: relative;
  display: flex;
  padding: 20.5px 20px 30px;
  border-bottom: 1px solid $line-color-base;
  &:hover {
    background: rgba(229, 242, 255, 0.3);
    border-bottom: 1px solid #e7ecf2;
  }
  .blue{
    color: $color-blue-base;
  }
  .essence {
    position: absolute;
    top: -5px;
    right: 20px;
    font-size: 22px;
  }
  .main-cont {
    flex: 1;
    margin-left: 15px;
    .top-flex {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .first-post {
      cursor: pointer;
    }
    .user-info {
      display: inline-flex;
      align-items: center;
      .user-name {
        font-weight: bold;
        font-size: 16px;
        display: flex;
        max-width: 250px;
        @include text-hidden();
        @media screen and (max-width: 1005px) {
          font-size: 14px;
        }
      }
      .admin {
        color: $font-color-grey;
        font-size: 12px;
        margin-left: 10px;
      }
    }
    .time {
      color: $font-color-grey;
      font-size: 12px;
    }
    .title {
      display: inline-block;
      font-size: 16px;
      margin-bottom: 6px;
      @include text-hidden();
      flex: 0 0 60%;

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
      position: relative;
      display: inline-block;
      @include text-hidden(4);
      line-height: 24px;
      font-size: 14px !important;
      color: #000;
      max-width: 585px;
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
        width: 185px;
        height: 185px;
        margin-right: 10px;
        @media screen and (max-width: 1005px) {
          width: 130px;
          height: 130px;
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
      .infoimage {
        width: 125px;
        height: 125px;
        margin-right: 10px;
        @media screen and (max-width: 1005px) {
          width: 70px;
          height: 70px;
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
    .attachment {
      display: flex;
      align-items: center;
      font-size: 16px;
      margin-top: 15px;
      @media screen and (max-width: 1005px) {
        font-size: 14px;
      }
      .name {
        max-width: 380px;
        max-height: 21px;
        margin-left: 5px;
        @media screen and (max-width: 1005px) {
          max-width: 350px;
          max-height: 19px;
        }
      }
      .total {
        color: #000000;
        margin-left: 16.5px;
      }
    }
    .location {
      display: inline-block;
      background: $background-color-grey;
      border-radius: 13px;
      border: 1px solid $background-color-grey;
      font-size: 12px;
      color: #777777;
      padding: 3px 10px;
      line-height: 16px;
      margin-top: 10px;
      transition: all 0.1s ease-in-out;
      &:hover {
        background-color: #fff;
        color: $color-blue-base;
        border-color: $color-blue-base;
      }
      .flex {
        display: flex;
        align-items: center;
      }
      .icon {
        margin-right: 4px;
      }
    }
    .bottom-handle {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 26px;
      font-size: 12px;
      .left {
        display: flex;
        align-items: center;
        flex: 1;
        justify-content: space-between;
        .btn {
          color: $font-color-grey;
          cursor: pointer;
          min-width: 100px;
          &:hover {
            color: $color-blue-base;
          }
        }
        .icon {
          margin-right: 3px;
        }
        .like {
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
          .icon {
            font-size: 18px;
          }
        }
        .comment .icon {
          font-size: 17px;
        }
        .share {
          min-width: auto;
          .icon {
            font-size: 17px;
          }
        }
      }
      .reply-btn {
        display: inline-block;
        color: $color-blue-base;
        background: #ffffff;
        border: 1px solid $color-blue-base;
        border-radius: 2px;
        font-size: 14px;
        padding: 9.5px 20px;
        line-height: 1;
        outline: none;
        cursor: pointer;
        transition: all 0.1s ease-in-out;
        &:hover {
          background: #e5f2ff;
          border-color: #d4e6fc;
        }
      }
    }
  }
}
</style>
