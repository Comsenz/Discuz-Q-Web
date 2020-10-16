<template>
  <div class="following">
    <div class="ftop">
      <el-select
        v-model="value"
        placeholder="排序"
        class="fselect"
        size="small"
        @change="confirm"
      >
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-input
        v-model="inputVal"
        size="small"
        :placeholder="$t('manage.pleaseInputUserName')"
        class="h-search"
        @change="onClickSearch"
        @keyup.enter.native="onClickSearch"
      >
        <i
          slot="suffix"
          class="el-icon-search el-input__icon"
          @click="onClickSearch"
        />
      </el-input>
    </div>
    <div
      v-for="(Item, index) in followingList"
      :key="index"
      class="user-item-container"
    >
      <div
        class="flex user-item"
        @click.stop="toUser(Item.toUser.id)"
      >
        <avatar
          :user="Item.toUser"
          :size="45"
        />
        <div class="info">
          <div class="flex">
            <span class="name text-hidden">{{ Item.toUser.username }}</span>
            <span
              v-if="Item.toUser.groups && Item.toUser.groups[0] && Item.toUser.groups[0].isDisplay"
              class="role"
            >{{ Item.toUser && Item.toUser.groups && Item.toUser.groups[0]
              ? Item.toUser.groups[0].name
              : '' }}</span>
          </div>
          <div class="flex count">
            <div class="count-item">{{ $t('profile.topic') }} {{ Item.toUser.threadCount || 0 }}</div>
            <div class="count-item">{{ $t('profile.following') }} {{ Item.toUser.followCount || 0 }}</div>
            <div class="count-item">{{ $t('profile.followers') }} {{ Item.toUser.fansCount || 0 }}</div>
          </div>
        </div>
      </div>
      <!-- follow 关注状态 0：未关注 1：已关注 2：互相关注 -->

      <el-button
        v-if="(Item.toUser && Item.toUser.id) != currentLoginId"
        type="text"
        class="follow"
        @click="addFollow(Item.toUser, index)"
      >
        <svg-icon
          v-if="Item.toUser.follow === 2"
          type="follow-heart"
          class="follow-icon"
        />
        {{
          (Item.toUser && Item.toUser.follow) == 0
            ? $t('profile.following')
            : (Item.toUser && Item.toUser.follow) == 1
              ? $t('profile.followed')
              : $t('profile.mutualfollow')
        }}
      </el-button>
    </div>
    <list-load-more :loading="loading" :has-more="hasMore" :page-num="pageNum" :length="followingList.length" @loadMore="loadMore" />

    <!-- <loading v-if="loading" />
    <template v-else>
      <div
        v-if="hasMore"
        class="load-more"
        @click="loadMore"
      >查看更多</div>
      <div
        v-else
        :class="followingList.length === 0 ? 'no-more2':'no-more'"
      >
        <svg-icon
          v-if="followingList.length === 0"
          type="empty"
          class="empty-icon"
        />{{ followingList.length > 0 ? '没有更多了' : '暂无信息' }}
      </div>
    </template> -->
  </div>
</template>
<script>
import { status } from '@/library/jsonapi-vuex/index'
import handleError from '@/mixin/handleError'

export default {
  name: 'Following',
  mixins: [handleError],
  props: {
    userId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      value: '',
      inputVal: '',
      loadingType: '',
      followingList: [],
      pageSize: 10,
      pageNum: 1, // 当前页数
      currentLoginId: this.$store.getters['session/get']('userId'),
      loading: false,
      hasMore: false,
      sort: '',
      options: [{
        label: this.$t('home.noLimit'),
        value: ''
      }, {
        label: '用户创建时间',
        value: 'users.createdAt'
      }]
    }
  },
  mounted() {
    this.getFollowingList()
  },
  methods: {
    // 获取用户关注列表
    getFollowingList(type) {
      this.loading = true
      const params = {
        include: 'toUser,toUser.groups',
        'filter[type]': 1,
        'sort': this.sort,
        'page[number]': this.pageNum,
        'page[limit]': this.pageSize,
        'filter[user_id]': this.userId,
        'filter[username]': `${this.inputVal}`
      }
      status
        .run(() => this.$store.dispatch('jv/get', ['follow', { params }]))
        .then(res => {
          this.loading = false
          this.hasMore = res.length === this.pageSize
          if (type === 'change') {
            this.followingList = res
          } else {
            this.followingList = [...this.followingList, ...res]
          }
          if (res._jv) {
            this.hasMore = this.followingList.length < res._jv.json.meta.total
          }
          this.pageNum += 1
        }, e => {
          this.handleError(e)
        }).finally(() => {
          this.loading = false
        })
    },
    // 添加关注
    addFollow(userInfo, index) {
      if (!this.$store.getters['session/get']('isLogin')) {
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
          if (this.userId === this.currentLoginId) {
            this.$emit('changeFollow', { userId: this.userId })
          }
          // is_mutual 是否互相关注 1 是 0 否
          const item = this.followingList[index]
          // 深拷贝防止vuex 修改state报错
          const item2 = JSON.parse(JSON.stringify(item))
          item2.toUser.follow = res.is_mutual === 1 ? 2 : 1
          this.$set(this.followingList, index, item2)
        })
    },
    // 取消关注
    deleteFollow(userInfo, index) {
      if (!this.$store.getters['session/get']('isLogin')) {
        return
      }
      this.$store.dispatch('jv/delete', `follow/${userInfo.id}/1`).then(() => {
        if (this.userId === this.currentLoginId) {
          this.$emit('changeFollow', { userId: this.userId })
        }
        const item = this.followingList[index]
        // 深拷贝防止vuex 修改state报错
        const item2 = JSON.parse(JSON.stringify(item))
        item2.toUser.follow = 0
        this.$set(this.followingList, index, item2)
      })
    },
    loadMore() {
      if (this.hasMore) {
        // this.pageNum += 1
        this.getFollowingList()
      }
    },
    toUser(userId) {
      this.$router.push(`/pages/profile/index?userId=${userId}`)
    },
    confirm(e) {
      this.sort = e
      this.pageNum = 1
      this.followingList = []
      this.getFollowingList('change')
    },
    onClickSearch() {
      this.pageNum = 1
      this.getFollowingList('change')
    }
  }
}
</script>
<style lang="scss" scoped>
@import "@/assets/css/variable/color.scss";
.following{
  min-height: 820px;
}
.ftop {
  display: flex;
  justify-content: space-between;
  padding: 7px 20px;
  ::v-deep.h-search {
    width: 225px;
    height: 32px;
  }
  ::v-deep.fselect {
    width: 130px;
    height: 32px;
    // visibility: hidden;
  }
  ::v-deep .el-input__inner {
    height: 32px;
    color: #b5b5b5;
  }
}
.user-item-container {
  padding: 20px;
  border-bottom: 1px solid $line-color-base;
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
    margin-left: 15px;
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
    border: 1px solid #ededed;
    padding: 0 14px;
    font-size: 12px;
    height: 25px;
    line-height: 25px;
    border-radius: 18px;
    cursor: pointer;
    color: #8590a6;
    &:hover{
      color:#6d6d6d;
    }
    .follow-icon {
      color: #ff8888;
      font-size: 13px;
    }
  }
}
.empty-icon {
  width: 20px;
  height: 18px;
  margin-right: 10px;
}
.no-more2 {
  text-align: center;
  padding: 20px 0;
  color: #8590a6;
  font-size: 14px;
  min-height: 810px;
}
</style>
