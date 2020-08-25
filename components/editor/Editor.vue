<template>
  <div class="editor">
    <label v-if="titleShow">
      <input v-model="title" :placeholder="$t('post.pleaseInputPostTitle')" class="input-title" type="text">
    </label>
    <div class="container-textarea">
      <label v-show="textShow">
        <textarea
          id="textarea"
          v-model="text"
          class="input-text"
          :placeholder="$t('post.placeholder')"
          :maxlength="textLimit"
        />
      </label>
      <span class="tip">
        {{ textLimit>=text.length ? $t('post.note', { num: textLimit - text.length }) : $t('post.exceed', { num: text.length - textLimit }) }}
      </span>
      <div class="emoji-list">
        <emoji-list v-show="showEmoji" @selectEmoji="selectActions" />
      </div>
      <div class="topic-list">
        <topic-list v-show="showTopic" @selectedTopic="selectActions" />
      </div>
      <div class="actions">
        <div class="block">
          <template v-for="(action, index) in actions">
            <svg-icon :key="index" :type="action.icon" class="svg" style="font-size: 20px" @click="onActions(action.toggle)" />
          </template>
        </div>
        <div class="block">
          <template v-for="(markdown, index) in markdownList">
            <svg-icon :key="index" :type="'markdown-' + markdown.icon" class="svg" style="font-size: 20px" @click="editMarkdown(markdown)" />
          </template>
        </div>
      </div>
    </div>
    <caller v-if="showCaller" @close="showCaller = false" @selectedCaller="selectActions" />
  </div>
</template>

<script>
export default {
  name: 'Editor',
  data() {
    return {
      textShow: true,
      titleShow: true,
      title: '',
      text: '',
      textLimit: 10000,
      selectionStart: 0,
      selectionEnd: 0,
      showEmoji: false,
      showTopic: false,
      showCaller: false,
      listenerList: ['emoji-list', 'topic-list'],
      actions: [
        { icon: 'emoji', toggle: 'showEmoji' },
        { icon: 'call', toggle: 'showCaller' },
        { icon: 'topic', toggle: 'showTopic' }
      ],
      markdownList: [
        { icon: 'bold', tip: '粗体文字', code: '**', fn: 'markdownWrap' },
        { icon: 'header', tip: '标题', code: '### ', fn: 'markdownPrefix' },
        { icon: 'italics', tip: '斜体文字', code: '__', fn: 'markdownWrap' },
        { icon: 'quote', tip: '引用', code: '> ', fn: 'markdownPrefix' },
        { icon: 'code', tip: '代码块', code: '`', fn: 'markdownWrap' },
        { icon: 'delete-line', tip: '删除线', code: '~~', fn: 'markdownWrap' },
        { icon: 'link', tip: '链接', code: '[链接名](链接url)', fn: 'markdownUrl' },
        { icon: 'list', tip: '无序列表', code: '*', fn: 'markdownPrefix' },
        { icon: 'order-list', tip: '有序列表', code: '1. ', fn: 'markdownPrefix' }
      ]
    }
  },
  mounted() {
    this.autoHeight()
    this.emojiListener()
  },
  methods: {
    autoHeight() {
      const textarea = document.getElementById('textarea')
      textarea.onkeyup = function() {
        this.style.height = 'auto'
        this.style.height = this.scrollHeight + 'px'
      }
    },
    getSelection() {
      this.selectionStart = document.getElementById('textarea').selectionStart
      this.selectionEnd = document.getElementById('textarea').selectionEnd
    },
    onActions(toggle) {
      this[toggle] = !this[toggle]
    },
    editMarkdown(markdown) {
      this.getSelection()
      const frontText = this.text.slice(0, this.selectionStart)
      const centerText = this.text.slice(this.selectionStart, this.selectionEnd)
      const behindText = this.text.slice(this.selectionEnd, this.text.length)
      this[markdown.fn](frontText, centerText, behindText, markdown.code, markdown.tip)
    },
    markdownWrap(frontText, centerText, behindText, code, tip) {
      centerText = centerText || tip
      this.text = frontText + code + centerText + code + behindText
    },
    markdownPrefix(frontText, centerText, behindText, code, tip) {
      const content = (centerText + behindText) || tip
      frontText = frontText ? frontText + '\n' : ''
      this.text = frontText + code + content
    },
    markdownUrl(frontText, centerText, behindText, code, tip) {
      this.text = frontText + code + centerText + behindText
    },
    selectActions(code) {
      this.getSelection()
      this.text = this.text.slice(0, this.selectionStart) + code + this.text.slice(this.selectionStart, this.text.length)
      this.showEmoji = false
      this.showTopic = false
      this.showCaller = false
    },
    emojiListener() {
      document.addEventListener('click', e => {
        let pass = true
        e.path.forEach(item => {
          if (item.classList) {
            if (item.classList.contains('emoji-list') || item.classList.contains('topic-list') || item.classList.contains('actions')) pass = false
          }
        })
        if (pass) {
          this.showTopic = false
          this.showEmoji = false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/variable/color.scss';
 .editor {
   width: 100%;
   margin-top: 20px;
   label {
     width: 100%;
     > input {
       width: 100%;
       background: #f7f7f7;
     }
     > .input-title {
       height: 40px;
       padding: 0 15px;
       border-radius: 3px;
       border: 1px solid $border-color-base;
     }
     > .input-text {
       width: 100%;
       background: #f7f7f7;
       border: none;
       display: block;
       position: relative;
       resize: none;
       line-height: 16px;
       padding: 15px;
       min-height: 200px;
       overflow: hidden;
       transition: all 200ms linear;
     }

   }
   > .container-textarea {
     border: 1px solid $border-color-base;
     border-radius: 3px;
     position: relative;
     margin-top: 10px;
     > .actions {
       width: 100%;
       height: 45px;
       display: flex;
       align-items: center;
       background: #ffffff;
       > .block {
         > .svg {
           cursor: pointer;
           margin-left: 25px;
         }
       }
     }
     > .tip {
       position: absolute;
       bottom: 12.5px;
       right: 10px;
       color: #D0D4DC;
     }
     > .emoji-list {
       position: absolute;
       bottom: -205px;
       left: 0;
     }
     > .topic-list {
       position: absolute;
       top: calc(100% + 5px);
       left: 88px;
     }
   }
  }
</style>
