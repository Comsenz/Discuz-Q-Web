<template>
  <div class="profile">
    <!-- 个人主页头部 -->
    <div class="profile-h">
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
          type="primary"
          plain
          size="small"
          class="h-button2"
        >+ {{ $t('profile.following') }}</el-button>
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
    <div class="profile-c">
      <div style="width:700px;padding:20px">
        <el-tabs
          :value="activeName"
          type="border-card"
          class="register-select"
          @tab-click="changeactive"
        >
          <el-tab-pane
            :label="$t('profile.topic')+ ` (${userInfo.threadCount})`"
            name="1"
          >11111111</el-tab-pane>
          <el-tab-pane
            :label="$t('profile.following')+ ` (${userInfo.fansCount})`"
            name="2"
          >22222222</el-tab-pane>
          <el-tab-pane
            :label="$t('profile.followers')+ ` (${userInfo.followCount})`"
            name="3"
          >333333333</el-tab-pane>
          <el-tab-pane
            :label="$t('profile.likes')+ ` (${userInfo.likedCount})`"
            name="4"
          >444444444444</el-tab-pane>
        </el-tabs>
      </div>
      <div style="width:300px;">
        <advertising />
        <recommend-user style="background: white;margin-top: 16px;" />
        <copyright :forums="forums" />
      </div>
    </div>
  </div>
</template>

<script>
import forums from '@/mixin/forums'

export default {
  layout: 'custom_layout',
  mixins: [forums],
  data() {
    return {
      userId: 0, // 路由获取的用户id
      currentLoginId: this.$store.getters['session/get']('userId'), // 当前登录用户id
      userInfo: '',
      current: '', // 当前激活的tab
      activeName: '2', // 默认激活tab
      can_create_dialog: false // 创建私信权利
    }
  },
  created() {
    const { userId, current } = this.$route.query
    this.userId = userId || this.currentLoginId
    this.current = current
    this.changeactive()
    this.userinfo()
    this.getAuth()
  },
  methods: {
    userinfo() {
      const params = {
        include: 'groups'
      }
      this.$store.dispatch('jv/get', [`users/${this.userId}`, { params }]).then(res => {
        console.log('useriinfo', res)
        this.userInfo = res
        this.userInfo.groupsName = this.userInfo.groups ? this.userInfo.groups[0].name : ''
      })
    },
    // tab激活
    changeactive() {
      this.activeName = this.current
      console.log(this.activeName)
    },
    // 私信权限判断
    getAuth() {
      // 用户组等改变会改变私信权限
      const params = {
        include: 'users'
      }
      this.$store.dispatch('jv/get', [`forum`, { params }]).then(res => {
        if (res.other && res.other.can_create_dialog) {
          this.can_create_dialog = true
        } else {
          this.can_create_dialog = false
        }
      })
    },
    // 私信
    chat() {
      console.log('私信')
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
      }
    }
    .profile-btn {
      flex: 1;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      .h-button1 {
        width: 70px;
        height: 35px;
        color: #1878f3;
        background: #ffffff;
        border-color: #1878f3;
        font-size: 14px;
        border-radius: 0px;
        margin-left: 0px;
      }
      .h-button2 {
        width: 70px;
        height: 35px;
        color: #ffff;
        background: #1878f3;
        border-color: #1878f3;
        font-size: 14px;
        border-radius: 0px;
      }
    }
  }
  .profile-c {
    display: flex;
    .register-select {
      border: none;
      background: transparent;
      box-shadow: none;
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
