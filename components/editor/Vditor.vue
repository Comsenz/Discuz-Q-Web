<template>
  <div
    v-loading="onUploadImage"
    element-loading-background="hsla(0,0%,100%,0.6)"
    class="vditor-container"
  >
    <div class="sticky-box">
      <topic-list
        v-show="showTopic"
        class="action-vditor"
        @selectedTopic="selectActions"
      />
      <emoji-list
        v-show="showEmoji"
        class="action-vditor"
        @selectEmoji="selectActions"
      />
    </div>
    <div id="vditor" />
    <span v-if="textLimit" class="tip">{{
      textLimit >= textLength
        ? $t("post.note", { num: textLimit - textLength })
        : $t("post.exceed", { num: textLength - textLimit })
    }}</span>
    <caller
      v-if="showCaller"
      @close="$emit('close')"
      @selectedCaller="selectActions"
    />
    <el-button
      class="button-publish"
      :loading="onPublish"
      type="primary"
      size="small"
      @click="publish"
    >{{ $t("post.post") }}</el-button>
  </div>
</template>

<script>
const Vditor = process.client ? require('vditor') : '';
import { call, emoji, topic, picture } from '@/assets/svg-icons/vditor-icon';
import service from '@/api/request';
import handleError from '@/mixin/handleError';

export default {
  name: 'Vditor',
  mixins: [handleError],
  props: {
    showCaller: {
      type: Boolean,
      default: false
    },
    showTopic: {
      type: Boolean,
      default: false
    },
    showEmoji: {
      type: Boolean,
      default: false
    },
    text: {
      type: String,
      default: ''
    },
    textLimit: {
      type: [Number, String],
      default: 49999
    },
    textLength: {
      type: [Number, String],
      default: 0
    },
    isEdit: {
      type: Boolean,
      default: false
    },
    attachmentSizeLimit: {
      type: Number,
      default: 999999999999999999999
    },
    imageAccept: {
      type: String,
      default: ''
    },
    onUploadImage: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: ''
    },
    onPublish: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      vditor: {},
      input: {},
      range: [],
      afterVditorInit: false
    };
  },
  watch: {
    isEdit: {
      handler(isEdit) {
        if (isEdit && this.text) this.setDefaultValue();
      },
      immediate: true
    }
  },
  mounted() {
    Vditor && this.initVditor();
  },
  methods: {
    initVditor() {
      this.vditor = new Vditor('vditor', {
        minHeight: 450,
        placeholder: this.placeholder,
        mode: 'wysiwyg',
        tab: '    ',
        input: value => {
          this.$emit('textChange', value);
        },
        toolbar: [
          {
            hotkey: '',
            name: '@',
            tipPosition: 'ne',
            tip: '@ 好友',
            className: 'right',
            icon: call,
            click: () => {
              this.range = getSelection().getRangeAt(0);
              this.$emit('onActions', 'showCaller');
            }
          },
          {
            hotkey: '',
            name: '#',
            tipPosition: 'ne',
            tip: '新增话题',
            className: 'right',
            icon: topic,
            click: () => {
              this.range = getSelection().getRangeAt(0);
              this.$emit('onActions', 'showTopic');
            }
          },
          {
            hotkey: '',
            name: 'my-emoji',
            tipPosition: 'ne',
            tip: '插入表情',
            className: 'right',
            icon: emoji,
            click: () => {
              this.range = getSelection().getRangeAt(0);
              this.$emit('onActions', 'showEmoji');
            }
          },
          'headings',
          'bold',
          'italic',
          'strike',
          'link',
          'list',
          'ordered-list',
          'check',
          'outdent',
          'indent',
          'quote',
          {
            hotkey: '',
            name: 'picture',
            tipPosition: 'ne',
            tip: '插入图片',
            className: 'right',
            icon: picture,
            click: () => {
              this.uploader();
            }
          },
          'line',
          'code',
          'inline-code',
          'table',
          'both',
          'br',
          'undo',
          'redo'
        ],
        toolbarConfig: { pin: true },
        cache: { enable: false },
        after: () => {
          this.afterVditorInit = true;
        }
      });
    },
    uploader() {
      if (this.onUploadImage) {
        return this.$message.warning('请等待上传中的图片完成上传');
      }
      this.input = document.createElement('input');
      this.input.type = 'file';
      this.input.multiple = true;
      this.input.accept = this.imageAccept;
      this.input.dispatchEvent(new MouseEvent('click'));
      this.input.oninput = e => {
        const files = e.target.files;
        const fileArray = [];
        // if (this.onUploadImage) return this.$message.warning('请等待上传中的图片完成上传')
        if (!this.checkSizeLimit(files)) return; // 文件大小检查
        for (let i = 0; i < files.length; i++) {
          fileArray.push(files[i]);
        }
        const promiseList = fileArray.reduce((result, file) => {
          result.push(this.uploadFile(file));
          return result;
        }, []);
        this.uploadFiles(promiseList);
      };
    },
    uploadFile(file) {
      const formData = new FormData();
      formData.append('type', 1); // image 1
      formData.append('file', file);
      return service.post('/attachments', formData);
    },
    uploadFiles(promiseList) {
      this.$emit('update:onUploadImage', true);
      Promise.all(promiseList)
        .then(
          resList => {
            const files = resList.map(item => item.data.data);
            files.forEach(item => {
              const html = `<img src="${item.attributes.url}" alt="${item.attributes.fileName}" title="${item.id}">`;
              const markdown = this.vditor.html2md(html);
              this.vditor.insertValue(markdown.substr(0, markdown.length - 1));
            });
            this.input.value = '';
          },
          e => {
            this.input.value = '';
            this.handleError(e).then(() => {});
          }
        )
        .finally(() => {
          this.$emit('update:onUploadImage', false);
        });
    },
    selectActions(code) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(this.range);
      this.vditor.insertValue(code);
      this.$emit('hideActions');
    },
    checkSizeLimit(files) {
      let pass = true;
      for (let i = 0; i < files.length; i++) {
        if (files[i].size > this.attachmentSizeLimit) pass = false;
      }
      if (!pass) {
        this.$message.error(
          `图片大小不可超过 ${this.attachmentSizeLimit / 1024 / 1024} MB`
        );
      }
      return pass;
    },
    publish() {
      const value = this.vditor.getValue();
      this.$emit('textChange', value);
      this.$emit('publish');
    },
    setDefaultValue() {
      if (this.afterVditorInit) {
        this.vditor.setValue(this.text, false);
      } else {
        setTimeout(this.setDefaultValue, 100);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.vditor-container {
  position: relative;
  margin-top: 20px;

  ::v-deep a {
    color: #1878f3;

    &:hover {
      border-bottom: 1px solid #1878f3;
    }
  }

  > .sticky-box {
    // 保证 topicList 和 emojiList 的定位正确
    position: sticky;
    background: rgba(0, 0, 0, 0);
    top: 65px;
    z-index: 1000;
    height: 1px;

    > .action-vditor {
      position: absolute;
      top: 38px;
      left: 2px;
    }
  }

  > .tip {
    position: absolute;
    color: #d0d4dc;
    top: 8px;
    z-index: 10;
    right: 10px;
  }

  > .button-publish {
    margin-top: 20px;
  }

  ::v-deep.vditor-toolbar {
    background: #f5f6f7;
    top: 65px;
    padding-left: 10px !important;
  }

  ::v-deep.vditor-content pre {
    padding: 13px !important;
  }
}
</style>
