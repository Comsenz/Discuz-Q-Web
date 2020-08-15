<template>
  <div class="myprofile">
    <div class="myprofile-c">
      <div class="myprofile-top">
        <img
          src="@/assets/qq-big.png"
          alt=""
        >
        <div class="usr">
          <span class="usrname">Smile
            <img
              src=""
              alt=""
            ></span>

          <span class="usrid">管理员</span>
        </div>
        <span class="iden">已实名认证</span>
        <span class="setavatar">设置头像</span>
      </div>
      <div class="myprofile-bottom">
        <div class="myprofile-title marglef">
          <span>主题</span>
          <span class="num">73</span>
        </div>
        <div class="myprofile-title">
          <span>主题</span>
          <span class="num">73</span>
        </div>
        <div class="myprofile-title">
          <span>主题</span>
          <span class="num">73</span>
        </div>
        <div class="myprofile-title">
          <span>主题</span>
          <span class="num">73</span>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
export default {
  data() {
    return {
      userId: ''
    }
  },
  computed: {
    // userId() {
    //   console.log(this.userId)

    //   return this.$store.getters['session/get']('userId')
    // }
    // userInfo() {
    //   const userInfo = this.$store.getters['jv/get'](`users/${this.userId}`)
    //   console.log(userInfo)
    //   userInfo.groupsName = userInfo.groups ? userInfo.groups[0].name : ''
    //   this.setNum(userInfo)
    //   return userInfo
    // }
  },
  mounted() {
    this.userInfo()
  },
  methods: {
    userInfo() {
      this.userId = this.$store.getters['session/get']('userId')
      console.log(this.userId)
      console.log('gg')
      // const params = {
      //   _jv: { type: `/users${this.userId}` }
      // }
      this.$store.dispatch('jv/get', ['users', 714]).then(res => {
        console.log('userinfo', res)
      })
    }
  }
}
</script>
<style lang='scss' scoped>
//@import url(); 引入公共css类

.myprofile-c {
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #e4e4e4;
  .myprofile-top {
    display: flex;
    flex-direction: row;
    img {
      width: 50px;
      height: 50px;
      background: red;
      border-radius: 50%;
    }
    .usr {
      display: flex;
      flex-direction: column;
      margin-left: 15px;
      font-size: 16px;
      .usrname {
        font-weight: bold;
      }
      .usrid {
        color: #8590a6;
      }
    }
    .iden {
      margin-left: 15px;
    }
    .setavatar {
      flex: 1;
      text-align: right;
      margin-right: 30px;
      color: #1878f3;
    }
  }
  .myprofile-bottom {
    display: flex;
    margin-top: 14px;
    .marglef {
      margin-left: 77px !important;
    }
    .myprofile-title {
      display: flex;
      flex-direction: column;
      margin-left: 95px;
      color: #6d6d6d;
      text-align: center;
      margin-bottom: 21px;
      .num {
        font-size: 18px;
      }
    }
  }
}
</style>
