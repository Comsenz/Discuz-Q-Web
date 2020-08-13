<template>
  <div class="info">
    <!-- 有偿加入 -->
    <h2 class="info-title">{{ $t('manage.payJoin') }}</h2>
    <!-- 站点内容部分-->
    <div class="content-info abs">
      <!-- 付费信息标题 -->
      <p class="payinfo-title">{{ $t('manage.inviteInfoTitle') }}</p>
      <!-- 创建时间 -->
      <p>
        <span class="color">{{ $t('site.creationtime') }}</span>
        <span class="workdate">{{ forums.set_site && forums.set_site.site_install }}</span>
      </p>
      <!-- 圈子主人 -->
      <p>
        <span class="date color">{{ $t('site.circlemaster') }}</span>
        <span class="img">
          <img
            :src="forums.set_site && forums.set_site.site_author.avatar"
            alt=""
          >
        </span>
        <span class="workdate">{{ forums.set_site && forums.set_site.site_author.username }}</span>
      </p>
      <!-- 用户 -->
      <p>
        <span class="date color">{{ $t('home.theme') }}</span>
        <span class="workdate bold">{{ forums.other && forums.other.count_users }}</span>
      </p>
      <p class="member-img">
        <span
          v-for="(item, index) in userList"
          :key="index"
          class="img"
        >
          <img
            :src="item.avatarUrl ? item.avatarUrl : require('static/logo.png')"
            alt=""
          >
        </span>
      </p>
      <!-- 内容数量 -->
      <p>
        <span class="date color">{{ $t('manage.contents') }}</span>
        <span class="workdate bold">{{ forums.other && forums.other.count_threads }}</span>
      </p>
      <!-- 站点模式 -->
      <p>
        <span class="date color ">{{ $t('site.circlemode') }}</span>
        <span class="workdate">
          {{ forums.set_site && forums.set_site.site_mode === 'pay' ? $t('site.paymentmode') +'， ' + '¥'+ ((forums.set_site && forums.set_site.site_price) || 0)+$t('post.yuan')+'， ' + $t('site.periodvalidity') +
            ((forums.set_site && forums.set_site.site_expire) || 0 )+ $t('site.day'):$t('site.publicmode') }}
        </span>
      </p>
      <!-- 我的权利 -->
      <div class="myauthority">
        <div class="myauth-t "> {{ $t('site.myauthority') }} </div>
        <div class="myauth-c">
          <span
            v-for="(item, index) in permission"
            :key="index"
          >{{ $t(`permission.${item.permission}`) }}</span> </div>
      </div>

      <!-- 站点介绍 -->
      <p>
        <span class="date color rel">{{ $t('manage.siteintroduction') }}</span>
        <span class="workdate2">{{ forums.set_site && forums.set_site.site_introduction }}</span>
      </p>
    </div>
    <p>
      <span class="bold">{{ inviteData.user && inviteData.user.username }}</span>
      邀请您，作为
      <span class="bold">{{ `[ ${inviteData.group && inviteData.group.name} ]` }}</span>加入
      <span class="bold">{{ forums.set_site && forums.set_site.site_name }}</span>
      {{ $t('site.site') }}
    </p>
    <p>
      <el-button
        type="primary"
        class="r-button"
        @click="check"
      >
        {{ $t('site.accepttheinvitationandbecome') }}
        {{ inviteData.group && inviteData.group.name }}
      </el-button>
    </p>
    <!-- 验证提示 -->
    <el-dialog
      title="提示"
      :visible.sync="dialogVisible"
      width="30%"
      :before-close="handleClose"
    >
      <span>{{ codeTips }}</span>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          @click="submit"
        >确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { status } from '@/library/jsonapi-vuex/index'
