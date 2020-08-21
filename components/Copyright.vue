<template>
  <div class="copyright">
    <div class="info">
      <span>Powered By</span>
      <span class="site">Discuz!Q</span>
      <span>© 2014-20{{ forums.set_site ? forums.set_site.site_expire : '' }}</span>
    </div>
    <div>分享 / 交流 / 共融</div>
    <div class="id">
      <div>{{ forums.set_site ? forums.set_site.site_record : '' }}</div>
      <span>{{ $t('home.theme') }}: {{ forums.other ? forums.other.count_users : '' }}</span>
      <span>{{ $t('home.invitation') }}: {{ forums.other ? forums.other.count_threads : '' }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Copyright',
  props: {
    forums: {
      type: Object,
      default: () => {
      }
    }
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

    > .info {
      width: 100%;
      display: inline-flex;
      justify-content: space-between;

      > .site {
        font-weight: bold;
      }
    }

    > .id {
      border-top: 1px solid $border-color-base;
      margin-top: 15px;
      padding-top: 15px;

      > span {
        &:last-child {
          margin-left: 20px;
        }
      }
    }
  }
</style>
