<template>
  <div class="container">
    <main class="cont-left">
      <index-filter @onChangeFilter="onChangeFilter" @onChangeType="onChangeType" @onChangeSort="onChangeSort" />
      <div class="list-top">
        <div v-for="(item, index) in stickyList" :key="index" class="list-top-item">
          <div class="top-label">{{ $t('home.sticky') }}</div>
          <nuxt-link :to="`/topic/${item._jv.id}`" class="top-title">
            <template v-if="item.type === 1">
              {{ item.title }}
            </template>
            <div v-else v-html="formatRichText(item.firstPost.summary)" />
          </nuxt-link>
        </div>
      </div>
      <div v-if="newThreadsCount > 0" class="new-post">
        <div class="new-post-cont">有 {{ newThreadsCount }} 条新发布的内容 <span class="refresh" @click="reloadThreadsList">点击刷新</span></div>
      </div>
      <div class="post-list">
        <post-item v-for="(item, index) in threadsList" :key="index" :item="item" />
        <loading v-if="loading" />
        <template v-else>
          <div v-if="hasMore" class="load-more" @click="loadMore">{{ $t('topic.showMore') }}</div>
          <div v-else class="no-more"><svg-icon v-if="threadsList.length === 0" type="empty" class="empty-icon" />{{ threadsList.length > 0 ? $t('discuzq.list.noMoreData') : $t('discuzq.list.noData') }}</div>
        </template>
      </div>
    </main>
    <aside class="cont-right">
      <div class="category background-color">
        <category :post-loading="loading" @onChange="onChangeCategory" />
      </div>
      <div class="background-color">
        <advertising />
      </div>
      <div class="recommend-user background-color">
        <recommend-user />
      </div>
      <copyright :forums="forums" />
    </aside>
  </div>
</template>

<script>
import s9e from '@/utils/s9e'
import forums from '@/mixin/forums'
import handleError from '@/mixin/handleError'
export default {
  layout: 'custom_layout',
  name: 'Index',
  mixins: [forums, handleError],
  // 异步数据用法
  async asyncData({ params, store }, callback) {
    const threadsStickyParams = {
      'filter[isSticky]': 'yes',
      'filter[isApproved]': 1,
      'filter[isDeleted]': 'no',
      include: ['firstPost']
    }
    const threadsParams = {
      include: 'user,user.groups,firstPost,firstPost.images,category,threadVideo',
      'filter[isSticky]': 'no',
      'filter[isApproved]': 1,
      'filter[isDeleted]': 'no'
    }

    try {
      const resData = {}
      const threadsStickyData = await store.dispatch('jv/get', ['threads', { threadsStickyParams }])
      const threadsData = await store.dispatch('jv/get', ['threads', { threadsParams }])
      // 处理一下data
      if (Array.isArray(threadsStickyData)) {
        resData.threadsStickyData = threadsStickyData
      } else if (threadsStickyData && threadsStickyData._jv && threadsStickyData._jv.json) {
        resData.threadsStickyData = threadsStickyData._jv.json.data || []
      }

      if (Array.isArray(threadsData)) {
        resData.threadsData = threadsData
      } else if (threadsData && threadsData._jv && threadsData._jv.json) {
        resData.threadsData = threadsData._jv.json.data || []
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
      stickyList: [], // 置顶主题列表
      threadsList: [], // 主题列表
      pageNum: 1, // 当前页码
      pageSize: 10, // 每页多少条数据
      categoryId: 0, // 分类id 0全部
      threadType: '', // 主题类型 0普通 1长文 2视频 3图片（'' 不筛选）
      sort: '', // 排序
      threadEssence: '', // 是否精华帖
      fromUserId: '', // 关注人id
      hasMore: false,
      timer: null, // 轮询获取新主题 定时器
      newThreadsCount: 0 // 新这主题数，通过轮询获取
    }
  },
  computed: {
    userId() {
      return this.$store.getters['session/get']('userId')
    }
  },
  mounted() {
    if (this.stickyList.length === 0) {
      this.getThreadsSticky()
    }
    if (this.threadsList.length === 0) {
      this.getThreadsList()
    }
  },
  destroyed() {
    this.tiemr = null
    clearInterval(this.timer)
  },
  methods: {
    // 置顶主题
    getThreadsSticky() {
      const params = {
        'filter[isSticky]': 'yes',
        'filter[isApproved]': 1,
        'filter[isDeleted]': 'no',
        'filter[categoryId]': this.categoryId,
        include: ['firstPost']
      }
      this.$store.dispatch('jv/get', ['threads', { params }]).then(data => {
        this.stickyList = [...data]
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
        this.hasMore = data.length === this.pageSize
        if (this.pageNum === 1) {
          this.threadsList = data
        } else {
          this.threadsList = [...this.threadsList, ...data]
        }
        clearInterval(this.timer)
        this.timer = setInterval(() => {
          this.autoLoadThreads(data._jv.json.meta.threadCount)
        }, 30000)

        console.log('threadsList', data)
      }, e => {
        this.handleError(e)
      }).finally(() => {
        this.loading = false
      })
    },
    loadMore() {
      if (this.hasMore) {
        this.pageNum += 1
        this.getThreadsList()
      }
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
        this.newThreadsCount = data._jv.json.meta.threadCount - count
        console.log('新主题数', this.newThreadsCount)
      })
    },
    // 重新加载列表
    reloadThreadsList() {
      this.pageNum = 1
      this.newThreadsCount = 0
      this.threadsList = []
      this.getThreadsList()
    },
    // 点击分类
    onChangeCategory(id) {
      this.$router.push({ url: '/', query: { categoryId: id !== 0 ? id : '' }})
      this.categoryId = id
      this.reloadThreadsList()
      this.stickyList = []
      this.getThreadsSticky()
    },
    // 筛选
    onChangeFilter(val) {
      console.log('val', val)
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
    .list-top-item{
      border-bottom: 1px solid #EFEFEF;
      line-height: 1;
      padding: 10px 20px;
      display: flex;
      align-items: center;
      .top-label{
        color:$font-color-grey;
        margin-right: 20px;
      }
      .top-title{
        color: #000;
        flex: 0 0 60%;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 1;
        overflow: hidden;
      }
      &:hover{
        .top-title{
          color: #FF0000;
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
    .post-list{
      .load-more{
        color: $color-blue-base;
        border:1px solid $color-blue-base;
        font-size: 16px;
        text-align: center;
        padding:12px 0;
        line-height: 1;
        cursor: pointer;
        margin: 20px;
        border-radius:2px;
      }
      .no-more{
        padding: 20px 0;
        text-align: center;
        font-size: 14px;
        color: $font-color-grey;
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
       margin-bottom: 16px;
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
