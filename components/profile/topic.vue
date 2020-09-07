<template>
  <div class="topic">
    <div class="post-list">
      <post-item
        v-for="(item, index) in data"
        :key="index"
        :item="item"
      />
      <!-- <loading v-if="loading" />
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
          />{{ data.length > 0 ? '没有更多了' : '暂无信息' }}</div>
      </template> -->
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
    },
    scrollTop: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      loadingType: '',
      data: [],
      pageSize: 20,
      pageNum: 1, // 当前页数
      editThreadId: '',
      currentLoginId: this.$store.getters['session/get']('userId'),
      scrollTopPosition: 0,
      loading: false
    }
  },
  mounted() {
    this.loadThreads()
  },
  methods: {
    // 加载当前主题数据
    loadThreads(type) {
      this.loadingType = 'loading'
      const params = {
        'filter[isDeleted]': 'no',
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
          this.loadingType = res.length === this.pageSize ? 'more' : 'nomore'
          this.data = [...this.data, ...res]
          console.log('当前主题数据', this.data)
        })
    }
  }
}
</script>
<style lang='scss' scoped>
//@import url(); 引入公共css类
</style>
