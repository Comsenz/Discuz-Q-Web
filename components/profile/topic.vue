<template>
  <div class="topic">
    <div class="post-list">
      <post-item
        v-for="(item, index) in data"
        :key="index"
        :item="item"
      />
      <loading v-if="loading" />
      <template v-else>
        <div
          v-if="hasMore"
          class="load-more"
          @click="loadMore"
        >查看更多</div>
        <div
          v-else
          :class="data.length === 0 ? 'no-more2':'no-more'"
        >
          <svg-icon
            v-if="data.length === 0"
            type="empty"
            class="empty-icon"
          />{{ data.length > 0 ? '没有更多了' : '暂无信息' }}
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { status } from '@/library/jsonapi-vuex/index'

export default {
  props: {
    userId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      data: [],
      pageSize: 10,
      pageNum: 1, // 当前页数
      currentLoginId: this.$store.getters['session/get']('userId'),
      loading: false,
      hasMore: false
    }
  },
  mounted() {
    this.loadThreads()
  },
  methods: {
    // 加载当前主题数据
    loadThreads(type) {
      this.loading = true
      const params = {
        'filter[isDeleted]': 'no',
        sort: '-createdAt',
        include: 'user,user.groups,firstPost,firstPost.images,category,threadVideo',
        'page[number]': this.pageNum,
        'page[limit]': this.pageSize,
        'filter[isApproved]': 1,
        'filter[userId]': this.userId
      }
      status
        .run(() => this.$store.dispatch('jv/get', ['threads', { params }]))
        .then(res => {
          if (res._jv) {
            delete res._jv
          }
          this.loading = false
          this.hasMore = res.length === this.pageSize
          this.data = [...this.data, ...res]
          console.log('当前主题数据', this.data)
        })
    },
    loadMore() {
      if (this.hasMore) {
        this.pageNum += 1
        this.loadThreads()
      }
    }
  }
}
</script>
<style lang='scss' scoped>
@import "@/assets/css/variable/color.scss";
.empty-icon {
  width: 20px;
  height: 18px;
  margin-right: 10px;
}
.load-more {
  color: $color-blue-base;
  border: 1px solid $color-blue-base;
  font-size: 16px;
  text-align: center;
  padding: 12px 0;
  line-height: 1;
  cursor: pointer;
  margin: 20px;
  border-radius: 2px;
}
.no-more2 {
  text-align: center;
  padding: 20px 0;
  color: #8590a6;
  font-size: 14px;
  min-height: 810px;
}
</style>
