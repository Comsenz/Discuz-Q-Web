<template>
  <div class="actions">
    <button v-for="(action, index) in actions" :key="index" :disabled="!action.canOpera" :class="{ 'action': true, 'disabled': !action.canOpera }" @click="onClick(action)">
      <svg-icon class="action-icon" :type="action.icon" />
      <span class="content">
        <span>{{ action.text }}</span>
        <span v-if="action.count"> ({{ action.count }})</span>
      </span>
    </button>
  </div>
</template>

<script>
export default {
  name: 'TopicActions',
  props: {
    actions: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    onClick(action) {
      if (action.command === 'showLink') return alert('showLink')
      if (action.command) this.$emit('clickAction', action)
    }
  }
}
</script>

<style lang="scss" scoped>
  $defaultColor: #8590A6;
  .actions {
    margin: 15px auto 0;
    padding: 0 25px;
    display: flex;
    justify-content: space-between;
    > .action {
      cursor: pointer;
      flex: 1;
      display: flex;
      align-items: center;
      flex-direction: column;
      color: $defaultColor;
      &.disabled {
        cursor: not-allowed;
      }
      > .action-icon {
        font-size: 20px;
        fill: $defaultColor;
      }
      > .content {
        margin-top: 10px;
        font-size: 12px;
      }
    }
  }
</style>
