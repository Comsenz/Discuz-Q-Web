<template>
  <div class="container">
    <main class="cont-left">
      <index-filter @onChangeFilter="onChangeFilter" @onChangeType="onChangeType" @onChangeSort="onChangeSort" />
      <div v-if="threadsStickyData.length > 0" class="list-top">
        <div v-for="(item, index) in threadsStickyData" :key="index" class="list-top-item">
          <div class="top-label">{{ $t('home.sticky') }}</div>
          <nuxt-link :to="`/pages/topic/index?id=${item._jv && item._jv.id}`" target="_blank" class="top-title">
            <template v-if="item.type === 1">
              {{ item.title }}
            </template>
            <div v-else v-html="$xss(formatRichText(item.firstPost && item.firstPost.summary))" />
          </nuxt-link>
        </div>
      </div>
      <div v-if="total > 0" class="new-post">
        <div class="new-post-cont">
          {{ $t('home.hasNewContent', { total }) }}
          <span class="refresh" @click="reloadThreadsList">{{ $t('home.clickRefresh') }}</span>
        </div>
      </div>
      <div class="post-list">
        <post-item v-for="(item, index) in threadsData" :key="index" :item="item" />
        <list-load-more
          :loading="loading"
          :has-more="hasMore"
          :page-num="pageNum"
          :length="threadsData.length"
          @loadMore="loadMore"
        />
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
import env from '@/utils/env'
export default {
  layout: 'custom_layout',
  name: 'Index',
  mixins: [handleError],
  // 异步数据用法
  async asyncData({ store, query }, callback) {
    if (!env.isSpider) {
      callback(null, {})
    }
    const threadsStickyParams = {
      'filter[isSticky]': 'yes',
      'filter[isApproved]': 1,
      'filter[isDeleted]': 'no',
      'filter[categoryId]': query.categoryId,
      'page[number]': 1,
      include: 'firstPost'
    }
    const threadsParams = {
      include: 'user,user.groups,firstPost,firstPost.images,category,threadVideo,question,question.beUser',
      'filter[isSticky]': 'no',
      'filter[isApproved]': 1,
      'filter[isDeleted]': 'no',
      'filter[categoryId]': query.categoryId,
      'page[number]': 1,
      'page[limit]': 10
    }
    const userParams = {
      include: 'groups',
      limit: 4
    }
    try {
      const resData = {}
      const threadsStickyData = await store.dispatch('jv/get', ['threads', { params: threadsStickyParams }])
      const threadsData = await store.dispatch('jv/get', ['threads', { params: threadsParams }])
      const categoryData = await store.dispatch('jv/get', ['categories', {}])
      const recommendUser = await store.dispatch('jv/get', ['users/recommended', { params: userParams }])
      // 处理一下data
      if (Array.isArray(threadsStickyData)) {
        resData.threadsStickyData = threadsStickyData
      } else if (threadsStickyData && threadsStickyData._jv && threadsStickyData._jv.json) {
        const _threadsStickyData = threadsStickyData._jv.json.data || []
        _threadsStickyData.forEach((item, index) => {
          _threadsStickyData[index] = {
            ...item,
            ...item.attributes,
            firstPost: item.relationships.firstPost.data,
            jv: { id: item.id }
          }
        })
        resData.threadsStickyData = _threadsStickyData
      }
      if (Array.isArray(threadsData)) {
        resData.threadsData = threadsData
      } else if (threadsData && threadsData._jv && threadsData._jv.json) {
        const _threadsData = threadsData._jv.json.data || []
        _threadsData.forEach((item, index) => {
          _threadsData[index] = {
            ...item,
            ...item.attributes,
            firstPost: item.relationships.firstPost.data,
            user: item.relationships.user.data,
            _jv: { id: item.id }
          }
        })
        resData.threadsData = _threadsData
      }
      if (Array.isArray(categoryData)) {
        resData.categoryData = categoryData
      } else if (categoryData && categoryData._jv && categoryData._jv.json) {
        const _categoryData = categoryData._jv.json.data || []
        _categoryData.forEach((item, index) => {
          _categoryData[index] = { ...item, ...item.attributes, _jv: { id: item.id }}
        })
        resData.categoryData = _categoryData
      }
      if (Array.isArray(recommendUser)) {
        resData.recommendUserData = recommendUser
      } else if (recommendUser && recommendUser._jv && recommendUser._jv.json) {
        const _recommendUser = recommendUser._jv.json.data || []
        _recommendUser.forEach((item, index) => {
          _recommendUser[index] = { ...item, ...item.attributes }
        })
        resData.recommendUserData = _recommendUser
      }
      callback(null, resData)
    } catch (error) {
      callback(null, {
        _error__abc: {
          error_keys: Object.keys(error),
          error: String(error),
          errno: error.errno,
          code: error.code,
          syscall: error.syscall,
          address: error.address,
          port: error.port,
          config: error.config,
          request_domain: (error.request || {}).domain,
          request_keys: Object.keys(error.request || {}),
          response_keys: Object.keys(error.response || {})
        }
      })
    }
  },
  data() {
    return {
      loading: false,
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
      threadCount: 0, // 主题总数
      total: 0, // 新的主题数，通过轮询获取
      htitle: '\u200E'
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
    if (this.forums && this.forums.set_site) {
      this.htitle = this.forums.set_site.site_name ? this.forums.set_site.site_name : 'Discuz! Q'
    }
    if (this.$route.query.categoryId) {
      this.categoryId = this.$route.query.categoryId
    }
    if (this.threadsStickyData.length === 0) {
      this.getThreadsSticky()
    }
    if (this.threadsData.length === 0) {
      this.getThreadsList()
    } else {
      if (this.threadsData.length === this.pageSize) {
        this.hasMore = true
      }
      if (this.timer) {
        clearInterval(this.timer)
      }
      this.timer = setInterval(() => {
        this.autoLoadThreads()
      }, 30000)
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
      this.$store.dispatch('jv/get', ['threads', { params }]).then((data) => {
        this.threadsStickyData = [...data]
      })
    },
    // 非置顶主题
    getThreadsList() {
      this.loading = true
      const params = {
        include: 'user,user.groups,firstPost,firstPost.images,category,threadVideo,question,question.beUser',
        'filter[isSticky]': 'no',
        'filter[isApproved]': 1,
        'filter[isDeleted]': 'no',
        'filter[categoryId]': this.categoryId,
        'filter[type]': this.threadType,
        'filter[isEssence]': this.threadEssence,
        'filter[fromUserId]': this.fromUserId,
        sort: this.sort,
        'page[number]': this.pageNum,
        'page[limit]': this.pageSize
      }
      if (this.threadType !== null) {
        params['filter[type]'] = this.threadType
      }
      this.$store.dispatch('jv/get', ['threads', { params }]).then((data) => {
        this.hasMore = data.length === this.pageSize
        const _threadCount = (data &&
          data._jv &&
          data._jv.json &&
          data._jv.json.meta &&
          data._jv.json.meta.threadCount) || 0
        if (this.pageNum === 1) {
          this.threadsData = data
          this.threadCount = _threadCount
        } else {
          this.threadsData = [...this.threadsData, ...data]
        }
        if (data && data._jv) {
          this.hasMore = this.threadsData.length < _threadCount
        }
        // 加载成功 页码加1，为加载更多做准备
        this.pageNum += 1
        if (this.timer) {
          clearInterval(this.timer)
        }
        this.timer = setInterval(() => {
          this.autoLoadThreads()
        }, 30000)
      }, (e) => {
        this.handleError(e)
      })
        .finally(() => {
          this.loading = false
        })
    },
    // 点击加载更多
    loadMore() {
      // 在这里加1的话，遇到加载不成功的会不断加页码
      //  this.pageNum++
      this.getThreadsList()
    },
    // 轮询查看是否有新主题
    autoLoadThreads() {
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
      this.$store.dispatch('jv/get', ['threads', { params }]).then((data) => {
        if (data && data._jv) {
          const _threadCount = (data._jv.json && data._jv.json.meta && data._jv.json.meta.threadCount) || 0
          if (this.threadCount > 0) {
            this.total = _threadCount - this.threadCount > 0 ? _threadCount - this.threadCount : 0
          }
        }
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
      this.$router.push({ url: '/', query: id !== 0 ? { categoryId: id } : {}})
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
      title: this.htitle
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
      border-bottom: 1px solid $line-color-base;
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
        font-size: 14px !important;
        max-height: 21px;
        ::v-deep p {
          font-size: 14px !important;
        }

        ::v-deep img {
          height: 19px;
        }
        @media screen and ( max-width: 1005px ) {
          ::v-deep img {
            height: 18px;
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
