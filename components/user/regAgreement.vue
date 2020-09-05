<template>
  <div
    v-if="(forums.agreement && forums.agreement.register) || (forums.agreement && forums.agreement.privacy)"
    class="reg-agreement"
  >
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
    <reg-message
      v-if="showagree"
      :title="popTitle"
      :content="popDetail"
      @close="showagree = false"
    >
      <div class="content">{{ popDetail }}</div>
    </reg-message>
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
      showagree: false
    }
  },
  mounted() {
    this.getAttachMent()
  },
  methods: {
    getAttachMent() {
      // 用户组等改变会改变私信权限
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
      console.log(type)
      if (type === 'register') {
        this.popTitle = this.$t('permission.user.agreementRegister')
        this.popDetail = this.forums.agreement.register_content
        this.showagree = true
      } else {
        this.popTitle = this.$t('permission.user.agreementPrivacy')
        this.popDetail = this.forums.agreement.privacy_content
        this.showagree = true
      }
    }
  }
}
</script>
<style lang='scss' scoped>
.reg-agreement {
  display:inline-block;
  .agree {
    color: #6d6d6d;
  }
  .regagree {
    // display: inline-block;
    // width: 80px;
    margin-left: -7px;
    color:#409eff;
    cursor: pointer;
  }
  .content {
    height:500px;
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
