<template>
  <el-backtop class="back-top-container" :right="20" :bottom="89">
    <div class="back-top">
      <svg-icon type="arrow-top" class="icon" />
    </div>
  </el-backtop>
</template>

<script>
export default {}
</script>

<style lang='scss' scoped>
.back-top-container{
  @media (min-width:1200px){
    left: 50%;
    right: auto;
    margin-left: 525px;
  }
  @media (max-width:1199px){
    left: auto;
    margin: auto;
  }
  .back-top{
    height: 40px;
    width: 40px;
    background-color: white;
    box-shadow: 0px 3px 3px rgba(0, 0, 0, 0.1);
    text-align: center;
    line-height: 35px;
    border-radius: 2px;
    .icon{
      font-size:16px;
    }
  }
}

</style>
