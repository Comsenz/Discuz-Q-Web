<template>
  <div class="topic-content-container">
    <div class="container">
      <main class="cont-left">
        <div class="header-filter">
          <div class="title">{{ total + $t('topic.topicCount') }}</div>
          <div class="filter">
            <el-dropdown class="filter-dropdown" placement="bottom" @command="handleCommandSort">
              <span class="el-dropdown-link" :class="{'active': sort !== ''}">
                {{ $t('core.sort') }}<i class="el-icon-arrow-down el-icon--right" />
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-for="(item,index) in filterSort" :key="index" :command="item.value" :class="{'active': item.value === sort}">{{ item.label }}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
        <div class="topic-list">
          <topic-item v-for="(item, index) in topicsData" :key="index" :item="item" />
          <list-load-more :loading="loading" :has-more="hasMore" :page-num="pageNum" :length="topicsData.length" @loadMore="loadMore" />
        </div>
      </main>
      <aside class="cont-right">
        <div class="background-color">
          <advertising />
        </div>
        <div class="recommend-user background-color">
          <recommend-user :list="recommendUserData" />
        </div>
        <copyright :forums="forums" />
      </aside>
    </div>
  </div>
</template>

<script>
import handleError from '@/mixin/handleError'
import env from '@/utils/env'
export default {
  layout: 'custom_layout',
  name: 'TopicContent',
  mixins: [handleError],
  // 异步数据用法
  async asyncData({ params, store, query }, callback) {
    if (!env.isSpider) {
      callback(null, {})
    }
    const topicsParams = {
      include: 'lastThread,lastThread.firstPost,lastThread.firstPost.images',
      'page[limit]': 10
    }
    const userParams = {
      include: 'groups',
      'limit': 4
    }
    try {
      const resData = {}
      const topicsData = await store.dispatch('jv/get', ['topics', { params: topicsParams }])
      const recommendUser = await store.dispatch('jv/get', ['users/recommended', { params: userParams }])
      // 处理一下data
      if (Array.isArray(topicsData)) {
        resData.topicsData = topicsData.slice(0, 10)
      } else if (topicsData && topicsData._jv && topicsData._jv.json) {
        var _topicsData = topicsData._jv.json.data || []
        _topicsData.forEach((item, index) => {
          _topicsData[index] = { ...item, ...item.attributes, '_jv': { 'id': item.id }}
        })
        resData.topicsData = _topicsData
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
      console.log('ssr err')
      callback(null, {})
    }
  },
  data() {
    return {
      loading: false,
      topicsData: [], // 话题列表
      total: 0,
      recommendUserData: [], // 推荐用户列表
      pageNum: 1, // 当前页码
      pageSize: 10, // 每页多少条数据
      hasMore: false,
      filterSort: [{
        label: this.$t('topic.hot'),
        value: '-viewCount'
      }, {
        label: this.$t('topic.contents'),
        value: '-threadCount'
      }],
      sort: ''
    }
  },
  computed: {
    forums() {
      return this.$store.state.site.info.attributes || {}
    }
  },
  mounted() {
    this.getTopicList()
  },
  methods: {
    // 话题列表
    getTopicList() {
      this.loading = true
      const params = {
        include: 'lastThread,lastThread.firstPost,lastThread.firstPost.images',
        'page[number]': this.pageNum,
        'page[limit]': this.pageSize,
        'sort': this.sort
      }
      this.$store.dispatch('jv/get', ['topics', { params }]).then(res => {
        this.hasMore = res.length === this.pageSize
        if (this.pageNum === 1) {
          this.topicsData = res
        } else {
          this.topicsData = [...this.topicsData, ...res]
        }
        this.pageNum++
        if (res && res._jv && res._jv.json && res._jv.json.meta) {
          this.hasMore = this.topicsData.length < res._jv.json.meta.total
          this.total = res._jv.json.meta.total
        }
      }, e => {
        this.handleError(e)
      }).finally(() => {
        this.loading = false
      })
    },
    loadMore() {
      this.getTopicList()
    },
    handleCommandSort(command) {
      this.sort = command
      this.pageNum = 1
      this.topicsData = []
      this.getTopicList()
    }
  },
  head() {
    return {
      title: this.$t('topic.topictitlelist')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/variable/color.scss';
@import '@/assets/css/variable/mixin.scss';
.app-cont{
  box-shadow: none;
}
.topic-content-container{
  background: #F4F5F6;
  width: 100%;
  .container{
    display:flex;
    width: 100%;
  }
  .cont-left{
    flex:auto;
    min-height: calc(100vh - 70px);
    @include background();
    .header-filter{
      border-bottom: 1px solid $line-color-base;
      padding:18px 20.5px 13.5px;
      color: $font-color-grey;
      display:flex;
      justify-content: space-between;
      .title{
        font-weight: bold;
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
.filter-dropdown{
  cursor: default;
  text-align:center;
  @media screen and ( max-width: 1005px ) {
    margin: 0;
  }
  .el-dropdown-link{
    outline: none;
    color: $font-color-grey;
    &.active, &:hover{
      color: $color-blue-base;
    }
  }
}
.el-dropdown-menu{
  padding: 5px 10px;
  .el-dropdown-menu__item{
    border-top: 1px solid rgba(237,237,237,0.6);
    min-width: 100px;
    padding: 0;
    color: #6D6D6D;
    text-align: center;
    &:first-child{
      border-top: 0;
    }
  }
  .el-dropdown-menu__item:not(.is-disabled):hover,.el-dropdown-menu__item:not(.is-disabled).active {
    background-color: transparent;
    color:  $color-blue-base;
  }
}
</style>
