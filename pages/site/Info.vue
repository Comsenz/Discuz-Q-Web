<template>
  <div class="info">
    <h2 class="info-title">{{ $t('manage.payJoin') }}</h2>
    <div class="payinfo">
      <p>访问圈子内容需要您付费加入</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {

    }
  }
}
</script>
<style lang='scss' scoped>
//@import url(); 引入公共css类
.info {
  display: flex;
  width: 400px;
  margin-top: 62px;
  // margin-bottom: 178px;
  // height: 466px;
  // background: red;
  flex-direction: column;
  .info-title {
    width: 130px;
    height: 35px;
    font-size: 26px;
  }
}
</style>
