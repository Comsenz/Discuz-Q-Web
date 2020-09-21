<template>
  <div class="footer">
    <span> Powered By &nbsp;  <a class="bold" href="https://discuz.com" target="_blank">Discuz! Q</a> &nbsp;    © {{ year }} &nbsp;&nbsp;分享&nbsp;&nbsp;/&nbsp;&nbsp;交流 &nbsp;&nbsp;/&nbsp;&nbsp;共融 </span>
    <div>
      <span class="site-record">{{ forums.set_site ? forums.set_site.site_record : '' }}</span>
      <a href="https://beian.miit.gov.cn/" target="_blank">{{ forums.set_site ? forums.set_site.site_record_code : '' }}</a>
    </div>
  </div>
</template>
<script>
export default {
  name: 'Footer',
  data() {
    return {
      year: '2019'
    }
  },
  computed: {
    forums() {
      return this.$store.state.site.info.attributes || {}
    }
  },
  created() {
    const date = new Date()
    this.year = date.getFullYear()
  }
}
</script>
<style lang="scss" scoped>
.footer{
  padding: 30px 0 40px;
  text-align: center;
  color: #8590A6;

  span .bold{
    font-weight: bold;
  }
  .site-record{
    margin-right: 20px;
  }
  a:hover{
    color: #006CD1;
  }
}
</style>
