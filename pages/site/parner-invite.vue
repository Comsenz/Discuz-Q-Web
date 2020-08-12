<template>
  <div class="info">
    <!-- 有偿加入 -->
    <h2 class="info-title">{{ $t('manage.payJoin') }}</h2>
    <!-- 站点内容部分-->
    <div class="content-info abs">
      <p class="payinfo-title">{{ $t('manage.payInfoTitle') }}</p>
      <p>
        <span class="color">{{ $t('site.creationtime') }}</span><span class="workdate">2018年01月01日</span>
      </p>
      <p>
        <span class="date color">{{ $t('site.circlemaster') }}</span>
        <span class="img">
          <img
            :src="forums.set_site && forums.set_site.site_author.avatar"
            alt=""
          ></span><span class="workdate">{{ forums.set_site && forums.set_site.site_author.username }}</span>
      </p>
      <p>
        <span class="date color">{{ $t('home.theme') }}</span><span class="workdate">{{ forums.other && forums.other.count_users }}</span>
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
      <p>
        <span class="date color ">{{ $t('manage.contents') }}</span><span class="workdate">{{ forums.other && forums.other.count_threads }}</span>
      </p>
      <p>
        <span class="date color ">{{ $t('site.circlemode') }}</span>
        <span class="workdate">
          {{ forums.set_site && forums.set_site.site_mode === 'pay' ? $t('site.paymentmode') +'， ' + '¥'+ ((forums.set_site && forums.set_site.site_price) || 0)+$t('post.yuan')+'， ' + $t('site.periodvalidity') +
            ((forums.set_site && forums.set_site.site_expire) || 0 )+ $t('site.day'):$t('site.publicmode') }}
        </span>
      </p>
      <p>
        <span class="date color rel">{{ $t('site.myauthority') }}</span>
        <span
          v-for="(item, index) in permission"
          :key="index"
          class="workdate3"
        >
          {{ $t(`permission.${item.attributes.permission}`) }}
        </span>
      </p>
      <p>
        <span class="date color rel">{{ $t('manage.siteintroduction') }}</span>
        <span class="workdate2">{{ forums.set_site && forums.set_site.site_introduction }}</span>
      </p>
    </div>
    <!-- <p
      v-if="isLogin"
      v-cloak
    >
      <span>{{ $t('site.justonelaststepjoinnow') }}</span>
      <span class="site-invite__detail__bold">
        {{ forums.set_site && forums.set_site.site_name }}
      </span>
      <span>{{ $t('site.site') }}</span>
      <el-button
        type="primary"
        class="r-button"
      >{{ $t('site.paynow') }}，¥{{ (forums.set_site && forums.set_site.site_price) || 0 }}
        {{
          forums.set_site && forums.set_site.site_expire
            ? `  / ${$t('site.periodvalidity')}${forums.set_site &&
              forums.set_site.site_expire}${$('site.day')}`
            : ` / ${$t('site.permanent')}`
        }}</el-button>
    </p>
    <p
      v-if="!isLogin"
      v-cloak
    >
      <el-button
        type="primary"
        class="r-button"
      >{{ $t('site.join') }}{{ $t('site.site') }}</el-button>
    </p> -->
    <p>
      {{ inviteData.user && inviteData.user.username }}
      {{ `[ ${inviteData.group && inviteData.group.name} ]` }}
      {{ forums.set_site && forums.set_site.site_name }}
      {{ $t('site.site') }}
    </p>
    <p>
      <el-button
        type="primary"
        class="r-button"
      >
        {{ $t('site.accepttheinvitationandbecome') }}
        {{ inviteData.group && inviteData.group.name }}
      </el-button>
    </p>
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
      inviteData: {} // 邀请信息

    }
  },
  mounted() {
    this.isLoginh()
    this.searchUser() // 站点数据没有用户数据，这里自行请求user接口
    this.getInviteInfo(this.$route.query)
    console.log(this.$route.query)
  },
  methods: {
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
            this.permission = res._jv.json.included
            console.log(this.permission)
            console.log(res._jv.json.included[0].attributes.permission)
            console.log(res)
          })
        )
    }
  }
}
</script>
<style lang='scss' scoped>
[v-cloak] {
  display: none;
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
    font-weight: 400;
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
      margin-left: 70px;
    }
  }
  .r-button {
    width: 300px;
    // margin-left: 70px;
    margin-top: 20px;
    margin-bottom: 60px;
    background: #1878f3;
  }
}
</style>