import forums from '@/mixin/forums'
export default {
  mixins: [
    forums
  ],
  data() {
    return {
      isLogin: '',
      pageSize: 20,
      pageNum: 1,
      userList: [],
      searchText: '',
      permission: [], // 权利
      inviteData: {}, // 邀请信息
      dialogVisible: false,
      codeTips: ''

    }
  },
  mounted() {
    this.isLoginh()
    this.searchUser() // 站点数据没有用户数据，这里自行请求user接口
    this.getInviteInfo(this.$route.query)
    console.log(this.$route.query)
  },
  methods: {
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done()
        })
        .catch(_ => { })
    },
    isLoginh() {
      this.isLogin = !!window.localStorage.getItem('access_token')
      console.log(this.isLogin)
    },
    async searchUser() {
      const params = {
        include: 'groups',
        'page[number]': this.pageNum,
        'page[limit]': this.pageSize,
        'filter[username]': `*${this.searchText}*`
      }
      if (this.searchText === '') {
        await this.$store.dispatch('jv/get', ['users', { params }]).then(res => {
          console.log('获取20个用户信息：', res)
          if (res && res._jv) {
            this.userList = [...this.userList, ...res]
          }
        })
      }
    },
    async getInviteInfo(code) {
      await status
        .run(() => this.$store.dispatch('jv/get', `invite/bEwmC2YrhEiKSIE6G9oEsO7MesQsjH36`)
          .then(res => {
            this.inviteData = res
            res._jv.json.included.splice(0, 2)
            this.permission = res.group.permission
            console.log(this.permission)
            console.log(res._jv.json.included[0].attributes.permission)
            console.log(res)
          })
        )
    },
    // 验证码验证
    check() {
      // 处理邀请码状态 status 0 失效  1 未使用  2 已使用 3 已过期
      const statusVal =
        this.inviteData.status || this.inviteData.status === 0 ? this.inviteData.status : 'error'
      console.log(this.inviteData.status)
      switch (statusVal) {
        case 0: {
          this.codeTips = this.$t('site.codeinvalid')
          this.dialogVisible = true
          break
        }
        case 1: {
          this.submit()
          break
        }
        case 2: {
          this.codeTips = this.$t('site.codeused')
          this.dialogVisible = true

          break
        }
        case 3: {
          this.codeTips = this.$t('site.codeexpired')
          this.dialogVisible = true

          break
        }
        case 'error': {
          this.codeTips = this.$t('site.codenotfound')
          this.dialogVisible = true

          break
        }
        default:
          return ''
      }
    },
    // 验证码提交
    submit() {
      this.dialogVisible = false
      // 未登陆的情况
      if (!localStorage.getItem('access_token')) {
        alert('登陆')
        // 需要引入mixins loginauth.js
        // this.handleLogin(this.code)
      } else {
        // 已经登陆的情况
        console.log(this.forums.set_reg.register_type)
        if (this.forums.set_reg.register_type === 2) {
          // 无感模式
          this.$router.push('/')
        } else {
          this.$message.error(this.$t('site.codeforbid'))
        }
      }
    }
  }
}
</script>
<style lang='scss' scoped>
.bold {
  font-weight: bold;
}
.abs {
  position: relative;
}
.rel {
  position: absolute;
}
.color {
  color: #909399;
  margin-right: 15px;
}
.info {
  display: flex;
  width: 400px;
  margin-top: 62px;
  flex-direction: column;
  .info-title {
    width: 130px;
    height: 35px;
    font-size: 26px;
  }
  .payinfo {
    border-bottom: 1px solid #efefef;
    margin-top: 34px;
    color: #000000;
    padding-bottom: 30px;
  }
  .payinfo-title {
    font-size: 18px;
    font-family: Microsoft YaHei;
    font-weight: 400;
  }
  .date {
    width: 56px;
    text-align: right;
  }
  span {
    display: inline-block;
  }
  p {
    margin-top: 15px;
  }
  .paymoney {
    text-align: center;
    // width: 90px;
    font-weight: bold;
    font-size: 16px;
  }
  .workdate {
    // width: 130px;
    text-align: center;
    font-size: 16px;
    font-family: Microsoft YaHei;
  }
  .workdate2 {
    // position: absolute;
    // width: 326px;
    font-weight: 400;
    word-break: break-all;
    font-family: Microsoft YaHei;
    color: #6d6d6d;
    font-size: 14px;
    margin-left: 75px;
  }
  .workdate3 {
    // position: absolute;
    // width: 326px;
    font-weight: 400;
    word-break: break-all;
    font-family: Microsoft YaHei;
    color: #6d6d6d;
    font-size: 12px;
    margin-left: 75px;
    background: #efefef;
    margin-top: 5px;
  }
  .content-info {
    margin-top: 34px;
    // min-height: 330px;
    .img {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      // background: red;
      vertical-align: bottom;
      margin-right: 5px;
      // border:1px soild #efefef;
      img {
        border-radius: 50%;
        width: 30px;
        // height: 30px;
      }
    }
    .member-img {
      margin-left: 76px;
    }
  }
  .r-button {
    width: 300px;
    // margin-left: 70px;
    margin-top: 20px;
    margin-bottom: 60px;
    background: #1878f3;
  }
  .myauthority {
    margin-top: 15px;
    display: flex;

    .myauth-t {
      flex: 1;
      color: #909399;
    }
    .myauth-c {
      flex: 4;
      font-size: 12px;
      font-family: Microsoft YaHei;
      margin-right: 25px;
      color: #777777;
      span {
        margin-right: 5px;
        background: #f7f7f7;
        margin-top: 5px;
        padding: 4px 10px;
      }
    }
  }
}
</style>
