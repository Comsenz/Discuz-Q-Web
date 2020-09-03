<template>
  <div class="site-info-container">
    <div v-if="forums">
      <el-image
        :src="forums.set_site && forums.set_site.site_logo ? forums.set_site.site_logo : require('static/logo.png')"
        alt="logo"
        class="logo"
      />
      <div class="site-info">
        <div class="avatar">
          <avatar :user="{ username: forums.set_site && forums.set_site.site_author.username, avatarUrl: forums.set_site && forums.set_site.site_author.avatar}" :size="40" :round="true" />
          <div class="right">
            <div class="label">{{ $t('site.circlemaster') }}</div>
            <div class="value name text-hidden">{{ forums.set_site && forums.set_site.site_author.username }}</div>
          </div>
        </div>
        <div class="member">
          <div class="label">{{ $t('home.theme') }}</div>
          <div class="value">{{ forums.other && forums.other.count_users }}</div>
        </div>
        <div class="threads">
          <div class="label">{{ $t('manage.contents') }}</div>
          <div class="value">{{ forums.other && forums.other.count_threads }}</div>
        </div>
        <div class="create-time">
          <div class="label">{{ $t('manage.creationtime') }}</div>
          <div v-if="forums.set_site && forums.set_site.site_install" class="value">{{ (forums.set_site && forums.set_site.site_install).substr(0, 10) }}</div>
        </div>
      </div>
      <div class="site-detail">
        <div class="header">
          <div class="title base-font-size">{{ $t('manage.siteintroduction') }}</div>
          <div class="modify">{{ $t('profile.modify') }}</div>
        </div>
        <div class="content base-font-size">
          {{ forums.set_site && forums.set_site.site_introduction }}
        </div>
      </div>
      <div v-if="forums.set_site" class="circlemode">
        <div class="title base-font-size">{{ $t('site.circlemode') }} \ {{ $t('site.price') }}</div>
        <div v-if="forums.set_site.site_mode === 'public'" class="content base-font-size grey-color">{{ $t('site.publicmode') }} \ {{ $t('post.free') }}  </div>
        <div v-else class="content base-font-size grey-color">{{ $t('site.paymentmode') }} \ {{ $t('post.yuanItem') }}{{ forums.set_site.site_price }}（{{ $t('site.periodvalidity') + forums.set_site.site_expire + $t('site.day') }}）</div>
      </div>
      <div class="permission">
        <div class="title base-font-size">{{ $t('site.circlemode') }}\{{ $t('site.price') }}</div>
        <div v-if="userInfo" class="user-detail">
          <div class="avatar">
            <avatar :user="{ id: userInfo.id, username: userInfo.username, avatarUrl: userInfo.avatarUrl}" :prevent-jump="true" :size="50" :round="true" />
          </div>
          <div class="user-info">
            <div class="name base-font-size">{{ userInfo.username }}</div>
            <div class="role">{{ $t('site.role') }}:{{ forums.user && forums.user.groups && forums.user.groups.length > 0 && forums.user.groups[0].name || '' }}</div>
            <div v-if="userInfo.joinedAt" class="join-time">{{ $t('manage.joinedTime') }}:{{ userInfo.joinedAt.substr(0, 10) }}
              <template v-if="forums.set_site.site_mode === 'pay'">,{{ $t('site.periodvalidity') + $t('site.to') + handleExpiredAt(userInfo.expiredAt) }}
                <template v-if="userInfo.expiredAt">({{ $t('pay.surplus') + handleDays(userInfo.expiredAt) + $t('site.day') }})</template>
              </template>
            </div>
            <div class="permission-list">
              <div v-for="(item, index) in permissionList" :key="index" class="item">
                {{ $t(`permission.${item.permission}`) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import forums from '@/mixin/forums'
import { timestamp2day } from '@/utils/time'
export default {
  name: 'SiteInfo',
  mixins: [forums],
  // meta: {
  //   requiresAuth: true
  // },
  data() {
    return {
      userId: this.$store.state.user.info.id, // 获取当前登陆用户的ID
      permissionList: [] // 用户权限
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.user.info.attributes || {}
    }
  },
  mounted() {
    this.getPermissions()
    console.log('state', this.$store.state)
  },
  methods: {
    // 调用 用户组权限 接口
    getPermissions() {
      const params = {
        'filter[type]': 'invite',
        include: ['permission']
      }
      this.$store.dispatch('jv/get', ['groups', { params }]).then(res => {
        const groupsId = this.forums.user && this.forums.user.groups && this.forums.user.groups.length > 0 && this.forums.user.groups[0].id
        res.forEach(item => {
          if (+item._jv.id === +groupsId) {
            this.permissionList = item.permission
          }
        })
        console.log('用户权限', this.permissionList)
      })
    },
    handleExpiredAt(date) {
      if (date) {
        return date.substr(0, 10)
      } else {
        return this.$t('site.permanent')
      }
    },
    handleDays(date) {
      const _date = Math.round(new Date(date) / 1000)
      return timestamp2day(_date)
    }
  }
}
</script>
<style lang='scss' scoped>
@import '@/assets/css/variable/color.scss';
.site-info-container{
  padding-right:30px;
}
.logo{
  width: 294px;
}
.grey-color{
  color: $font-color-grey;
}
.title{
  color:#8c8c8c;
}
.base-font-size{
  font-size: 16px;
}
.site-info{
  display: flex;
  justify-content: space-between;
  margin-top: 25px;
  .avatar{
    display: flex;
    align-items: center;
    .right{
      margin-left:10px;
      .name{
        max-width:150px;
      }
    }
  }
  .label{
    color:#6D6D6D
  }
  .value{
    color: $font-color-grey;
    font-size: 18px;
    margin-top: 2px;
  }
}
.site-detail{
  margin-top:30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #E4E4E4;
  .header{
    display: flex;
    justify-content: space-between;
    .modify{
      color:$color-blue-base;
      cursor: pointer;
      outline:none;
    }
  }
  .content{
    margin-top: 15px;
    color: #000;
  }
}
.circlemode{
  margin-top: 20px;
  border-bottom: 1px solid #E4E4E4;
  padding-bottom: 20px;
  .content{
    margin-top: 12px;
    margin-left: 20px;
  }
}
.permission{
  margin-top: 20px;
  .user-detail{
    display: flex;
    margin-top: 12px;
    .avatar{
      flex:0 0 50px;
    }
    .user-info{
      margin-left:15px;
      .role,.join-time{
        color: $font-color-grey;
      }
      .permission-list{
        margin-top:15px;
        .item{
          display: inline-block;
          font-size:12px;
          color: #777777;
          background-color: #F7F7F7;
          padding:4px 10px;
          line-height: 1;
          margin-right:10px;
          margin-bottom:10px;
        }
      }
    }
  }
}
</style>
