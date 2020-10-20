<template>
  <div :class="['editor-bar', editorStyle]">
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
    <div class="publish-container">
      <span v-if="textLimit" class="tip">{{ textLimit>=textLength ? $t('post.note', { num: textLimit - textLength }) : $t('post.exceed', { num: textLength - typeInformation.textLimit }) }}</span>
      <el-button class="button-publish" :loading="onPublish" type="primary" size="small" @click="$emit('publish')">{{ $t('post.post') }}</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EditorToolBar',
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
    },
    textLimit: {
      type: [Number, String],
      default: 450
    },
    textLength: {
      type: [Number, String],
      default: 0
    },
    onPublish: {
      type: Boolean,
      default: false
    },
    editorStyle: {
      type: String,
      default: 'post'
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/variable/color.scss';

.editor-bar {
  width: 100%;
  height: 45px;
  display: flex;
  padding: 0 10px;
  align-items: center;
  background: #ffffff;

  &.chat {
    background: $background-color-grey
  }

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

  .publish-container {
    margin-left: auto;
    > .button-publish {
      margin-left: auto;

      ::v-deep span {
        font-size: 14px;
      }
    }

    > .tip {
      margin-right: 10px;
      color: #D0D4DC;
    }
  }
}

</style>
