<template>
  <div
    v-loading="loading"
    class="profile"
  >
    <!-- 个人主页头部 -->
    <div
      v-show="headFixed"
      class="isFixed"
    >
      <div class="headcon">
        <div class="hinfo">
          <Avatar
            :user="userInfo"
            :size="40"
            class="avatar"
          />
          <div class="profile-info">
            <span class="info-name">{{ userInfo.username || '' }}</span>
            <span class="info-actor">{{ userInfo.groups && userInfo.groups[0] && userInfo.groups[0].isDisplay ? userInfo.groupsName : '' }}</span>
          </div>
        </div>
        <el-tabs
          v-model="activeName"
          class="register-select"
          type="border-card"
          @tab-click="changeactive"
        >
          <el-tab-pane
            :label="$t('profile.topic')+ ` (${userInfo.threadCount || 0})`"
            name="1"
          />
          <el-tab-pane
            :label="$t('profile.likes')+ ` (${userInfo.likedCount || 0})`"
            name="2"
          />
          <el-tab-pane
            :label="$t('profile.following')+ ` (${userInfo.followCount || 0})`"
            name="3"
          />
          <el-tab-pane
            :label="$t('profile.followers')+ ` (${userInfo.fansCount || 0})`"
            name="4"
          />

        </el-tabs>
        <div
          v-if="userId !== currentLoginId"
          class="profile-btn2"
        >
          <!-- follow 关注状态 0：未关注 1：已关注 2：互相关注 -->
          <el-button
            type="primary"
            plain
            size="small"
            class="h-button2"
            @click="userInfo.follow == 0 ? addFollow(userInfo) : deleteFollow(userInfo)"
          > {{
            userInfo.follow == 0
              ? `+ ${$t('profile.following')}`
              : userInfo.follow == 1
                ? $t('profile.followed')
                : $t('profile.mutualfollow')
          }}</el-button>
          <el-button
            v-if="can_create_dialog"
            type="primary"
            plain
            size="small"
            class="h-button1"
            @click="chat"
          >{{ $t('profile.privateMessage') }}</el-button>
        </div>
      </div>
    </div>
    <!-- 个人主页头部2 -->
    <div
      v-if="userInfo && forums"
      class="profile-h"
    >
      <Avatar
        :user="userInfo"
        :size="100"
        class="avatar"
      />
      <div class="profile-info">
        <span class="info-name">
          {{ userInfo.username || '' }}
        </span>
        <span class="info-actor">
          <svg-icon
            v-if="userInfo && userInfo.isReal"
            type="auth"
            class="auth-icon"
          />{{ userInfo.groups && userInfo.groups[0] && userInfo.groups[0].isDisplay ? userInfo.groupsName : '' }}
        </span>
        <p
          v-if="userInfo.signature"
          class="info-content"
        >{{ userInfo.signature }}</p>
      </div>
      <div
        v-if="userId != currentLoginId"
        class="profile-btn"
      >
        <div
          v-if="!isShield"
          class="shield"
          @click="handleShield"
        >
          <svg-icon
            type="canshield"
            class="canshield-icon"
          />{{ $t('profile.shield') }}
        </div>
        <div
          v-else
          class="shield"
          @click="unbundlingUser"
        >
          <svg-icon
            type="unshield"
            class="unshield-icon"
          />{{ $t('profile.deleteshield') }}
        </div>
        <!-- follow 关注状态 0：未关注 1：已关注 2：互相关注 -->
        <el-button
          v-if="userInfo"
          type="primary"
          plain
          size="small"
          class="h-button2"
          :disabled="currentLoginId === '0'"
          @click="userInfo.follow == 0 ? addFollow(userInfo) : deleteFollow(userInfo)"
        > {{
          userInfo.follow == 0
            ? `+ ${$t('profile.following')}`
            : userInfo.follow == 1
              ? $t('profile.followed')
              : $t('profile.mutualfollow') || ''
        }}</el-button>
        <el-button
          v-if="can_create_dialog"
          type="primary"
          plain
          size="small"
          class="h-button1"
          @click="chat"
        >{{ $t('profile.privateMessage') }}</el-button>
      </div>
      <chat-box
        v-if="chatting"
        :dialog="dialog || {}"
        @close="chatting = false"
      />
    </div>
    <div
      v-if="userInfo && forums"
      class="profile-c"
    >
      <div class="profile-cc">
        <el-tabs
          v-model="activeName"
          type="border-card"
          class="register-select"
          @tab-click="changeactive"
        >
          <el-tab-pane
            :label="$t('profile.topic')+ ` (${userInfo.threadCount || 0})`"
            name="1"
          >
            <topic
              v-if="activeName === '1' "
              ref="topic"
              :user-id="userId"
            />
          </el-tab-pane>
          <el-tab-pane
            :label="$t('profile.likes')+ ` (${userInfo.likedCount || 0})`"
            name="2"
          >
            <like
              v-if="activeName === '2'"
              ref="like"
              :user-id="userId"
            />
          </el-tab-pane>
          <el-tab-pane
            :label="$t('profile.following')+ ` (${userInfo.followCount || 0})`"
            name="3"
          >
            <following
              ref="following"
              :user-id="userId"
              @changeFollow="changeFollow"
            />
          </el-tab-pane>
          <el-tab-pane
            :label="$t('profile.followers')+ ` (${userInfo.fansCount || 0})`"
            name="4"
          >
            <follwers
              ref="followers"
              :user-id="userId"
              @changeFollow="changeFollow"
            />
          </el-tab-pane>
        </el-tabs>
      </div>
      <div class="profileside">
        <advertising />
        <recommend-user class="recomusr" />
        <copyright :forums="forums" />
      </div>
    </div>
  </div>
