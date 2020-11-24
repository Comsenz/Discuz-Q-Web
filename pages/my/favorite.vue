<template>
  <div class="favorite-container">
    <el-tabs v-model="activeName">
      <el-tab-pane :label="$t('topic.allPost', {total})" name="all" />
    </el-tabs>
    <div class="post-list">
      <template v-for="(item, index) in favoriteList">
        <!-- 语音贴 -->
        <post-item v-if="item.type === 4" :ref="`audio${ item && item.threadAudio && item.threadAudio._jv && item.threadAudio._jv.id}`" :key="index" :item="item" :show-share="false" @audioPlay="audioPlay">
          <div slot="bottom-right" class="delete-container">
            <span class="delete" @click="handleFavorite(item,index)"><svg-icon type="delete" />{{ $t('topic.delete') }}</span>
          </div>
        </post-item>
        <post-item v-else :key="index" :item="item" :show-share="false">
          <div slot="bottom-right" class="delete-container">
            <span class="delete" @click="handleFavorite(item,index)"><svg-icon type="delete" />{{ $t('topic.delete') }}</span>
          </div>
        </post-item>
      </template>
      <list-load-more
        :loading="loading"
        :has-more="hasMore"
        :page-num="pageNum"
        :length="favoriteList.length"
        @loadMore="loadMore"
      />
    </div>
  </div>

</template>

<script>
import head from '@/mixin/head'
import handleError from '@/mixin/handleError'
export default {
  name: 'Favorite',
  layout: 'center_layout',
  mixins: [head, handleError],
  data() {
    return {
      title: this.$t('profile.myfavorite'),
      activeName: 'all',
      favoriteList: [],
      total: 0,
      pageNum: 1,
      pageSize: 10,
      loading: false,
      hasMore: false,
      currentAudioId: '' // 当前播放语音id
    }
  },
  mounted() {
    this.getFavoriteList()
  },
  methods: {
    getFavoriteList() {
      this.loading = true
      const params = {
        include: 'user,user.groups,firstPost,firstPost.images,category,threadVideo,question,question.beUser,question.beUser.groups,firstPost.postGoods,threadAudio',
        'page[number]': this.pageNum,
        'page[limit]': this.pageSize
      }
      this.$store.dispatch('jv/get', ['favorites', { params }]).then((data) => {
        this.total = data._jv.json.meta.threadCount
        this.hasMore = data.length === this.pageSize
        if (this.pageNum === 1) {
          this.favoriteList = data
        } else {
          this.favoriteList = [...this.favoriteList, ...data]
        }
        this.pageNum += 1
        if (data._jv) {
          this.hasMore = this.favoriteList.length < data._jv.json.meta.threadCount
        }
      }, (e) => {
        this.handleError(e)
      })
        .finally(() => {
          this.loading = false
        })
    },
    loadMore() {
      this.getFavoriteList()
    },
    handleFavorite(item, index) {
      if (this.loading) return
      this.$confirm(this.$t('topic.confirmCancelCollection'), this.$t('discuzq.msgBox.title'), {
        confirmButtonText: this.$t('discuzq.msgBox.confirm'),
        cancelButtonText: this.$t('discuzq.msgBox.cancel')
      }).then(() => {
        if (!item.canFavorite) {
          this.$message.error(this.$t('topic.deleteFail'))
        }
        this.loading = true
        const params = {
          _jv: {
            type: 'threads',
            id: item && item._jv && item._jv.id
          },
          isFavorite: false
        }
        return this.$store.dispatch('jv/patch', params).then(() => {
          this.$message.success(this.$t('topic.cancelCollectionSuccess'))
          this.favoriteList.splice(index, 1)
          this.total -= 1
        }, (e) => {
          this.handleError(e)
        })
          .finally(() => {
            this.loading = false
          })
      })
        .catch(() => {})
    },
    // 语音互斥播放
    audioPlay(id) {
      if (this.currentAudioId && this.currentAudioId !== id) {
        this.$refs[`audio${this.currentAudioId}`][0].pause()
      }
      this.currentAudioId = id
    }
  }
}
</script>
<style lang='scss' scoped>
@import '@/assets/css/variable/color.scss';
.favorite-container{
  .el-tabs ::v-deep{
    .el-tabs__header{
      margin: 0;
    }
    .el-tabs__active-bar, .el-tabs__nav-wrap::after {
      height: 0;
    }
    .el-tabs__nav-wrap{
      border-bottom: 1px solid $border-color-base;
      padding-bottom:5px;
      padding-left: 30px;
    }
    .el-tabs__item{
      font-size: 16px;
      color: #B5B5B5;
      &.is-active{
        color:#000;
        font-size: 18px;
        font-weight:bold;
      }
    }
  }
  .post-list{
    .delete-container{
      color: $font-color-grey;
      flex: 2;
      text-align: right;
      > .delete{
        cursor: pointer;
        .svg-icon-delete{
          margin-right: 6px;
          font-size: 14px;
        }
        &:hover{
          color: $color-blue-deep;
        }
      }
    }
  }
}
</style>
