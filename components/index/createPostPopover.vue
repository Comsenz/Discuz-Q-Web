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
      <li v-if="can_create_thread" @click.stop="toRouter(0)">文字</li>
      <li v-if="can_create_thread_long" @click.stop="toRouter(1)">帖子</li>
      <li v-if="can_create_thread_image" @click.stop="toRouter(3)">图片</li>
      <li v-if="can_create_thread_video" @click.stop="toRouter(2)">视频</li>
    </ul>
    <template slot="reference">
      <slot name="button">
        <el-button v-permission:showAndHidePopover="''" type="primary" class="new-post">+{{ $t('profile.post') }}</el-button>
      </slot>
    </template>
  </el-popover>
</template>
<script>
import forums from '@/mixin/forums'
export default {
  mixins: [forums],
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
    isLogin() {
      return this.$store.getters['session/get']('isLogin')
    },
    userInfo() {
      return this.$store.getters['jv/get'](`/users/${this.userId}`)
    }
  },
  methods: {
    // 显示and隐藏下拉菜单
    showAndHidePopover() {
      console.log('forums', this.forums, this.userInfo)
      if (!this.visible) {
        const _other = this.forums.other
        const _userInfo = this.userInfo
        if (!_other) return
        console.log('_other', _other)
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
      this.$router.push(`/topic/post/${val}`)
    }
  }
}
</script>
<style lang="scss" scoped>
// 重置element
.el-button--primary {
  background-color: #1878F3 !important;
  border-color: #1878F3 !important;
  padding: 10px 20px !important;
  &:hover{
    opacity: 0.8;
  }
}
.type-container{
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
      color: #1878F3;
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