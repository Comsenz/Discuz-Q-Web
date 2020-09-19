<template>
  <div class="copyright">
    <div class="info">
      <span>Powered By</span>
      <span class="site">{{ forums.set_site && forums.set_site.site_name || 'Discuz!Q' }}</span>
      <span class="block">© 2014-{{ forums.set_site && forums.set_site.site_expire ? '20' + forums.set_site.site_expire : year }}</span>
    </div>
    <div>分享 / 交流 / 共融</div>
    <div class="id">
      <div>{{ forums.set_site ? forums.set_site.site_record : '' }}</div>
      <div class="site-record-code">
        <a href="https://beian.miit.gov.cn/" target="_blank">{{ forums.set_site ? forums.set_site.site_record_code : '' }}</a>
      </div>
      <span>{{ $t('home.theme') }}: {{ forums.other ? forums.other.count_users : '' }}</span>
      <span>{{ $t('home.invitation') }}: {{ forums.other ? forums.other.count_threads : '' }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Copyright',
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
  @import '@/assets/css/variable/color.scss';
  .copyright {
    margin-top: 0;
    color: $font-color-grey;
    line-height: 20px;
    padding: 20px;
    @media screen and ( max-width: 1005px ) {
      padding: 14px;
      font-size:12px;
      .block{
        display: block;
      }
    }
    > .info {
      width: 100%;
      > span {
        margin-right: 10px;
      }
      > .site {
        font-weight: bold;
        white-space: nowrap;
      }
    }

    > .id {
      border-top: 1px solid $border-color-base;
      margin-top: 17px;
      padding-top: 15px;
      line-height: 20px;
      > span {
        &:last-child {
          margin-left: 20px;
        }
      }
    }
    .site-record-code{
      a:hover{
        color: $color-blue-deep;
      }
    }
  }
</style>
