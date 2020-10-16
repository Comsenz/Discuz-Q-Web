<template>
  <div class="like">
    <div class="post-list">
      <post-item
        v-for="(item, index) in data"
        :key="index"
        :item="item"
        :lazy="false"
        @change="changelike"
      />
      <list-load-more :loading="loading" :has-more="hasMore" :page-num="pageNum" :length="data.length" @loadMore="loadMore" />
    </div>
  </div>
</template>

<script>
import { status } from '@/library/jsonapi-vuex/index'
import handleError from '@/mixin/handleError'

export default {
  mixins: [handleError],
  props: {
    userId: {
      type: String,
      default: ''
    },
    likethreadsData: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      data: [],
      pageSize: 10,
      pageNum: 1, // 当前页数
      currentLoginId: this.$store.getters['session/get']('userId'),
      loading: false,
      hasMore: false,
      editThreadId: ''
    }
  },
  mounted() {
    this.data = this.likethreadsData
    if (this.data.length === 0) {
      this.loadlikes()
    }
  },
  methods: {
    // 加载当前点赞数据
    loadlikes(type) {
      this.loading = true
      const params = {
        include: 'user,user.groups,firstPost,firstPost.images,category,threadVideo',
        'page[number]': this.pageNum,
        'page[limit]': this.pageSize,
        'filter[isApproved]': 1,
        'filter[user_id]': this.userId
      }
      status
        .run(() => this.$store.dispatch('jv/get', ['threads/likes', { params }]))
        .then(res => {
          this.loading = false
          this.hasMore = res.length === this.pageSize
          const ress = JSON.parse(JSON.stringify(res))
          ress.forEach((val) => {
            val.firstPost.isLiked = true
          })
          this.data = [...this.data, ...ress]
          if (res._jv) {
            this.hasMore = this.data.length < res._jv.json.meta.threadCount
          }
          this.pageNum += 1
        }, e => {
          this.handleError(e)
        }).finally(() => {
          this.loading = false
        })
    },
    loadMore() {
      if (this.hasMore) {
        // this.pageNum += 1
        this.loadlikes()
      }
    },
    changelike() {
      this.pageNum = 1
      this.data = []
      this.$emit('changeFollow', { userId: this.userId })
      this.loadlikes()
    }
  }
}
</script>
<style lang='scss' scoped>
@import "@/assets/css/variable/color.scss";
.like{
  min-height: 820px;
}
.empty-icon {
  width: 20px;
  height: 18px;
  margin-right: 10px;
}
.no-more2 {
  text-align: center;
  padding: 20px 0;
  color: #8590a6;
  font-size: 14px;
  min-height: 810px;
}
</style>
