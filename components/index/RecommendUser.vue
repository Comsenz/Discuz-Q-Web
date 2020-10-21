<template>
  <div
    v-if="forums && forums.other && forums.other.can_view_user_list"
    v-loading="loading"
    class="recommend-user-container"
  >
    <div class="recommend-user-title">{{ $t('home.recommentUser') }}</div>
    <div v-show="!loading" class="recommend-user-list">
      <user-item v-for="(item, index) in userList" :key="index" :item="item" show="simple" />
      <div v-if="userList.length === 0" class="no-more">{{ $t('discuzq.list.noData') }}</div>
    </div>
    <div class="refresh" @click="refresh">
      <svg-icon type="refresh" class="icon" />
      {{ $t('home.refresh') }}
    </div>
  </div>
</template>
<script>
import handleError from '@/mixin/handleError'
export default {
  name: 'RecommendUser',
  mixins: [handleError],
  props: {
    // 用户列表
    list: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      userList: [],
      loading: false,
      pageNum: 1,
      pageSize: 4
    }
  },
  computed: {
    forums() {
      return this.$store.state.site.info.attributes || {}
    }
  },
  watch: {
    list: {
      handler(val) {
        this.userList = val
      },
      deep: true
    }
  },
  mounted() {
    // 是否有查看用户列表权限
    if (this.forums && this.forums.other && this.forums.other.can_view_user_list) {
      // 父组件是否有传值
      if (this.list.length === 0) {
        this.getList()
      } else {
        this.userList = this.list
      }
    }
  },
  methods: {
    // 获取推荐用户列表
    getList() {
      this.userList = []
      this.loading = true
      const params = {
        include: 'groups',
        limit: this.pageSize
      }
      this.$store.dispatch('jv/get', ['users/recommended', { params }]).then((res) => {
        const data = res
        data.forEach((v, i) => {
          data[i].groupName = v.groups[0] ? v.groups[0].name : ''
        })
        this.userList = data
      }, (e) => {
        this.handleError(e)
      })
        .finally(() => {
          this.loading = false
        })
    },
    // 刷新
    refresh() {
      this.getList()
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/assets/css/variable/color.scss';
.recommend-user-container{
  padding: 20px;
  @media screen and ( max-width: 1005px ) {
    padding: 14px;
  }
  .recommend-user-title{
    color:#6D6D6D;
    margin-bottom: 8px;
    font-size: 16px;
  }
  .refresh{
    padding: 10px 0 0;
    color: #8590A6;
    cursor: pointer;
    display: inline-flex;
    &:hover{
      color:$color-blue-base;
    }
    .icon{
      margin-right: 6px;
      font-size: 20px;
    }
  }
}
</style>
