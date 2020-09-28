<template>
  <div
    v-if="(forums.agreement && forums.agreement.register) || (forums.agreement && forums.agreement.privacy)"
    class="reg-agreement"
  >
    <el-checkbox
      v-model="checked"
      @change="rcheck"
    />
    <span class="agree">{{ $t('permission.user.agreement') }}</span>
    <span
      v-if="forums.agreement && forums.agreement.register"
      class="regagree"
      @click="open('register')"
    >{{ `《${this.$t('permission.user.agreementRegister')}》` }}
    </span>
    <span
      v-if="forums.agreement && forums.agreement.privacy"
      class="regagree"
      @click="open('privacy')"
    >{{ `《${this.$t('permission.user.agreementPrivacy')}》` }}
    </span>
    <!-- <reg-message
      v-if="showagree"
      :title="popTitle"
      :content="popDetail"
      @close="showagree = false"
    >
      <div class="content">{{ popDetail }}</div>
      <div class="moreheight">.</div>
    </reg-message> -->
  </div>
</template>

<script>
export default {
  name: 'Regagreement',
  data() {
    return {
      forums: '',
      popTitle: '',
      popDetail: '',
      showagree: false,
      checked: true
    }
  },
  mounted() {
    this.getAttachMent()
  },
  methods: {
    getAttachMent() {
      const params = {
        include: 'users',
        'filter[tag]': 'agreement'
      }
      this.$store.dispatch('jv/get', [`forum`, { params }]).then(res => {
        this.forums = res
        console.log('agreement', this.forums)
      })
    },
    open(type) {
      this.$router.push(`/pages/user/agreement?type=${type}`)
    },
    rcheck() {
      this.$emit('check', this.checked)
    }
  }
}
</script>
<style lang='scss' scoped>
@import "@/assets/css/variable/color.scss";
.reg-agreement {
  display: inline-block;
  .agree {
    color: #6d6d6d;
  }
  .regagree {
    color: #409eff;
    cursor: pointer;
    &:hover {
      color: $color-blue-base;
    }
  }
  .moreheight {
    position: absolute;
    bottom: -2650px;
  }
  .content {
    height: 500px;
    width: 1005px;
    white-space: pre-wrap;
    line-height: 30px;
    padding-top: 31px;
    padding: 50px 40px 0 40px;
    color: #6d6d6d;
    @media screen and (max-width: 1005px) {
      width: 100%;
      min-width: 768px;
    }
  }
  ::v-deep .el-checkbox__label {
    padding-left: 0px;
  }
}
</style>
