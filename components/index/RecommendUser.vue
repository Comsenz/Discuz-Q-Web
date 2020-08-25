<template>
  <div class="recommend-user-container">
    <div class="recommend-user-title">推荐用户</div>
    <div class="user-item">
      <avatar :user="user" :size="45" />
      <div class="user-info">
        <div class="user-name text-hidden">李四</div>
        <div class="user-fans">粉丝 2522</div>
      </div>
      <div class="follow">{{ $t('profile.following') }}</div>
    </div>
    <div class="refresh">
      <i class="el-icon-refresh icon" />换一批
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      user: {
        avatarUrl: 'https://discuzq-1251099537.cos.ap-shanghai.myqcloud.com/public/avatar/13.png?sign=q-sign-algorithm%3Dsha1%26q-ak%3DAKIDjNmKJ3tqtiJeZFS4DG4cvymKcfTCdvvh%26q-sign-time%3D1598261028%3B1598264688%26q-key-time%3D1598261028%3B1598264688%26q-header-list%3Dhost%26q-url-param-list%3D%26q-signature%3D10bbbda1cef33422edad66f722a09c99ac4b5a6a',
        id: 13,
        username: '"xhltest"'
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.recommend-user-container{
  padding: 20px;
  .recommend-user-title{
    color:#6D6D6D;
    margin-bottom: 8px;
    font-weight:bold;
  }
  .user-item{
    display: flex;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #E4E4E4;
    .user-info{
      flex: 1;
      margin-left: 10px;
      .user-name{
        color: #000000;
        font-size: 16px;
        width: 150px;
      }
      .user-fans{
        color: #8590A6;

      }
    }
    .follow{
      width:50px;
      height:25px;
      line-height: 25px;
      border:1px solid rgba(208,212,220,1);
      border-radius:18px;
      font-size:12px;
      color: #8590A6;
      text-align:center;
      cursor: pointer;
    }
  }
  .refresh{
    padding: 10px 0 0;
    color: #8590A6;
    cursor: pointer;
    display: inline-block;
    .icon{
      margin-right: 6px;
    }
  }
}
</style>
