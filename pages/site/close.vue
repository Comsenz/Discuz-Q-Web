<template>
  <div class="close-info">
    <div class="title">抱歉，论坛暂时关闭</div>
    <div class="text">管理员关闭了论坛，请稍后访问。</div>
    <div class="time">关闭理由</div>
  </div>
</template>

<script>
export default {
  // layout: 'error_layout',
  data() {
    return {

    }
  },
  computed: {

  },
  mounted() {
  },
  methods: {
  }
}
</script>
<style lang='scss' scoped>
.close-info{
  padding: 62px 304px;
  .title{
    font-size: 26px;
    font-weight: bold;
    margin-bottom: 40px;
  }
  .text{
    font-size:18px;
    margin-bottom: 20px;
  }
  .time{
    color: #909399;
  }
}
</style>
