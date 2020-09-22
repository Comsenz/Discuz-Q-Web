<template>
  <div class="info">
    <!-- 有偿加入 -->
    <h2 class="info-title">{{ $t('core.registerValidate') }}</h2>
    <!-- 付费信息部分 -->
    <div class="payinfo">
      <p class="payinfo-title">感谢"{{ username }}"用户您的注册</p>
      <p>
        <span class="color">{{ $t('core.regcode') }}</span>
      </p>
      <el-button
        type="primary"
        plain
        size="small"
        class="h-button1"
        @click="home"
      >返回首页</el-button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: ''
    }
  },
  mounted() {
    const { username } = this.$route.query
    if (username) {
      this.username = username
    }
  },
  methods: {
    home() {
      this.$router.push('/')
    }
  }
}
</script>
<style lang='scss' scoped>
.info {
  display: flex;
  width: 315px;
  margin-top: 62px;
  flex-direction: column;
  .info-title {
    height: 35px;
    font-size: 26px;
  }
  .payinfo {
    // border-bottom: 1px solid #efefef;
    margin-top: 34px;
    color: #000000;
    padding-bottom: 30px;
    .payinfo-title {
      font-size: 18px;
      // font-family: Microsoft YaHei;
      font-weight: 400;
    }
    .color {
      color: #909399;
      padding-bottom: 20px;
    }
    .h-button1 {
      // width: 100px;
      height: 35px;
      color: #1878f3;
      background: #ffffff !important;
      border: 1px solid #1878f3 !important;
      border-color: #1878f3 !important;
      font-size: 14px;
      border-radius: 2px;
      // padding: 0px;
    }
  }
  span {
    display: inline-block;
  }
  p {
    margin-top: 15px;
  }
}
</style>
