<template>
  <div class="header">
    <div class="header-container">
      <div class="logo">
        <img src="@/assets/logo.png"
             alt />
      </div>
      <div class="log-r">
        <div>
          <button type>登录</button>
        </div>
        <div>
          <button type>注册</button>
        </div>
      </div>
      <!-- <HSearch></HSearch> -->
    </div>
  </div>
</template>

<script>
// import HSearch from './search/index'
export default {
  // components:{
  //   HSearch
  // },
  name: "Header",
  data () {
    return {};
  },
};
</script>
<style lang="scss">
.header {
  width: 100%;
  height: 65px;
  background: rgba(255, 255, 255, 1);
  box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.03);
  opacity: 1;
  .header-container {
    margin: 0 auto;
    width: 78.5%;
    height: 100%;
    color: yellow;
    padding: 15px 0;
    .logo {
      float: left;
      width: 150px;
      height: 35px;
      /* background: red; */
    }
  }
}

.h-search {
  margin-left: 30px;
  width: 298px;
  height: 33px;
  background: rgba(255, 255, 255, 1);
  border: 1px solid rgba(237, 237, 237, 1);
  opacity: 0.66;
  border-radius: 4px;
  float: left;
  /* background: yellow; */
}
.h-search-input {
  width: 255px;
  border: none;
  height: 100%;
  /* outline-color: lightskyblue; */
  outline: none;
  padding-left: 16px;

  font-size: 14px;
  font-family: Microsoft YaHei;
  font-weight: 400;
  line-height: 19px;
  color: rgba(208, 212, 220, 1);
}
.search-logo {
  width: 14px;
  height: 14px;
  /* background: blue; */
  display: inline-block;
  vertical-align: middle;
}
/* .search-logo img{
  width: 100%;
  height: 100%;
  display: inline-block
} */
.log-r {
  float: right;
}
</style>
