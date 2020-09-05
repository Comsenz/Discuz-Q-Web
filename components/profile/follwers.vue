<template>
  <div v-if="followerList">
    <div
      v-for="(Item, index) in followerList"
      :key="index"
      class="user-item-container"
    >
      <div
        class="flex user-item"
        @click.stop="toUser"
      >
        <avatar
          :user="Item.fromUser"
          :size="45"
        />
        <div class="info">
          <div class="flex">
            <span class="name text-hidden">{{ Item.fromUser.username }}</span>
            <span
              v-if="Item.fromUser.groups"
              class="role"
            >{{ Item.fromUser && Item.fromUser.groups
              ? Item.fromUser.groups[0].name
              : '' }}</span>
          </div>
          <div class="flex count">
            <div class="count-item">{{ $t('profile.topic') }} {{ Item.fromUser.threadCount || 0 }}</div>
            <div class="count-item">{{ $t('profile.following') }} {{ Item.fromUser.followCount || 0 }}</div>
            <div class="count-item">{{ $t('profile.followers') }} {{ Item.fromUser.fansCount || 0 }}</div>
          </div>
        </div>
      </div>
      <!-- follow 关注状态 0：未关注 1：已关注 2：互相关注 -->

      <el-button
        v-if="(Item.fromUser && Item.fromUser.id) != currentLoginId"
        type="text"
        class="follow"
        @click="addFollow(Item.fromUser, index)"
      >
        <!-- <svg-icon type="follow-heart" class="follow-icon" /> -->
        {{
          (Item.fromUser && Item.fromUser.follow) == 0
            ? $t('profile.following')
            : (Item.fromUser && Item.fromUser.follow) == 1
              ? $t('profile.followed')
              : $t('profile.mutualfollow')
        }}
      </el-button>
    </div>
  </div>
</template>
<script>
import { status } from '@/library/jsonapi-vuex/index'

export default {
  name: 'UserItem',
  props: {
    item: {
      type: Object,
      default: () => { }
    },
    show: {
      type: String,
      default: 'all' // simple 显示简单版 all显示所有内容
    },
    userId: {
      type: String,
      default: ''
    },
    isFollow: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      loadingType: '',
      followerList: [],
      pageSize: 20,
      pageNum: 1, // 当前页数
      currentLoginId: this.$store.getters['session/get']('userId')
    }
  },
  mounted() {
    this.getFollowerList()
  },
  methods: {
    // 获取用户粉丝列表
    getFollowerList(type) {
      this.loadingType = 'loading'
      const params = {
        include: ['fromUser', 'fromUser.groups'],
        'filter[type]': 2,
        'page[number]': this.pageNum,
        'page[limit]': this.pageSize,
        'filter[user_id]': this.userId
      }
      status
        .run(() => this.$store.dispatch('jv/get', ['follow', { params }]))
        .then(res => {
          console.log('当前用户粉丝列表', res)
          if (res._jv) {
            delete res._jv
          }
          // this.loadingType = res.length === this.pageSize ? 'more' : 'nomore'
          if (type === 'change') {
            this.followerList = res
          } else {
            this.followerList = [...this.followerList, ...res]
          }
        })
    },
    // 添加关注
    addFollow(userInfo, index) {
      if (!this.$store.getters['session/get']('isLogin')) {
        // #ifdef H5
        // if (!this.handleLogin(getCurUrl())) {
        //   return
        // }
        // #endif
        return
      }
      if (userInfo.follow !== 0) {
        this.deleteFollow(userInfo, index)
        return
      }
      const params = {
        _jv: {
          type: 'follow'
        },
        type: 'user_follow',
        to_user_id: userInfo.id
      }
      this.$store.dispatch('jv/post', params)
        .then(res => {
          console.log('添加关注', res)
          if (this.userId === this.currentLoginId) {
            this.$emit('changeFollow', { userId: this.userId })
          }
          // is_mutual 是否互相关注 1 是 0 否
          const item = this.followerList[index]
          item.fromUser.follow = res.is_mutual === 1 ? 2 : 1
          this.$set(this.followerList, index, item)
        })
    },
    // 取消关注
    deleteFollow(userInfo, index) {
      if (!this.$store.getters['session/get']('isLogin')) {
        // if (!this.handleLogin(getCurUrl())) {
        //   return
        // }
        return
      }
      this.$store.dispatch('jv/delete', `follow/${userInfo.id}/1`).then(() => {
        if (this.userId === this.currentLoginId) {
          this.$emit('changeFollow', { userId: this.userId })
        }
        const item = this.followerList[index]
        item.fromUser.follow = 0
        this.$set(this.followerList, index, item)
      })
    },
    toUser() {
      this.$router.push(`/profile?userId=${this.Item.fromUser.id}`)
    }
  }
}
</script>
<style lang="scss" scoped>
.user-item-container {
  padding: 20px;
  border-bottom: 1px solid #e4e4e4;
  display: flex;
  &.simple {
    padding: 10px 0;
    .name {
      max-width: 120px;
    }
  }
  .flex {
    display: flex;
    align-items: center;
  }
  .user-item {
    flex: 1;
    cursor: pointer;
    margin-right: 10px;
  }
  .info {
    margin-left: 10px;
    .count {
      margin-top: 8px;
    }
    .name {
      font-size: 16px;
      max-width: 150px;
      display: inline-block;
      @media screen and (max-width: 1005px) {
        max-width: 80px;
      }
    }
    .role {
      color: #8590a6;
      margin-left: 10px;
    }
    .count-item {
      color: #8590a6;
      margin-right: 20px;
      padding-right: 20px;
      border-right: 1px solid #efefef;
      line-height: 1;
      &:last-child {
        margin-right: 0;
        padding-right: 0;
        border-right: none;
      }
    }
  }
  .follow {
    border: 1px solid #d0d4dc;
    padding: 0 14px;
    font-size: 12px;
    height: 25px;
    line-height: 25px;
    border-radius: 18px;
    cursor: pointer;
    color: #8590a6;
    .follow-icon {
      color: #ff8888;
      font-size: 13px;
    }
  }
}
</style>
