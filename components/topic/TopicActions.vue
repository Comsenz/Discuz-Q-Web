<template>
  <div class="actions">
    <div class="action">
      <svg-icon class="action-icon" type="book" />
      <span class="key">阅读</span>
      <span class="value">2198</span>
    </div>
    <div class="action">
      <svg-icon class="action-icon" type="like" />
      <span class="key">点赞</span>
      <span class="value">870,2</span>
    </div>
    <div class="action">
      <svg-icon class="action-icon" type="favor" />
      <span class="key">收藏</span>
      <span class="value">121,12</span>
    </div>
    <div class="action">
      <svg-icon class="action-icon" type="link" />
      <span class="key">分享</span>
      <span class="value">157</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TopicActions',
  props: {}
}
</script>

<style lang="scss" scoped>
  $defaultColor: #8590A6;
  .actions {
    margin: 0 auto;
    padding: 0 25px;
    display: flex;
    justify-content: space-between;
    > .action {
      flex: 1;
      display: flex;
      align-items: center;
      flex-direction: column;
      color: $defaultColor;
      > .action-icon {
        font-size: 20px;
        fill: $defaultColor;
      }
      > .key {
        margin-top: 10px;
        font-size: 12px;
      }
      > .value {
        font-size: 16px;
        line-height: 20px;
      }
    }
  }
</style>
