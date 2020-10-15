<template>
  <div class="container">
    <main class="cont-left">
      <div class="search-header">
        <div class="result-count">
          {{ $t('search.find') }} <span v-if="value" class="keyword">"{{ value }}"</span>{{ $t('search.searchuserresult') }} {{ userCount }} {{ $t('topic.item') }}
        </div>
        <create-post-popover />
      </div>
      <div class="user-list">
        <div class="user-flex">
          <user-item v-for="(item, index) in userList" :key="index" :item="item" />
        </div>
        <list-load-more :loading="loading" :has-more="hasMore" :page-num="pageNum" :length="userList.length" :load-more-text="$t('topic.showMore') + $t('search.users')" @loadMore="loadMore" />
      </div>
    </main>
    <aside class="cont-right">
      <div class="category background-color">
        <category :list="categoryData" />
      </div>
      <advertising />
      <copyright :forums="forums" />
    </aside>
  </div>
</template>

<script>
import handleError from '@/mixin/handleError'
import env from '@/utils/env'
export default {
  layout: 'custom_layout',
  name: 'Index',
  mixins: [handleError],
  // 异步数据用法
  async asyncData({ params, store }, callback) {
    if (!env.isSpider) {
      callback(null, {})
    }
    try {
      const resData = {}
      const categoryData = await store.dispatch('jv/get', ['categories', {}])
      if (Array.isArray(categoryData)) {
        resData.categoryData = categoryData
      } else if (categoryData && categoryData._jv && categoryData._jv.json) {
        const _categoryData = categoryData._jv.json.data || []
        _categoryData.forEach((item, index) => {
          _categoryData[index] = { ...item, ...item.attributes, '_jv': { 'id': item.id }}
        })
        resData.categoryData = _categoryData
      }
      callback(null, resData)
    } catch (error) {
      callback(null, {})
    }
  },
  data() {
    return {
      loading: false,
      categoryData: [],
      pageNum: 1, // 当前页码
      pageSize: 10, // 每页多少条数据
      categoryId: 0, // 分类id 0全部
      value: '',
      hasMore: false,
      userCount: 0,
      userList: []
    }
  },
  computed: {
    forums() {
      return this.$store.state.site.info.attributes || {}
    }
  },
  watch: {
    '$route': 'init'
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      if (this.$route.query.categoryId) {
        this.categoryId = this.$route.query.categoryId
      }
      if (this.$route.query.value) {
        this.value = this.$route.query.value
        this.reloadList()
      }
    },
    getUserList() {
      this.loading = true
      const params = {
        include: 'groups',
        sort: 'createdAt',
        'filter[status]': 'normal',
        'page[limit]': this.pageSize,
        'page[number]': this.pageNum,
        'filter[username]': `*${this.value}*`
      }
      this.$store.dispatch('jv/get', ['users', { params }]).then(res => {
        res.forEach((v, i) => {
          res[i].groupName = v.groups[0] ? v.groups[0].name : ''
        })
        this.userCount = res._jv.json.meta.total
        this.hasMore = res.length === this.pageSize
        if (this.pageNum === 1) {
          this.userList = res
        } else {
          this.userList = [...this.userList, ...res]
        }
        this.pageNum++
        if (res._jv) {
          this.hasMore = this.userList.length < res._jv.json.meta.total
        }
      }, e => {
        this.handleError(e)
      }).finally(() => {
        this.loading = false
      })
    },

    loadMore() {
      this.getUserList()
    },
    // 重新加载列表
    reloadList() {
      this.pageNum = 1
      this.userList = []
      this.getUserList()
    }
  },
  head() {
    return {
      title: this.$t('search.search')
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
    .search-header{
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding:18px 20px;
      border-bottom: 1px solid #EFEFEF;
      .result-count{
        font-size: 16px;
        margin-right: 20px;
        .keyword{
          color: #FA5151
        }
      }
    }
    .count{
      font-size: 16px;
      padding: 18px 20px 0;
    }
    .user-list{
      .user-load-more{
        color: #8590A6;
        margin-top: 40px;
        display:inline-block;
        cursor:pointer;
        &:hover{
          color: $color-blue-deep;
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
