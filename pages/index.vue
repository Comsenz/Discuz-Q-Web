<template>
  <div class="container">
    <main class="cont-left">
      <index-filter />
      <div class="list-top">
        <div class="list-top-item">
          <div class="top-label">{{ $t('home.sticky') }}</div>
          <nuxt-link :to="'/'" class="top-title text-hidden">帖子标题帖子标题帖子标题帖子标题帖子标题帖子标题帖子标题帖子标题帖子标题帖子标题帖子标题帖子标题帖子标题帖子标题</nuxt-link>
        </div>
      </div>
      <div class="new-post">
        <div class="new-post-cont">有 3 条新发布的内容</div>
      </div>
      <div class="post-list">
        <post-item v-for="(item, index) in threadsList" :key="index" :detail="item" />
      </div>
    </main>
    <aside class="cont-right">
      <div class="category background-color">
        <category />
      </div>
      <div class="adv background-color">
        <img src="@/assets/qrcode.png" alt="二维码" class="qrcode">
        <div class="adv-info">
          <div class="adv-title">微信小程序版</div>
          DISCUZ! 分享、交流、共融
        </div>
      </div>
      <div class="recommend-user background-color">
        <recommend-user />
      </div>
    </aside>
  </div>
</template>

<script>
export default {
  layout: 'custom_layout',
  name: 'Index',
  data() {
    return {
      threadsList: []
    }
  },
  created() {
    this.getThreadsList()
  },
  methods: {
    getThreadsList() {
      const params = {
        _jv: { type: 'threads' }
      }
      this.$store.dispatch('jv/get', params).then(res => {
        console.log(res)
        this.threadsList = res
      }, e => {
        this.$message.error('列表加载失败')
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@mixin background(){
  background: #fff;
  border-radius: 5px;
  box-shadow: 0 3px 3px rgba(0, 0, 0, 0.03);
}
.app-cont{
  box-shadow: none;
}
.container{
  display:flex;
  background: #F4F5F6;
  width: 100%;
  .cont-left{
    flex:auto;
    @include background();
    .list-top-item{
      border-bottom: 1px solid #EFEFEF;
      line-height: 1;
      padding: 10px 20px;
      display: flex;
      align-items: center;
      .top-label{
        color:#8590A6;
        margin-right: 20px;
      }
      .top-title{
        color: #000;
        flex: 0 0 60%;
      }
      &:hover{
        .top-title{
          color: #FF0000;
        }
      }
    }
    .new-post{
      padding: 10px 20px;
      .new-post-cont{
        background: #FDF6EC;
        border-radius: 5px;
        text-align:center;
        line-height: 19px;
        color: #E6A23C;
        padding:8px 0;
      }
    }
  }
  .cont-right{
    margin-left:15px;
    width:300px;
    flex: 0 0 300px;
    .background-color{
      @include background();
       margin-bottom: 16px;
    }
    .adv{
      padding: 15px;
      display: flex;
      align-items: center;
      .qrcode{
        width:70px;
        height:70px;
        margin-right:6px;
      }
      .adv-title{
        font-size:18px;
        font-weight:bold;
        margin-bottom:6px;
      }
    }
  }
}
</style>
