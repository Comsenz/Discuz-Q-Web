<template>
  <div class="close-info">
    <div class="title">抱歉，论坛暂时关闭</div>
    <div class="text">管理员关闭了论坛，请稍后访问。</div>
    <div class="time">{{ close_tips }}</div>
  </div>
</template>

<script>
export default {
  // layout: 'error_layout',
  data() {
    return {
      close_tips: ''
    }
  },
  computed: {
    forums() {
      return this.$store.state.site.info.attributes || {}
    }
  },
  mounted() {
    this.getSiteInfo()
    if (this.forums) {
      window.location.replace('/')
    }
  },
  methods: {
    async getSiteInfo() {
      const error = this.$store.state.forum.error
      this.close_tips = error ? error.detail : ''
      // try {
      //   await this.$store.dispatch('site/getSiteInfo')
      // } catch (e) {
      //   const { response: { data: { errors }}} = e
      //   if (errors[0].code === 'site_closed') {
      //     this.close_tips = errors[0].detail[0]
      //   }
      // }
    }
  }
}
</script>
<style lang='scss' scoped>
.close-info{
  padding: 62px 304px;
  .title{
    font-size: 26px;
    font-weight: bold;
    margin-bottom: 40px;
  }
  .text{
    font-size:18px;
    margin-bottom: 20px;
  }
  .time{
    color: #909399;
  }
}
</style>
