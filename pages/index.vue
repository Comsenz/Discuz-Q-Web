<template>
  <div v-loading="index_loading" class="container">
    <main class="cont-left">
      <index-filter @onChangeFilter="onChangeFilter" @onChangeType="onChangeType" @onChangeSort="onChangeSort" />
      <div v-if="threadsStickyData.length > 0" class="list-top">
        <div v-for="(item, index) in threadsStickyData" :key="index" class="list-top-item">
          <div class="top-label">{{ $t('home.sticky') }}</div>
          <nuxt-link :to="`/topic/${item._jv && item._jv.id}`" class="top-title">
            <template v-if="item.type === 1">
              {{ item.title }}
            </template>
            <div v-else v-html="formatRichText(item.firstPost && item.firstPost.summary)" />
          </nuxt-link>
        </div>
      </div>
      <div v-if="total > 0" class="new-post">
        <div class="new-post-cont">{{ $t('home.hasNewContent', { total }) }} <span class="refresh" @click="reloadThreadsList">{{ $t('home.clickRefresh') }}</span></div>
      </div>
      <div class="post-list">
        <post-item v-for="(item, index) in threadsData" :key="index" :item="item" />
        <loading v-if="loading" />
        <template v-else>
          <div v-if="hasMore" class="load-more" @click="loadMore">{{ $t('topic.showMore') }}</div>
          <div v-else class="no-more"><svg-icon v-if="threadsData.length === 0" type="empty" class="empty-icon" />{{ threadsData.length > 0 ? $t('discuzq.list.noMoreData') : $t('discuzq.list.noData') }}</div>
        </template>
      </div>
    </main>
    <aside class="cont-right">
      <div class="category background-color">
        <category :post-loading="loading" :list="categoryData" @onChange="onChangeCategory" />
      </div>
      <div class="background-color">
        <advertising />
      </div>
      <div class="recommend-user background-color">
        <recommend-user :list="recommendUserData" />
      </div>
      <copyright :forums="forums" />
    </aside>
  </div>
</template>

