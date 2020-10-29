<template>
  <div class="topic">
    <div class="post-list">
      <post-item
        v-for="(item, index) in threadsData"
        :key="index"
        :item="item"
        :lazy="false"
        @change="changelike"
      />
      <list-load-more
        :loading="loading"
        :has-more="hasMore"
        :page-num="pageNum"
        :length="threadsData.length"
        @loadMore="loadMore"
      />
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
    threadData: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      threadsData: [],
      pageSize: 10,
      pageNum: 1, // 当前页数
      currentLoginId: this.$store.getters['session/get']('userId'),
      loading: false,
      hasMore: false
    }
  },
  mounted() {
    this.threadsData = this.threadData
    if (this.threadsData.length === 0) {
      this.loadThreads()
    }
  },
  methods: {
    // 加载当前主题数据
    loadThreads() {
      this.loading = true
      const params = {
        'filter[isDeleted]': 'no',
        sort: '-createdAt',
        include: 'user,user.groups,firstPost,firstPost.images,firstPost.postGoods,category,threadVideo,threadAudio,question,question.beUser',
        'page[number]': this.pageNum,
        'page[limit]': this.pageSize,
        'filter[isApproved]': 1,
        'filter[userId]': this.userId
      }
      status
        .run(() => this.$store.dispatch('jv/get', ['threads', { params }]))
        .then((res) => {
          this.loading = false
          this.hasMore = res.length === this.pageSize
          this.threadsData = [...this.threadsData, ...res]
          if (res._jv) {
            this.hasMore = this.threadsData.length < res._jv.json.meta.threadCount
          }
          this.pageNum += 1
        }, (e) => {
          this.handleError(e)
        })
        .finally(() => {
          this.loading = false
        })
    },
    loadMore() {
      if (this.hasMore) {
        this.loadThreads()
      }
    },
    changelike() {
      this.$emit('changeLike', { userId: this.userId })
    },
    changetopiclike() {
      this.pageNum = 1
      this.threadsData = []
      this.loadThreads()
    }
  }
}
</script>
<style lang='scss' scoped>
@import "@/assets/css/variable/color.scss";
.topic{
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
