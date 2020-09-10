<template>
  <div>
    <el-popover
      placement="bottom"
      min-width="150"
      trigger="click"
      popper-class="popover"
    >
      <slot name="pop" />
      <template slot="reference">
        <slot name="activeNode" />
      </template>
    </el-popover>
  </div>
</template>

<script>
export default {
  name: 'Popover',
  data() {
    return {
      visible: false
    }
  }
}
</script>

<style lang="scss">
  .popover {
    padding: 0 !important;
    border-radius: 6px;
  }
</style>

