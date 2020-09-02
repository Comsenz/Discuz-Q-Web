<template>
  <div class="container">
    <main class="cont-left">
      <div class="search-header">
        <div class="result-count">
          为您找到 <span v-if="q" class="keyword">"{{ q }}"</span>的相关搜索结果 {{ userCount + threadCount }} {{ $t('topic.item') }}
        </div>
        <create-post-popover />
      </div>
      <div class="count">{{ $t('search.users') }} {{ userCount }} 名</div>
      <div class="user-list">
        <div class="user-flex">
          <nuxt-link v-for="(item, index) in userList.slice(0, userPageSize)" :key="index" :to="`/profile?userId=${item.id}`" class="user-item">
            <avatar :user="item" :size="45" />
            <div class="info">
              <div class="name text-hidden">{{ item.username }}</div>
              <div class="fans">{{ $t('profile.followers') }} {{ item.fansCount || 0 }}</div>
            </div>
          </nuxt-link>
        </div>
        <loading v-if="userLoading" />
        <template v-else>
          <div v-if="userCount > userPageSize" class="user-load-more" @click="toUserList">{{ $t('topic.showMore') }}{{ $t('search.users') }}</div>
          <div v-if="userList.length === 0" class="no-more"><svg-icon type="empty" class="empty-icon" />{{ $t('search.norelatedusersfound') }}</div>
        </template>
      </div>
      <div class="count">{{ $t('home.invitation') }} {{ threadCount }} {{ $t('topic.item') }}</div>
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
      <advertising />
      <copyright :forums="forums" />
    </aside>
  </div>
</template>

<script>
import forums from '@/mixin/forums'
import handleError from '@/mixin/handleError'
export default {
  layout: 'custom_layout',
  name: 'Index',
  mixins: [forums, handleError],
  data() {
    return {
      loading: false,
      threadsList: [], // 主题列表
      pageNum: 1, // 当前页码
      pageSize: 10, // 每页多少条数据
      categoryId: 0, // 分类id 0全部
      q: '',
      hasMore: false,
      threadCount: 0,
      userCount: 0,
      userList: [],
      userLoading: false,
      userPageSize: 3
    }
  },
  computed: {
    userId() {
      return this.$store.getters['session/get']('userId')
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
      if (this.$route.query.q) {
        this.q = this.$route.query.q
        this.getUserList()
        this.getThreadsList()
      }
    },
    getUserList() {
      this.userList = []
      this.userLoading = true
      const params = {
        include: 'groups',
        sort: 'createdAt',
        'page[limit]': this.userPageSize,
        'filter[status]': 'normal',
        'filter[username]': `*${this.q}*`
      }
      this.$store.dispatch('jv/get', ['users', { params }]).then(res => {
        console.log('userlist', res)
        res.forEach((v, i) => {
          res[i].groupName = v.groups[0] ? v.groups[0].name : ''
        })
        this.userCount = res._jv.json.meta.total
        this.userList = res
      }, e => {
        this.handleError(e)
      }).finally(() => {
        this.userLoading = false
      })
    },
    // 非置顶主题
    getThreadsList() {
      this.loading = true
      const params = {
        include: 'user,user.groups,firstPost,firstPost.images,category,threadVideo',
        'filter[isApproved]': 1,
        'filter[isDeleted]': 'no',
        'filter[categoryId]': this.categoryId,
        'filter[q]': this.q,
        'page[number]': this.pageNum,
        'page[limit]': this.pageSize
      }
      this.$store.dispatch('jv/get', ['threads', { params }]).then(res => {
        this.hasMore = res.length === this.pageSize
        this.threadCount = res._jv.json.meta.threadCount
        if (this.pageNum === 1) {
          this.threadsList = res
        } else {
          this.threadsList = [...this.threadsList, ...res]
        }
        console.log('threadsList', res)
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
    // 重新加载列表
    reloadThreadsList() {
      this.pageNum = 1
      this.threadsList = []
      this.getThreadsList()
    },
    // 点击分类
    onChangeCategory(id) {
      this.categoryId = id
      this.reloadThreadsList()
    },
    toUserList() {
      if (this.$route.query.q) {
        this.$router.push('/search/user?q=' + this.$route.query.q)
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
      padding: 18px 20px;
      border-bottom: 1px solid #EFEFEF;
      .user-flex{
        display: flex;
        align-items: center;
      }
      .user-item{
        display: flex;
        align-items: center;
        margin-right: 80px;
        @media screen and ( max-width: 1005px ) {
          margin-right: 20px;
        }
        .info{
          margin-left: 10px;
          .name{
            font-size:16px;
            max-width: 100px;
            @media screen and ( max-width: 1005px ) {
              max-width: 80px;
            }
          }
          .fans{
            color: #8590A6;
            margin-top: 2px;
          }
        }
      }
      .user-load-more{
        color: #8590A6;
        margin-top: 40px;
        display:inline-block;
        cursor:pointer;
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
