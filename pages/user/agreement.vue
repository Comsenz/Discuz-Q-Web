<template>
  <div class="agreement">
    <div class="container">
      <div class="title">{{ popTitle }}</div>
      <div class="content">{{ popDetail }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Agreement',
  data() {
    return {
      type: '',
      forums: '',
      popTitle: '\u200E',
      popDetail: ''
    };
  },
  mounted() {
    const { type } = this.$route.query;
    this.type = type;
    this.getAttachMent();
  },
  methods: {
    getAttachMent() {
      const params = {
        include: 'users',
        'filter[tag]': 'agreement'
      };
      this.$store.dispatch('jv/get', ['forum', { params }]).then(res => {
        this.forums = res;
        this.open(this.type);
      });
    },
    open(type) {
      if (type === 'register') {
        this.popTitle = this.$t('permission.user.agreementRegister');
        this.popDetail = this.forums.agreement.register_content;
      } else {
        this.popTitle = this.$t('permission.user.agreementPrivacy');
        this.popDetail = this.forums.agreement.privacy_content;
      }
    }
  },
  head() {
    return {
      title:
        this.forums && this.forums.set_site && this.forums.set_site.site_name
          ? `${this.popTitle} - ${this.forums.set_site.site_name}`
          : this.popTitle
    };
  }
};
</script>
<style lang="scss" scoped>
.agreement {
  .container {
    width: 925px;
    margin-top: 60px;
    @media screen and (max-width: 1005px) {
      width: 850px;
    }
    @media screen and (max-width: 930px) {
      width: 800px;
    }
    @media screen and (max-width: 870px) {
      width: 750px;
    }
    @media screen and (max-width: 800px) {
      width: 700px;
    }
  }
  .title {
    font-size: 24px;
    font-weight: 700;
    color: #000000;
  }
  .content {
    margin-top: 50px;
    color: #6d6d6d;
    margin-bottom: 50px;
    white-space: pre-line;
    text-align: justify;
  }
}
</style>
