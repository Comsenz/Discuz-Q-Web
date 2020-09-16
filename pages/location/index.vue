<template>
  <div v-loading="index_loading" class="location-container">
    <header v-if="location || address" class="location-info">
      <svg-icon type="location-map" class="icon" />
      <div class="info">
        <div class="location">{{ location }}</div>
        <div class="address">{{ address }}</div>
      </div>
    </header>
    <div class="container">
      <main class="cont-left">
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
export default {
  layout: 'custom_layout',
  name: 'Index',
  mixins: [handleError],
  // 异步数据用法
  async asyncData({ params, store, query }, callback) {
    const threadsParams = {
      include: 'user,user.groups,firstPost,firstPost.images,category,threadVideo',
      'filter[isSticky]': 'no',
      'filter[isApproved]': 1,
      'filter[isDeleted]': 'no',
      'filter[location]': query.longitude + ',' + query.latitude
    }
    const userParams = {
      include: 'groups',
      'limit': 4
    }
    try {
      const resData = {}
      const threadsData = await store.dispatch('jv/get', ['threads', { threadsParams }])
      const recommendUser = await store.dispatch('jv/get', ['users/recommended', { userParams }])
      // 处理一下data

      if (Array.isArray(threadsData)) {
        resData.threadsData = threadsData.slice(0, 10)
      } else if (threadsData && threadsData._jv && threadsData._jv.json) {
        resData.threadsData = threadsData._jv.json.data.slice(0, 10) || []
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
      index_loading: true,
      threadsData: [], // 主题列表
      recommendUserData: [], // 推荐用户列表
      pageNum: 1, // 当前页码
      pageSize: 2, // 每页多少条数据
      hasMore: false,
      longitude: '', // 经度
      latitude: '', // 纬度
      location: '', // 位置
      address: '' // 详细地址
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
      this.threadsData = []
      if (this.$route.query && this.$route.query.longitude && this.$route.query.latitude) {
        this.longitude = this.$route.query.longitude
        this.latitude = this.$route.query.latitude
        this.getThreadsList()
      }
    },
    // 非置顶主题
    getThreadsList() {
      this.loading = true
      const params = {
        include: 'user,user.groups,firstPost,firstPost.images,category,threadVideo',
        'filter[isApproved]': 1,
        'filter[isDeleted]': 'no',
        'page[number]': this.pageNum,
        'page[limit]': this.pageSize,
        'filter[location]': `${this.longitude},${this.latitude}`
      }
      this.$store.dispatch('jv/get', ['threads', { params }]).then(res => {
        this.hasMore = res.length === this.pageSize
        if (this.pageNum === 1) {
          this.threadsData = res
          if (!this.address && res.length > 0) {
            this.address = res[0].address
          }
          if (!this.location && res.length > 0) {
            this.location = res[0].location
          }
        } else {
          this.threadsData = [...this.threadsData, ...res]
        }
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
.location-container{
  background: #F4F5F6;
  width: 100%;
  .container{
    display:flex;
    width: 100%;
  }
  .location-info{
    @include background();
    display: flex;
    margin-bottom: 15px;
    padding: 22px 20px 25px;
    .icon{
      font-size:30px;
      margin-right: 20px;
    }
    .location{
      font-size: 18px;
      font-weight: bold;
      line-height: 24px;
      @media screen and ( max-width: 1005px ) {
        font-size: 16px;
      }
    }
    .address{
      margin-top: 10px;
    }
  }
  .cont-left{
    flex:auto;
    @include background();
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
