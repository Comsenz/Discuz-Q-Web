<template>
  <div>
    <template v-for="(markdown, index) in markdownList">
      <svg-icon
        :key="index"
        :type="'markdown-' + markdown.icon"
        class="svg"
        style="font-size: 20px"
        @click="editMarkdown(markdown)"
      />
    </template>
  </div>
</template>

<script>
export default {
  name: 'EditorMarkdown',
  props: {
    text: {
      type: String,
      default: ''
    },
    selector: {
      type: String,
      default: 'editor'
    }
  },
  data() {
    return {
      selectionStart: 0,
      selectionEnd: 0,
      markdownList: [
        { icon: 'bold', tip: '粗体文字', code: '**', fn: 'markdownWrap' },
        { icon: 'header', tip: '标题', code: '### ', fn: 'markdownPrefix' },
        { icon: 'italics', tip: '斜体文字', code: '_', fn: 'markdownWrap' },
        { icon: 'quote', tip: '引用', code: '> ', fn: 'markdownPrefix' },
        { icon: 'code', tip: '代码块', code: '`', fn: 'markdownWrap' },
        { icon: 'delete-line', tip: '删除线', code: '~~', fn: 'markdownWrap' },
        { icon: 'link', tip: '链接', code: '[链接名](链接url)', fn: 'markdownUrl' },
        { icon: 'list', tip: '无序列表', code: '* ', fn: 'markdownPrefix' },
        { icon: 'order-list', tip: '有序列表', code: '1. ', fn: 'markdownPrefix' }
      ]
    };
  },
  methods: {
    getSelection() {
      this.selectionStart = document.querySelector(`.${this.selector} #textarea`).selectionStart;
      this.selectionEnd = document.querySelector(`.${this.selector} #textarea`).selectionEnd;
    },
    editMarkdown(markdown) {
      this.getSelection();
      const frontText = this.text.slice(0, this.selectionStart);
      const centerText = this.text.slice(this.selectionStart, this.selectionEnd);
      const behindText = this.text.slice(this.selectionEnd, this.text.length);
      this[markdown.fn](frontText, centerText, behindText, markdown.code, markdown.tip);
    },
    markdownWrap(frontText, centerText, behindText, code, tip) {
      centerText = centerText || tip;
      const text = frontText + code + centerText + code + behindText;
      this.$emit('changeText', text);
    },
    markdownPrefix(frontText, centerText, behindText, code, tip) {
      const content = (centerText + behindText) || tip;
      frontText = frontText ? `${frontText}\n` : '';
      const text = frontText + code + content;
      this.$emit('changeText', text);
    },
    markdownUrl(frontText, centerText, behindText, code) {
      const text = frontText + code + centerText + behindText;
      this.$emit('changeText', text);
    }
  }
};
</script>

<style lang="scss" scoped>
  .svg {
    cursor: pointer;
    margin-left: 20px;
    &:first-child {
      margin-left: 0;
    }
  }
</style>