</template>

<script>
import { status } from '@/library/jsonapi-vuex/index'
import handleError from '@/mixin/handleError'

export default {
  layout: 'custom_layout',
  mixins: [handleError],
  data() {
    return {
      userId: '', // 路由获取的用户id
      currentLoginId: this.$store.getters['session/get']('userId'), // 当前登录用户id
      userInfo: '',
      current: '', // 当前激活的tab
      activeName: '1', // 默认激活tab
      can_create_dialog: false, // 创建私信权利
      headFixed: false,
      loading: false,
      dialog: { id: '', name: '' },
      chatting: false,
      offsetTop: 0,
      isShield: false,
      unbundlingArry: [], // 解绑用户组
      unbundUserData: [] // 已屏蔽用户组
    }
  },
  computed: {
    forums() {
      return this.$store.state.site.info.attributes || {}
    }
  },
  watch: {
    '$route'(to, from) {
      this.$router.go(0)
    }
  },
  created() {
    const { userId, current } = this.$route.query
    this.userId = userId || ''
    this.current = current
    this.activeName = this.current ? this.current : this.activeName
  },
  mounted() {
    this.getAuth()
    this.getUserInfo(this.userId)
    window.addEventListener('scroll', this.handleScroll)
    if (this.currentLoginId) {
      this.getShieldData()
    }
    // this.$nextTick(() => {
    //   this.offsetTop = document.querySelector('.profile-h').offsetTop
    // })
  },
  destroyed() {
    window.removeEventListener('scroll', this.handleScroll)
  },
  methods: {
    handleScroll() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
      if (scrollTop > 220) {
        this.headFixed = true
      } else {
        this.headFixed = false
      }
    },
    // tab激活
    changeactive(e) {
    },
    // 私信权限判断
    getAuth() {
      // 用户组等改变会改变私信权限
      console.log('用户信息', this.forums)
      if (this.forums.other && this.forums.other.can_create_dialog) {
        this.can_create_dialog = true
      } else {
        this.can_create_dialog = false
      }
    },
    // 获取用户信息
    getUserInfo(userId) {
      this.loading = true
      const params = {
        include: 'groups,dialog'
      }
      status
        .run(() => this.$store
          .dispatch('jv/get', [`users/${userId}`, { params }])
          .then(res => {
            console.log('关注与取消关注用户信息重新获取', res)
            if (res.isDeleted) {
              this.$message.error('用户不存在')
            } else {
              this.loading = false
              this.dialog.id = res.dialog ? res.dialog._jv.id : 0
              this.dialog.name = res.username
              this.userInfo = res
              this.userInfo.groupsName = this.userInfo.groups ? this.userInfo.groups[0].name : ''
            }
          }))
        .catch(err => {
          this.loading = false
          this.handleError(err)
        })
    },
    // 添加关注
    addFollow(userInfo) {
      if (process.client) {
        if (!localStorage.getItem('access_token')) {
          return
        }
      }
      if (this.isShield2) {
        this.$message.error('你已被屏蔽')
        return
      }
      const params = {
        _jv: {
          type: 'follow'
        },
        type: 'user_follow',
        to_user_id: userInfo.id.toString()
      }
      this.$store.dispatch('jv/post', params)
        .then(() => {
          this.getUserInfo(this.userId)
          if (this.$refs.followers) this.$refs.followers.getFollowerList('change')
        }, e => this.handleError(e))
    },
    // 取消关注
    deleteFollow(userInfo) {
      if (process.client) {
        if (!localStorage.getItem('access_token')) {
          return
        }
      }
      console.log('取消关注')
      this.$store.dispatch('jv/delete', `follow/${userInfo.id}/1`).then(() => {
        console.log('取消关注2')
        this.getUserInfo(this.userId)
        if (this.$refs.followers) this.$refs.followers.getFollowerList('change')
      })
    },
    changeFollow(e) {
      this.getUserInfo(e.userId)
    },
    // 私信
    chat() {
      if (process.client) {
        if (!localStorage.getItem('access_token')) {
          return
        }
      }
      this.chatting = true
    },
    // 当前登录用户已屏蔽用户
    // 获取黑名单数据
    getShieldData() {
      this.loading = true
      this.$store.dispatch('jv/get', `users/${this.currentLoginId}/deny`).then(res => {
        if (res._jv) {
          delete res._jv
        }
        this.unbundUserData = []
        this.unbundUserData.push(Number(this.currentLoginId))
        res.forEach((v, i) => {
          this.unbundUserData.push(res[i].id)
        })
        const data = res.filter(item => {
          return item.id.toString() === this.userId
        })
        this.isShield = data.length > 0
        console.log('当前查看用户是否已经被屏蔽', data)
        console.log('和名单数据', res)
      }, e => this.handleError(e)).finally(() => { this.loading = false })
    },
    // 屏蔽用户
    handleShield() {
      if (process.client) {
        if (!localStorage.getItem('access_token')) {
          return
        }
      }
      const params = {
        _jv: {
          type: `users/${this.userId}/deny`
        }
      }
      this.$store.dispatch('jv/post', params).then(() => {
        console.log('屏蔽')
        this.getShieldData()
      })
    },
    // 解绑用户
    unbundlingUser() {
      if (process.client) {
        if (!localStorage.getItem('access_token')) {
          return
        }
      }
      this.$store.dispatch('jv/delete', `users/${this.userId}/deny`).then(() => {
        console.log('解除屏蔽')
        this.$t('profile.unboundsucceed')
        this.getShieldData()
      })
    }

  },
  head() {
    return {
      title: this.$t('profile.myperson')
    }
  }
}
</script>
<style lang='scss' scoped>
@import "@/assets/css/variable/color.scss";

