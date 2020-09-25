<template>
  <el-popover
    v-model="visible"
    placement="bottom"
    width="120"
    min-width="120"
    trigger="manual"
    popper-class="custom-popover-width"
  >
    <ul class="type-container">
      <li v-if="can_create_thread" @click.stop="toRouter(0)">{{ $t('home.word') }}</li>
      <li v-if="can_create_thread_long" @click.stop="toRouter(1)">{{ $t('home.invitation') }}</li>
      <li v-if="can_create_thread_image" @click.stop="toRouter(3)">{{ $t('home.picture') }}</li>
      <li v-if="can_create_thread_video" @click.stop="toRouter(2)">{{ $t('home.video') }}</li>
    </ul>
    <template slot="reference">
      <slot name="button">
        <el-button v-permission:showAndHidePopover="''" type="primary" class="new-post"><span class="add-icon">+</span>{{ $t('profile.post') }}</el-button>
      </slot>
    </template>
  </el-popover>
</template>
<script>
export default {
  data() {
    return {
      userId: this.$store.getters['session/get']('userId'), // 获取当前登陆用户的ID
      visible: false,
      noCreateThread: false, // 是否有创建主题的权限
      can_create_thread: true, // 是否有发文字权限
      can_create_thread_long: true, // 是否有发帖子权限
      can_create_thread_video: true, // 是否有发视频权限
      can_create_thread_image: true // 是否有发图片权限
    }
  },
  computed: {
    userInfo() {
      return this.$store.getters['jv/get'](`/users/${this.userId}`)
    },
    forums() {
      return this.$store.state.site.info.attributes || {}
    }
  },
  methods: {
    // 显示and隐藏下拉菜单
    showAndHidePopover() {
      if (!this.visible) {
        const _other = this.forums.other
        const _userInfo = this.userInfo
        if (!_other) return
        if (!_other.can_create_thread && !_other.can_create_thread_long && !_other.can_create_thread_video && !_other.can_create_thread_image) {
          this.$message.error(this.$t('home.noPostingPermission'))
          return
        }
        // 发布是否需要实名认证
        if (_other.publish_need_real_name && !_userInfo.realname) {
          this.$message.error(this.$t('home.needRealname'))
          return
        }
        // 发布是否需要手机号
        if (_other.publish_need_bind_phone && !_userInfo.mobile) {
          this.$message.error(this.$t('home.needPhone'))
          return
        }
        // 判断至少在某个分类下有发帖权限
        if (!_other.can_create_thread_in_category) {
          this.$message.error(this.$t('home.noPostingPermission'))
          return
        }
        if (!_other.can_create_thread) {
          this.can_create_thread = false
        }
        if (!_other.can_create_thread_long) {
          this.can_create_thread_long = false
        }
        // 判断发视频帖权限
        if (!_other.can_create_thread_video) {
          this.can_create_thread_video = false
        }
        if (!_other.can_create_thread_image) {
          this.can_create_thread_image = false
        }
      }
      this.visible = !this.visible
    },
    // 跳往发帖页
    toRouter(val) {
      this.$router.push(`/topic/post?type=${val}`)
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/assets/css/variable/color.scss';
// 重置element
.new-post {
  background-color:$color-blue-base !important;
  border-color:$color-blue-base !important;
  padding: 9.5px 13.5px !important;
  border-radius: 2px;
  &:hover{
    background-color: $color-blue-deep !important;
    border-color:$color-blue-deep !important;
  }
  .add-icon{
    display:inline-block;
    margin-right:5px;
  }
}
.type-container{
  padding: 5px 0;
  li{
    position: relative;
    list-style: none;
    width: 120px;
    height: 40px;
    line-height: 40px;
    text-align: center;
    cursor: pointer;
    outline: none;
    &:hover{
      background-color: #E5F2FF;
      color:$color-blue-base;
    }
    &:before{
      content:'';
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100px;
      height: 1px;
      background: #EDEDED;
      margin:0 10px;
    }
    &:last-child:before{
      height: 0;
    }
  }
}
</style>
