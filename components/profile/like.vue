<template>
  <div class="like">
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
          class="no-more"
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
      hasMore: false,
      editThreadId: ''
    }
  },
  mounted() {
    this.loadlikes()
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
          if (res._jv) {
            delete res._jv
          }
          console.log('点赞数据', res)
          this.loading = false
          this.hasMore = res.length === this.pageSize
          this.data = [...this.data, ...res]
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
</style>