.profile {
  width: 100%;
  .profile-h {
    width: 100%;
    display: flex;
    padding: 20px;
    background: rgba(255, 255, 255, 1);
    border-radius: 5px;
    .profile-info {
      flex: 4;
      margin-left: 20px;
      margin-right: 0px;
      margin-top: 20px;
      .info-name {
        font-size: 18px;
        font-weight: bold;
        margin-right: 5px;
        color: #000000;
        line-height: 24px;
        display: inline-block;
      }
      .info-actor {
        color: #aaaaaa;
        line-height: 19px;
        display: inline-block;
        .auth-icon {
          width: 11px;
          height: 13px;
          margin-right: 9px;
          vertical-align: text-top;
        }
      }
      .info-content {
        color: #333333;
        margin-top: 10px;
        width: 680px;
        overflow: hidden;
        /* height: 80px; */
        overflow-wrap: break-word;
        /* line-break: anywhere; */
        text-overflow: ellipsis;
        @media screen and (max-width: 1005px) {
          width: 600px;
        }
        @media screen and (max-width: 930px) {
          width: 510px;
        }
        @media screen and (max-width: 830px) {
          width: 430px;
        }
      }
    }
  }
  .profile-btn {
    display: flex;
    align-items: flex-end;
    position: relative;
    .shield {
      position: absolute;
      right: 1px;
      top: 24px;
      color: #b5b5b5;
      cursor: pointer;
    }
    .canshield-icon {
      width: 14px;
      height: 7px;
      margin-bottom: 2px;
      margin-right: 6px;
    }
    .unshield-icon {
      width: 14px;
      height: 11px;
      margin-bottom: 1px;
      margin-right: 6px;
    }
    .h-button1 {
      width: 70px;
      height: 35px;
      color: #1878f3;
      background: #ffffff !important;
      border: 1px solid #1878f3 !important;
      border-color: #1878f3 !important;
      font-size: 14px;
      border-radius: 0px;
      margin-left: 5px;
      padding: 9px 0px;
      &:hover{
        background:#e5f2ff !important;
        border-color: #d4e6fc !important;
      }
    }
    .h-button2 {
      width: 70px;
      height: 35px;
      color: #ffff;
      background: #1878f3;
      border-color: #1878f3;
      font-size: 14px;
      border-radius: 0px;
      padding: 9px 0px;
    }
  }
}
.profile-c {
  display: flex;
  .profileside {
    width: 300px;
    margin-top: 15px;
    .recomusr {
      background: white;
      // margin-top: 16px;
      border-radius: 5px;
    }
  }
  .register-select {
    border: none;
    background: #ffffff;
    box-shadow: none;
    border-radius: 5px;
    ::v-deep.el-tabs__header {
      padding: 8px 20px 5px;
      border-bottom: 1px solid #f5f5f5;
    }
  }
  .profile-cc {
    width: 700px;
    margin: 15px 15px 0 0;
  }
}
.isFixed {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 65px;
  background: rgba(255, 255, 255, 1);
  box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.03);
  z-index: 999;
  .headcon {
    margin: 0 auto;
    padding: 15px 0;
    width: 1005px;
    height: 65px;
    display: flex;
    justify-content: space-between;
    @media screen and (max-width: 1005px) {
      width: 100%;
      min-width: 768px;
      padding: 15px 14px;
      height: 50px;
    }
    .hinfo {
      display: flex;
    }
    .profile-info {
      display: flex;
      flex-direction: column;
      // flex: 1;
      margin-left: 10px;
      .info-name {
        font-size: 16px;
        font-weight: bold;
        margin-right: 10px;
        color: #000000;
      }
      .info-actor {
        font-size: 12px;
        color: #aaaaaa;
      }
    }
    .register-select {
      border: none;
      background: transparent;
      box-shadow: none;
      // flex: 3;
    }
    .profile-btn2 {
      // flex: 1;
      .h-button1 {
        width: 70px;
        height: 35px;
        color: #1878f3;
        background: #ffffff !important;
        border: 1px solid #1878f3 !important;
        border-color: #1878f3 !important;
        font-size: 14px;
        border-radius: 0px;
        margin-left: 0px;
        padding: 9px 0px;
      }
      .h-button2 {
        width: 70px;
        height: 35px;
        color: #ffff;
        background: #1878f3;
        border-color: #1878f3;
        font-size: 14px;
        border-radius: 0px;
        padding: 9px 0px;
      }
    }
    ::v-deep .el-tabs__content {
      display: none;
    }
    ::v-deep .el-tabs__header {
      border-bottom: none;
    }
  }
}

::v-deep.el-tabs {
  .el-tabs__header {
    background: transparent;
  }
  .el-tabs__header .el-tabs__item {
    border: none;
    color: #b5b5b5;
    padding: 0 52px 0 0px;
    font-size: 14px;
    transition: none;
  }
  .el-tabs__content {
    padding: 0;
  }
  .el-tabs__header .el-tabs__item:nth-child(2) {
    padding-left: 0px;
  }
  .el-tabs__header .el-tabs__item.is-active {
    color: black;
    background: transparent;
    border: none;
    font-weight: bold;
    font-size: 16px;
  }
  .el-tabs__header .el-tabs__item:hover {
    color: $color-blue-deep;
  }
  .el-tabs__nav-wrap {
    margin-bottom: 0px;
    height: 40px;
  }
  .el-input__inner {
    border-radius: 2px;
  }
  .el-button {
    border-radius: 0px;
  }
  .el-input__inner:focus {
    border-color: #dcdfe6;
  }
  .el-input__inner:hover {
    border-color: #dcdfe6;
  }
}
</style>
