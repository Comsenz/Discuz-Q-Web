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
            <span class="info-actor">{{ userInfo.groupsName }}</span>
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
          class="profile-btn"
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
        <span class="info-name">{{ userInfo.username || '' }}</span>
        <span class="info-actor">{{ userInfo.groupsName }}</span>
        <p
          v-if="userInfo.signature"
          class="info-content"
        >{{ userInfo.signature }}</p>
      </div>
      <div
        v-if="userId != currentLoginId"
        class="profile-btn"
      >
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
    <div class="profile-c">
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
            <topic :user-id="userId" />
          </el-tab-pane>
          <el-tab-pane
            :label="$t('profile.likes')+ ` (${userInfo.likedCount || 0})`"
            name="2"
          >
            <like :user-id="userId" />
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
      <div style="width:300px; margin-top:15px;">
        <advertisingp :user-id="userId" />
        <recommend-user style="background: white;margin-top: 16px;" />
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
      userId: 0, // 路由获取的用户id
      currentLoginId: this.$store.getters['session/get']('userId'), // 当前登录用户id
      userInfo: '',
      current: '', // 当前激活的tab
      activeName: '1', // 默认激活tab
      can_create_dialog: false, // 创建私信权利
      headFixed: false,
      loading: false,
      dialog: { id: '', name: '' },
      chatting: false,
      offsetTop: 0

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
    this.userId = userId || this.currentLoginId
    this.current = current
    this.changeactive()
    this.getUserInfo(this.userId)
    this.getAuth()
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll)
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
      // const offsetTop = document.querySelector('.profile-h').offsetTop
      // console.log(scrollTop)
      // console.log(offsetTop)
      if (scrollTop > 220) {
        this.headFixed = true
      } else {
        this.headFixed = false
      }
    },
    // tab激活
    changeactive() {
      this.activeName = this.current ? this.current : this.activeName
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
        })
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
      this.chatting = true
    }
  }
}
</script>
<style lang='scss' scoped>
.profile {
  width: 100%;
  .profile-h {
    width: 100%;
    display: flex;
    padding: 20px;
    background: rgba(255, 255, 255, 1);
    .profile-info {
      flex: 4;
      margin-left: 20px;
      margin-right: 0px;
      margin-top: 20px;
      .info-name {
        font-size: 18px;
        font-weight: bold;
        margin-right: 10px;
        color: #000000;
      }
      .info-actor {
        color: #aaaaaa;
      }
      .info-content {
        color: #333333;
        margin-top: 10px;
        width: 700px;
        overflow: hidden;
        /* height: 80px; */
        overflow-wrap: break-word;
        /* line-break: anywhere; */
        text-overflow: ellipsis;
      }
    }
  }
  .profile-btn {
    // flex: 1;
    display: flex;
    align-items: flex-end;
    // justify-content: space-between;
    .h-button1 {
      width: 70px;
      height: 35px;
      color: #1878f3;
      background: #ffffff;
      border-color: #1878f3;
      font-size: 14px;
      border-radius: 0px;
      margin-left: 5px;
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
}
.profile-c {
  display: flex;
  .register-select {
    border: none;
    background: #ffffff;
    box-shadow: none;
    ::v-deep.el-tabs__header {
      padding: 20px;
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
    .profile-btn {
      // flex: 1;
      .h-button1 {
        width: 70px;
        height: 35px;
        color: #1878f3;
        background: #ffffff;
        border-color: #1878f3;
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
    font-size: 16px;
  }
  .el-tabs__content {
    padding: 10px 0;
  }
  .el-tabs__header .el-tabs__item:nth-child(2) {
    padding-left: 0px;
  }
  .el-tabs__header .el-tabs__item.is-active {
    color: black;
    background: transparent;
    border: none;
    font-weight: bold;
    font-size: 18px;
  }
  .el-tabs__nav-wrap {
    margin-bottom: 0px;
  }
  .el-input__inner {
    border-radius: 0px;
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
