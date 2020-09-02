<template>
  <div class="container">
    <main class="cont-left">
      <div class="search-header">
        <div class="result-count">
          为您找到 <span v-if="q" class="keyword">"{{ q }}"</span>的相关用户搜索结果 {{ userCount }} {{ $t('topic.item') }}
        </div>
        <create-post-popover />
      </div>
      <div class="user-list">
        <div class="user-flex">
          <!-- <nuxt-link v-for="(item, index) in userList" :key="index" :to="`/profile?userId=${item.id}`" class="user-item">
            <avatar :user="item" :size="45" />
            <div class="info">
              <div class="name text-hidden">{{ item.username }}</div>
              <div v-if="item.fansCount > 0" class="fans">{{ $t('profile.followers') }}{{ item.fansCount }}</div>
            </div>
          </nuxt-link> -->
          <user-item v-for="(item, index) in userList" :key="index" :item="item" />
        </div>
        <loading v-if="loading" />
        <template v-else>
          <div v-if="hasMore" class="load-more" @click="loadMore">{{ $t('topic.showMore') }}{{ $t('search.users') }}</div>
          <div v-else class="no-more"><svg-icon v-if="userList.length === 0" type="empty" class="empty-icon" />{{ $t(userList.length > 0 ? 'discuzq.list.noMoreData' : 'discuzq.list.noData') }}</div>
        </template>
      </div>
    </main>
    <aside class="cont-right">
      <div class="category background-color">
        <category />
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
      pageNum: 1, // 当前页码
      pageSize: 10, // 每页多少条数据
      categoryId: 0, // 分类id 0全部
      q: '',
      hasMore: false,
      userCount: 0,
      userList: []
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
        'filter[username]': `*${this.q}*`
      }
      this.$store.dispatch('jv/get', ['users', { params }]).then(res => {
        console.log('userlist', res)
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
      }, e => {
        this.handleError(e)
      }).finally(() => {
        this.loading = false
      })
    },

    loadMore() {
      if (this.hasMore) {
        this.pageNum += 1
        this.getUserList()
      }
    },
    // 重新加载列表
    reloadList() {
      this.pageNum = 1
      this.userList = []
      this.getUserList()
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
      .user-load-more{
        color: #8590A6;
        margin-top: 40px;
        display:inline-block;
        cursor:pointer;
      }
    }
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
