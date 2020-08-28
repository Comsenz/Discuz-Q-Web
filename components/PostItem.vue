<template>
  <div class="post-container">
    <div v-if="item.isEssence" class="essence">
      <svg-icon type="index-essence" />
    </div>
    <Avatar :user="item.user" class="avatar" />
    <div class="main-cont">
      <div class="top-flex">
        <div class="user-name">{{ item.user && item.user.username }}</div>
        <div class="time">{{ $t('topic.publishAt') }}{{ timerDiff(item.createdAt) }}</div>
      </div>
      <template v-if="item.firstPost">
        <nuxt-link :to="`./topic/${item._jv.id}`" class="content">
          <div v-html="item.firstPost.contentHtml" />
        </nuxt-link>
        <div class="bottom-handle">
          <div v-permission:handleLike="''" class="btn like" :class="{'liked': item.firstPost.isLiked}">
            <svg-icon type="like" class="icon" />
            {{ $t('topic.like') }} {{ item.firstPost.likeCount > 0 ? item.firstPost.likeCount : '' }}</div>
          <nuxt-link :to="`./topic/${item._jv.id}`" class="btn comment">
            <svg-icon type="comment" class="icon" />
            {{ $t('topic.comment') }} {{ item.firstPost.comment > 0 ? item.firstPost.comment : '' }}</nuxt-link>
          <share-popover :threads-id="item._jv.id">
            <div class="btn share">
              <svg-icon type="link" class="icon" />
              {{ $t('topic.share') }}
            </div>
          </share-popover>
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

    }
  },
  methods: {
    handleLike() {
      if (this.loading) return
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
      }, e => {
        this.handleError(e)
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.post-container{
  position: relative;
  display: flex;
  padding:20px;
  border-bottom: 1px solid #E4E4E4;
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
    .user-name{
      font-size:16px;
      font-weight: bold;
    }
    .time{
      color: #8590A6;
      font-size:12px;
    }
    .content{
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 4;
      -webkit-box-orient: vertical;
      word-break:break-all;
      line-height: 24px;
      font-size: 16px;
      color: #000;
      ::v-deep p {
        font-size: 16px;
      }

      ::v-deep img {
        height: 22px;
      }
    }
    .bottom-handle{
      display: flex;
      align-items: center;
      margin-top: 20px;
      .btn{
        color: #8590A6;
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
        &.liked{
          background: #E5F2FF;
          color:#1878F3;
        }
      }
    }
  }
}

</style>