<script>
import s9e from '@/utils/s9e'
import handleError from '@/mixin/handleError'
export default {
  layout: 'custom_layout',
  name: 'Index',
  mixins: [handleError],
  // 异步数据用法
  async asyncData({ params, store, query }, callback) {
    const threadsStickyParams = {
      'filter[isSticky]': 'yes',
      'filter[isApproved]': 1,
      'filter[isDeleted]': 'no',
      'filter[categoryId]': query.categoryId,
      include: ['firstPost']
    }
    const threadsParams = {
      include: 'user,user.groups,firstPost,firstPost.images,category,threadVideo',
      'filter[isSticky]': 'no',
      'filter[isApproved]': 1,
      'filter[isDeleted]': 'no',
      'page[number]': 1,
      'page[limit]': 10
    }
    const userParams = {
      include: 'groups',
      'limit': 4
    }
    try {
      const resData = {}
      const threadsStickyData = await store.dispatch('jv/get', ['threads', { threadsStickyParams }])
      const threadsData = await store.dispatch('jv/get', ['threads', { threadsParams }])
      const categoryData = await store.dispatch('jv/get', ['categories', {}])
      const recommendUser = await store.dispatch('jv/get', ['users/recommended', { userParams }])
      // 处理一下data
      if (Array.isArray(threadsStickyData)) {
        resData.threadsStickyData = threadsStickyData
      } else if (threadsStickyData && threadsStickyData._jv && threadsStickyData._jv.json) {
        resData.threadsStickyData = threadsStickyData._jv.json.data || []
      }

      if (Array.isArray(threadsData)) {
        resData.threadsData = threadsData.slice(0, 10)
      } else if (threadsData && threadsData._jv && threadsData._jv.json) {
        resData.threadsData = threadsData._jv.json.data.slice(0, 10) || []
      }
      if (Array.isArray(categoryData)) {
        resData.categoryData = categoryData
      } else if (categoryData && categoryData._jv && categoryData._jv.json) {
        resData.categoryData = categoryData._jv.json.data || []
      }
      if (Array.isArray(recommendUser)) {
        resData.recommendUserData = recommendUser
      } else if (recommendUser && recommendUser._jv && recommendUser._jv.json) {
        resData.recommendUserData = recommendUser._jv.json.data || []
      }
      callback(null, resData)
    } catch (error) {
      console.log('ssr err')
      callback(null, {})
    }
  },
  data() {
    return {
      loading: false,
      index_loading: false,
      threadsStickyData: [], // 置顶主题列表
      threadsData: [], // 主题列表
      categoryData: [], // 分类列表
      recommendUserData: [], // 推荐用户列表
      pageNum: 1, // 当前页码
      pageSize: 10, // 每页多少条数据
      categoryId: 0, // 分类id 0全部
      threadType: '', // 主题类型 0普通 1长文 2视频 3图片（'' 不筛选）
      sort: '', // 排序
      threadEssence: '', // 是否精华帖
      fromUserId: '', // 关注人id
      hasMore: false,
      timer: null, // 轮询获取新主题 定时器
      total: 0 // 新的主题数，通过轮询获取
    }
  },
  computed: {
    userId() {
      return this.$store.getters['session/get']('userId')
    },
    forums() {
      return this.$store.state.site.info.attributes || {}
    }
  },
  mounted() {
    // this.threadsStickyData = []
    // this.threadsData = []
    // this.categoryData = []
    if (this.threadsStickyData.length === 0) {
      this.getThreadsSticky()
    }
    if (this.threadsData.length === 0) {
      this.index_loading = true
      this.getThreadsList()
    }
    if (this.categoryData.length === 0) {
      this.getCategoryList()
    }
  },
  destroyed() {
    clearInterval(this.timer)
  },
  methods: {
    // 置顶主题
    getThreadsSticky() {
      this.threadsStickyData = []
      const params = {
        'filter[isSticky]': 'yes',
        'filter[isApproved]': 1,
        'filter[isDeleted]': 'no',
        'filter[categoryId]': this.categoryId,
        include: ['firstPost']
      }
      this.$store.dispatch('jv/get', ['threads', { params }]).then(data => {
        this.threadsStickyData = [...data]
      })
    },
    // 非置顶主题
    getThreadsList() {
      this.loading = true
      const params = {
        include: 'user,user.groups,firstPost,firstPost.images,category,threadVideo',
        'filter[isSticky]': 'no',
        'filter[isApproved]': 1,
        'filter[isDeleted]': 'no',
        'filter[categoryId]': this.categoryId,
        'filter[type]': this.threadType,
        'filter[isEssence]': this.threadEssence,
        'filter[fromUserId]': this.fromUserId,
        'sort': this.sort,
        'page[number]': this.pageNum,
        'page[limit]': this.pageSize
      }
      if (this.threadType !== null) {
        params['filter[type]'] = this.threadType
      }
      // Object.keys(params).forEach(item => {
      //   !params[item] && delete params[item]
      // })
      this.$store.dispatch('jv/get', ['threads', { params }]).then(data => {
        console.log('index data', data)
        this.hasMore = data.length === this.pageSize
        if (this.pageNum === 1) {
          this.threadsData = data
        } else {
          this.threadsData = [...this.threadsData, ...data]
        }
        if (data._jv) {
          this.hasMore = this.threadsData.length < data._jv.json.meta.threadCount
        }
        clearInterval(this.timer)
        this.timer = setInterval(() => {
          this.autoLoadThreads(data._jv.json.meta.threadCount)
        }, 30000)
      }, e => {
        this.handleError(e)
      }).finally(() => {
        this.loading = false
        this.index_loading = false
      })
    },
    loadMore() {
      if (this.hasMore) {
        this.pageNum += 1
        this.getThreadsList()
      }
    },
    // 分类列表
    getCategoryList() {
      this.$store.dispatch('jv/get', ['categories', {}]).then(res => {
        const resData = [...res] || []
        let thread_count = 0 // 计算全部帖子数
        resData.forEach(item => {
          thread_count += item.thread_count
        })
        this.categoryData = [{ _jv: { id: 0 }, name: this.$t('topic.whole'), thread_count: thread_count }, ...resData]
      }, e => {
        this.handleError(e)
      })
    },
    // 轮询查看是否有新主题
    autoLoadThreads(count) {
      const params = {
        'filter[isSticky]': 'no',
        'filter[isApproved]': 1,
        'filter[isDeleted]': 'no',
        'filter[categoryId]': this.categoryId,
        'filter[type]': this.threadType,
        'filter[isEssence]': this.threadEssence,
        'filter[fromUserId]': this.fromUserId,
        'page[limit]': 1
      }
      this.$store.dispatch('jv/get', ['threads', { params }]).then(data => {
        this.total = data._jv.json.meta.threadCount - count
        console.log('新主题数', this.total)
      })
    },
    // 重新加载列表
    reloadThreadsList() {
      this.pageNum = 1
      this.total = 0
      this.threadsData = []
      this.getThreadsList()
    },
    // 点击分类
    onChangeCategory(id) {
      this.$router.push({ url: '/', query: { categoryId: id !== 0 ? id : '' }})
      this.categoryId = id
      this.reloadThreadsList()
      this.threadsStickyData = []
      this.getThreadsSticky()
    },
    // 筛选
    onChangeFilter(val) {
      this.threadEssence = ''
      this.fromUserId = ''
      if (val === 'isEssence') {
        this.threadEssence = 'yes'
      } else if (val === 'followed') {
        this.fromUserId = this.userId
      }
      this.reloadThreadsList()
    },
    // 类型
    onChangeType(val) {
      this.threadType = val
      this.reloadThreadsList()
    },
    // 排序
    onChangeSort(val) {
      this.sort = val
      this.reloadThreadsList()
    },
    // 处理富文本里的图片宽度自适应
    // 1.去掉img标签里的style、width、height属性
    // 2.img标签添加style属性：max-width:100%;height:auto
    // 3.修改所有style里的width属性为max-width:100%
    // 4.去掉<br/>标签			 * @param html			 * @returns {void|string|*}
    formatRichText(html) {
      // eslint-disable-next-line no-param-reassign
      return s9e.parse(html)
    }
  },
  head() {
    return {
      title: this.forums && this.forums.set_site && this.forums.set_site.site_name || 'Discuz! Q'
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/variable/color.scss';
@mixin background(){
  background: #fff;
  border-radius: 5px;
  box-shadow: 0 3px 3px rgba(0, 0, 0, 0.03);
}
.app-cont{
  box-shadow: none;
}
.container{
  display:flex;
  background: #F4F5F6;
  width: 100%;
  .cont-left{
    flex:auto;
    @include background();
    .hide{
      position: relative;
      opacity: 0;
      &.show{
        opacity: 1;
      }
    }
    .list-top-item{
      border-bottom: 1px solid $border-color-base;
      line-height: 19px;
      padding: 10.5px 22px;
      display: flex;
      align-items: center;
      .top-label{
        color:$font-color-grey;
        margin-right: 20px;
      }
      .top-title{
        color: #000;
        flex: 1;
        max-width: 425px;
        overflow: hidden;
        // text-overflow:ellipsis;
        // white-space: nowrap;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 1;
        font-size: 16px !important;
        max-height: 19px;
        ::v-deep p {
          font-size: 16px !important;
        }

        ::v-deep img {
          height: 22px;
        }
        @media screen and ( max-width: 1005px ) {
          font-size:14px !important;
          ::v-deep p {
            font-size: 14px !important;
          }
          ::v-deep img {
            height: 20px;
          }
        }
      }
      &:hover{
        .top-title{
          color:$color-blue-base;
        }
      }
    }
    .new-post{
      padding: 10px 20px;
      .new-post-cont{
        background: #FDF6EC;
        border-radius: 5px;
        text-align:center;
        line-height: 19px;
        color: #E6A23C;
        padding:8px 0;
        .refresh{
          color: $color-blue-base;
          cursor: pointer;
        }
      }

    }
  }
  .cont-right{
    margin-left:15px;
    width:300px;
    flex: 0 0 300px;
    @media screen and ( max-width: 1005px ) {
      width:220px;
      flex: 0 0 220px;
    }
    .background-color{
      @include background();
       margin-bottom: 3px;
    }
    .category{
      margin-bottom: 0;
    }
  }
}
.empty-icon{
  margin-right: 6px;
}
</style>
