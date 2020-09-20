<template>
  <div class="favorite-container">
    <el-tabs v-model="activeName">
      <el-tab-pane :label="$t('topic.allPost', {total})" name="all" />
    </el-tabs>
    <div class="post-list">
      <post-item v-for="(item, index) in favoriteList" :key="index" :item="item" :show-share="false">
        <div slot="bottom-right" class="delete" @click="handleFavorite(item,index)">
          <svg-icon type="delete" />{{ $t('topic.delete') }}
        </div>
      </post-item>
      <loading v-if="loading" />
      <template v-else>
        <div v-if="hasMore" class="load-more" @click="loadMore">{{ $t('topic.showMore') }}</div>
        <div v-else class="no-more"><svg-icon v-if="favoriteList.length === 0" type="empty" class="empty-icon" />{{ favoriteList.length > 0 ? $t('discuzq.list.noMoreData') : $t('discuzq.list.noData') }}</div>
      </template>
    </div>
  </div>

</template>

<script>
import handleError from '@/mixin/handleError'
export default {
  mixins: [handleError],
  data() {
    return {
      activeName: 'all',
      favoriteList: [],
      total: 0,
      pageNum: 1,
      pageSize: 10,
      loading: false,
      hasMore: false
    }
  },
  mounted() {
    this.getFavoriteList()
  },
  methods: {
    getFavoriteList() {
      this.loading = true
      const params = {
        include: 'user,user.groups,firstPost,firstPost.images,category,threadVideo',
        'page[number]': this.pageNum,
        'page[limit]': this.pageSize
      }
      this.$store.dispatch('jv/get', ['favorites', { params }]).then(data => {
        this.total = data._jv.json.meta.threadCount
        this.hasMore = data.length === this.pageSize
        if (this.pageNum === 1) {
          this.favoriteList = data
        } else {
          this.favoriteList = [...this.favoriteList, ...data]
        }
        if (data._jv) {
          this.hasMore = this.favoriteList.length < data._jv.json.meta.threadCount
        }
        console.log('favoriteList', data)
      }, e => {
        this.handleError(e)
      }).finally(() => {
        this.loading = false
      })
    },
    loadMore() {
      if (this.hasMore) {
        this.pageNum += 1
        this.getFavoriteList()
      }
    },
    handleFavorite(item, index) {
      if (this.loading) return
      this.$confirm(this.$t('topic.confirmCancelCollection'), this.$t('discuzq.msgBox.title'), {
        confirmButtonText: this.$t('discuzq.msgBox.confirm'),
        cancelButtonText: this.$t('discuzq.msgBox.cancel')
      }).then(_ => {
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
        return this.$store.dispatch('jv/patch', params).then(data => {
          this.$message.success(this.$t('topic.cancelCollectionSuccess'))
          this.favoriteList.splice(index, 1)
        }, e => {
          this.handleError(e)
        }).finally(() => {
          this.loading = false
        })
      }).catch(_ => {})
    }
  },
  head() {
    return {
      title: this.$t('profile.myfavorite')
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
    .delete{
      color: $font-color-grey;
      cursor: pointer;
      .svg-icon-delete{
        margin-right: 6px;
      }
      &:hover{
        color: $color-blue-deep;
      }
    }
  }
}
.no-more {
  padding: 94px 0;
}
</style>
