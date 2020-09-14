<template>
  <div class="footer">
    <span> Powered By &nbsp;  <span class="bold">{{ forums.set_site && forums.set_site.site_name || 'Discuz!Q' }}</span> &nbsp;    © 2014-{{ year }} &nbsp; 分享&nbsp;  / 交流 &nbsp; /&nbsp;  共融 </span>
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
  padding: 30px 0;
  text-align: center;
  color: #8590A6;

  span .bold{
    font-weight: bold;
  }

}
</style>
