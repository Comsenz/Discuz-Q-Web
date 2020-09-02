<template>
  <div class="myindex">
    <div>
      <div>
        <el-image
          :src="forums.set_site && forums.set_site.site_logo ? forums.set_site.site_logo : require('static/logo.png')"
          alt="logo"
          class="logo"
        />
        <div>
          <span>11
            <img
              src=""
              alt=""
            ></span>

          <span>22</span>
        </div>
        <span>已实名认证</span>
        <span>设置头像</span>
      </div>
      <div>
        <div>
          <span>主题</span>
          <span>73</span>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
import forums from '@/mixin/forums'
export default {
  mixins: [forums],
  data() {
    return {

    }
  },
  mounted() {
    console.log(this.forums)
  }
}
</script>
<style lang='scss' scoped>
.logo{
  width: 294px;
}
</style>
