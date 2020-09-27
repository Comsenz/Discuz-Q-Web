<template>
  <div class="actions">
    <button
      v-for="(action, index) in actions.slice(0, 3)"
      :key="index"
      :disabled="!action.canOpera"
      :class="{ 'action': true, 'disabled': !action.canOpera }"
      @click="onClick(action)"
    >
      <svg-icon class="action-icon" :type="action.icon" />
      <span class="content">
        <span>{{ action.text }}</span>
        <span v-if="action.count"> ({{ action.count }})</span>
      </span>
    </button>
    <div class="action">
      <share-popover :threads-id="threadId">
        <div class="btn share">
          <button
            slot="reference"
            :disabled="!actions[3].canOpera"
            :class="{ 'action': true, 'disabled': !actions[3].canOpera }"
          >
            <svg-icon class="action-icon" :type="actions[3].icon" />
            <span class="content">
              <span>{{ actions[3].text }}</span>
              <span v-if="actions[3].count"> ({{ actions[3].count }})</span>
            </span>
          </button>
        </div>
      </share-popover>
    </div>
  </div>

</template>

<script>
export default {
  name: 'TopicActions',
  props: {
    actions: {
      type: Array,
      default: () => []
    },
    threadId: {
      type: String,
      default: ''
    }
  },
  methods: {
    onClick(action) {
      if (action.command) this.$emit('clickAction', action)
    },
    copyLink() {
      const oInput = document.createElement('input')
      if (process.client) {
        oInput.value = window.location.href
        oInput.id = 'copyInput'
        document.body.appendChild(oInput)
        oInput.select()
        document.execCommand('Copy')
      }
      this.$message.success('链接复制成功')
      setTimeout(() => {
        oInput.remove()
      }, 100)
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '@/assets/css/variable/color.scss';
  .actions {
    margin: 50px auto 40px;
    padding: 0 25px;
    display: flex;
    justify-content: space-between;

    .action {
      background: #ffffff;
      cursor: pointer;
      flex: 1;
      display: flex;
      align-items: center;
      flex-direction: column;
      color: $font-color-grey;

      &.disabled {
        cursor: not-allowed;
        &:hover {
          color: $font-color-grey;
          > .action-icon {
            fill: $font-color-grey;
          }
        }
      }

      > .action-icon {
        font-size: 20px;
        fill: $font-color-grey;
      }

      &:hover {
        color: $color-blue-base;
        > .action-icon {
          fill: $color-blue-base;
        }
      }

      > .content {
        margin-top: 10px;
        font-size: 12px;
      }
    }
  }

</style>
