<template>
  <div class="actions">
    <div class="block">
      <template v-for="(action, index) in actions">
        <popover v-if="action.show && action.icon === 'emoji'" :key="index" :visible="showEmoji" class="svg" @hidePop="e => $emit('hidePop', e)">
          <template v-slot:pop> <emoji-list @selectEmoji="e => $emit('selectActions', e)" /> </template>
          <template v-slot:activeNode><svg-icon :type="action.icon" style="font-size: 20px" @click="$emit('onActions', action.toggle)" /></template>
        </popover>
        <popover v-if="action.show && action.icon === 'topic'" :key="index" :visible="showTopic" class="svg" @hidePop="e => $emit('hidePop', e)">
          <template v-slot:pop> <topic-list @selectedTopic="e => $emit('selectActions', e)" /> </template>
          <template v-slot:activeNode> <svg-icon :type="action.icon" style="font-size: 20px" @click="$emit('onActions', action.toggle)" /> </template>
        </popover>
        <svg-icon v-else-if="action.show && action.icon === 'call'" :key="index" :type="action.icon" class="svg" style="font-size: 20px" @click="$emit('onActions', action.toggle)" />
      </template>
      <!--@人弹窗-->
      <caller v-if="showCaller" @close="$emit('closeCaller')" @selectedCaller="e => $emit('selectActions', e)" />
    </div>
    <div class="block">
      <template v-for="(resource, index) in resources">
        <svg-icon v-if="resource.show" :key="index" :type="resource.icon" class="svg" style="font-size: 20px" @click="$emit('addResource', resource.toggle)" />
      </template>
    </div>
    <!--    <editor-markdown v-if="typeInformation && typeInformation.showMarkdown" :selector="selector" :text="post && post.text" class="block" @changeText="text => onPostContentChange('text', text)" />-->
  </div>
</template>

<script>
export default {
  name: 'EditorActions',
  props: {
    actions: {
      type: Array,
      default: () => []
    },
    showEmoji: {
      type: Boolean,
      default: false
    },
    showTopic: {
      type: Boolean,
      default: false
    },
    showCaller: {
      type: Boolean,
      default: false
    },
    resources: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style lang="scss" scoped>
.actions {
  display: flex;
  .block {
    display: flex;
    padding: 0 10px;

    &:first-child {
      border: 0;
    }

    .svg {
      cursor: pointer;
      margin-left: 20px;

      &:first-child {
        margin-left: 0;
      }
    }
  }
}

</style>
