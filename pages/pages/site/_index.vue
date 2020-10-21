<template>
  <div class="site-info-container">
    <div v-if="forums">
      <img
        :src="forums.set_site && forums.set_site.site_logo ? forums.set_site.site_logo : require('@/assets/logo.png')"
        alt="logo"
        class="logo"
      >
      <div class="site-info">
        <div class="avatar">
          <avatar
            v-if="forums.set_site && forums.set_site.site_author"
            :user="{
              id:forums.set_site.site_author.id,
              username: forums.set_site.site_author.username,
              avatarUrl: forums.set_site.site_author.avatar
            }"
            :size="40"
            :round="true"
          />
          <avatar v-else :user="{ id: 0, username: '无', avatarUrl: ''}" :prevent-jump="true" :size="40" :round="true" />
          <div v-if="forums.set_site && forums.set_site.site_author" class="right">
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
          <div v-if="forums && forums.set_site && forums.set_site.site_install" class="value">
            {{ (forums.set_site && forums.set_site.site_install).substr(0, 10) }}
          </div>
        </div>
      </div>
      <div class="site-detail">
        <div class="header">
          <div class="title base-font-size">{{ $t('manage.siteintroduction') }}</div>
          <div v-if="+groupsId === 1" class="modify" @click="handleModify">
            {{ isModify ? $t('profile.cancelModify') : $t('profile.modify') }}
          </div>
        </div>
        <div v-if="forums && forums.set_site" v-loading="loading" class="content base-font-size">
          <template v-if="isModify">
            <el-input v-model="inputInfo" type="textarea" :rows="5" />
            <el-button type="primary" class="confirm-btn" @click="confirmModify">
              {{ $t('profile.confirmModify') }}
            </el-button>
          </template>
          <template v-else>{{ forums.set_site.site_introduction }}</template>
        </div>
      </div>
      <div v-if="forums && forums.set_site" class="circlemode">
        <div class="title base-font-size">{{ $t('site.circlemode') }} \ {{ $t('site.price') }}</div>
        <div v-if="forums.set_site &&forums.set_site.site_mode === 'public'" class="content base-font-size grey-color">
          {{ $t('site.publicmode') }} \ {{ $t('post.free') }}
        </div>
        <div v-else class="content base-font-size grey-color">
          {{ $t('site.paymentmode') }} \ {{ $t('post.yuanItem') }}{{ forums.set_site.site_price }}
          （{{ forums.set_site.site_expire ?
            $t('site.periodvalidity') + forums.set_site.site_expire + $t('site.day')
            : $t('site.permanent') }}）
        </div>
      </div>
      <div class="permission">
        <div class="title base-font-size">{{ $t('manage.myRole') }} \ {{ $t('site.permission') }}</div>
        <div v-if="userInfo" class="user-detail">
          <div class="avatar">
            <avatar
              :user="{ id: userInfo.id, username: userInfo.username, avatarUrl: userInfo.avatarUrl}"
              :prevent-jump="true"
              :size="50"
              :round="true"
            />
          </div>
          <div class="user-info">
            <div class="name base-font-size">{{ userInfo.username }}</div>
            <div class="role">
              {{ $t('site.role') }}
              {{ forums.user && forums.user.groups && forums.user.groups.length > 0 && forums.user.groups[0].name
                || '' }}
            </div>
            <div v-if="userInfo.joinedAt" class="join-time">
              {{ $t('manage.joinedTime') }} {{ userInfo.joinedAt.substr(0, 10) }}
              <template v-if="forums && forums.set_site.site_mode === 'pay'">
                ,{{ $t('site.periodvalidity') + $t('site.to') + handleExpiredAt(userInfo.expiredAt) }}
                <!-- <template v-if="userInfo.expiredAt">
                  ({{ $t('pay.surplus') + (handleDays('userInfo.expiredAt') > 0
                  ? handleDays('userInfo.expiredAt') : 0) + $t('site.day') }})
                  </template> -->
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
import handleError from '@/mixin/handleError'
import { timestamp2day } from '@/utils/time'
export default {
  layout: 'center_layout',
  name: 'SiteInfo',
  mixins: [handleError],
  data() {
    return {
      userId: this.$store.state.user.info.id, // 获取当前登陆用户的ID
      groupsId: '',
      inputInfo: '',
      isModify: false,
      loading: false,
      permissionList: [] // 用户权限
    }
  },
  computed: {
    forums() {
      const forums = this.$store.state.site.info.attributes
      return forums
    },
    userInfo() {
      return this.$store.state.user.info.attributes || {}
    }
  },
  mounted() {
    this.inputInfo = this.forums && this.forums.set_site && this.forums.set_site.site_introduction
    this.groupsId = this.forums && this.forums.user && this.forums.user.groups && this.forums.user.groups.length > 0 &&
    this.forums.user.groups[0].id
    this.getPermissions()
    this.reloadForums()
  },
  methods: {
    async reloadForums() {
      try {
        await this.$store.dispatch('site/getSiteInfo')
      } catch (err) {
        console.log('getUserInfo err', err)
      }
    },
    handleModify() {
      this.isModify = !this.isModify
    },
    confirmModify() {
      if (this.loading) return
      const params = {
        data: [{
          attributes: {
            key: 'site_introduction',
            value: this.inputInfo,
            tag: 'default'
          }
        }]
      }
      this.loading = true
      this.$store.dispatch('jv/post', [{ _jv: { type: 'settings' }}, { data: params }]).then(async() => {
        try {
          await this.$store.dispatch('site/getSiteInfo')
        } catch (error) {
          console.log(error)
        }
        this.isModify = false
        this.$message.success(this.$t('discuzq.msgBox.modifySuccess'))
      })
        .catch((e) => {
          this.handleError(e)
        })
        .finally(() => {
          this.loading = false
        })
    },
    // 调用 用户组权限 接口
    getPermissions() {
      const params = {
        'filter[type]': 'invite',
        include: ['permission']
      }
      this.$store.dispatch('jv/get', ['groups', { params }]).then((res) => {
        const groupsId = this.forums &&
        this.forums.user &&
        this.forums.user.groups &&
        this.forums.user.groups.length > 0 &&
        this.forums.user.groups[0].id
        res.forEach((item) => {
          if (+item._jv.id === +groupsId) {
            this.permissionList = item.permission
          }
        })
      })
    },
    handleExpiredAt(date) {
      if (date) {
        return date.substr(0, 10)
      }
      return this.$t('site.permanent')
    },
    handleDays(date) {
      const _date = Math.round(new Date(date) / 1000)
      return timestamp2day(_date)
    }
  },
  head() {
    return {
      title: this.$t('manage.circleinfo')
    }
  }
}
</script>
<style lang='scss' scoped>
@import '@/assets/css/variable/color.scss';
.site-info-container{
  margin-top: 40px !important;
  margin-left:30px;
  padding-right:30px;
  padding-bottom: 30px;
  @media screen and ( max-width: 1005px ) {
    margin-left:15px;
    padding-right: 15px;
    padding-bottom: 20px;
  }
}
.logo{
  max-width: 294px;
  max-height: 55px;
}
.grey-color{
  color: $font-color-grey;
}
.title{
  color:#8c8c8c;
}
// 重置element
.el-button--primary {
  background-color: #1878F3 !important;
  border-color: #1878F3 !important;
  &:hover{
    opacity: 0.8;
  }
}
.base-font-size{
  font-size: 16px;
  @media screen and ( max-width: 1005px ) {
    font-size: 14px;
  }
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
  padding-bottom: 27.5px;
  border-bottom: 1px solid $line-color-base;
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
    margin-top: 25px;
    color: #000;
    padding-bottom: 10px;
    line-height: 24px;
    ::v-deep.el-textarea__inner{
      font-family: inherit;
    }
    .el-button{
      margin-top: 16px;
    }
  }
  .confirm-btn{
    width: 300px;
  }
}
.circlemode{
  margin-top: 30px;
  border-bottom: 1px solid $border-color-base;
  padding-bottom: 20px;
  .content{
    margin-top: 25px;
    margin-left: 20px;
  }
}
.permission{
  margin-top: 30px;
  .user-detail{
    display: flex;
    margin-top: 25px;
    .avatar{
      flex:0 0 50px;
    }
    .user-info{
      margin-left:15px;
      .role,.join-time{
        color: $font-color-grey;
      }
      .role{
        margin: 3px 0;
      }
      .permission-list{
        margin-top:15px;
        .item{
          display: inline-block;
          font-size:12px;
          color: #777777;
          background-color: #F7F7F7;
          padding:6.5px 10px;
          line-height: 1;
          margin-right:10px;
          margin-bottom:10px;
          border-radius: 2px;
        }
      }
    }
  }
}
</style>
