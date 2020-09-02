<template>
  <div v-loading="loading" class="recommend-user-container">
    <div class="recommend-user-title">推荐用户</div>
    <div class="recommend-user-list">
      <user-item v-for="(item, index) in userList" :key="index" :item="item" show="simple" />
      <div v-if="userList.length === 0" class="no-more">{{ $t('discuzq.list.noData') }}</div>
    </div>
    <div class="refresh" @click="refresh">
      <i class="el-icon-refresh icon" />换一批
    </div>
  </div>
</template>
<script>
export default {
  name: 'RecommendUser',
  // 异步数据用法
  async asyncData({ params, store }) {
    const _params = {
      include: 'groups',
      sort: 'createdAt',
      'page[limit]': 4,
      'page[number]': 1,
      'filter[status]': 'normal'
    }
    try {
      const data = await store.dispatch('jv/get', ['users', { _params }])
      return { userList: [...data] }
    } catch (error) {
      console.log('ssr err')
      return { list: [] }
    }
  },
  data() {
    return {
      user: {
        avatarUrl: '',
        id: 13,
        username: 'xhltest'
      },
      userList: [],
      loading: false,
      pageNum: 1,
      pageSize: 40,
      pageCount: 0 // 总页码
    }
  },
  mounted() {
    this.getUserPageSize()
  },
  methods: {
    // 获取用户有多少页
    getUserPageSize() {
      const params = {
        include: 'groups',
        sort: 'createdAt',
        'page[limit]': this.pageSize,
        'page[number]': this.pageNum,
        'filter[status]': 'normal'
      }
      this.$store.dispatch('jv/get', ['users', { params }]).then(res => {
        this.pageCount = res._jv.json.meta.pageCount
        if (res.length > 0) {
          this.refresh()
        }
      }, e => {
        this.handleError(e)
      }).finally(() => {
      })
    },
    getUserList() {
      this.userList = []
      this.loading = true
      const params = {
        include: 'groups',
        sort: 'createdAt',
        'page[limit]': this.pageSize,
        'page[number]': this.pageNum,
        'filter[status]': 'normal'
      }
      this.$store.dispatch('jv/get', ['users', { params }]).then(res => {
        res.forEach((v, i) => {
          res[i].groupName = v.groups[0] ? v.groups[0].name : ''
        })
        this.userCount = res._jv.json.meta.total
        const _res = [...res]
        while (this.userList.length < (_res.length > 4 ? 4 : _res.length)) {
          const index = this.getRandom(_res.length)
          this.userList.push(_res[index])
          _res.splice(index, 1)
        }
      }, e => {
        this.handleError(e)
      }).finally(() => {
        this.loading = false
      })
    },
    refresh() {
      this.pageNum = this.getRandom(this.pageCount)
      this.getUserList()
    },
    getRandom(length) {
      return Math.floor(Math.random() * length)
    }
  }
}
</script>
<style lang="scss" scoped>
.recommend-user-container{
  padding: 20px;
  @media screen and ( max-width: 1005px ) {
    padding: 14px;
  }
  .recommend-user-list{
    min-height: 250px;
  }
  .recommend-user-title{
    color:#6D6D6D;
    margin-bottom: 8px;
    font-weight:bold;
  }
  .refresh{
    padding: 10px 0 0;
    color: #8590A6;
    cursor: pointer;
    display: inline-block;
    .icon{
      margin-right: 6px;
    }
  }
}
</style>
