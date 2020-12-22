<template>
  <div>
    <el-popover
      placement="bottom"
      min-width="150"
      :value="visible"
      trigger="manual"
      popper-class="popover"
      @hide="$emit('hide-pop')"
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
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style lang="scss">
  .popover {
    padding: 0 !important;
    border-radius: 6px;
  }
</style>

