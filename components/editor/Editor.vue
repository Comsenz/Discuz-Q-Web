<template>
  <div class="editor">
    <label v-if="titleShow">
      <input v-model="title" placeholder="请输入文章标题" class="input-title" type="text">
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
      <span class="tip">还能输入 {{ textLimit - text.length }} 字</span>
      <div class="emojiList">
        <emoji-list v-show="showEmoji" @selectEmoji="selectEmoji" />
      </div>
      <div class="topic-list">
        <topic-list v-show="showTopic" @selectedTopic="selectTopic" />
      </div>
      <div class="actions">
        <div class="block">
          <template v-for="(icon, index) in actions">
            <svg-icon :key="index" :type="icon" class="svg" style="font-size: 20px" @click="onActions(icon)" />
          </template>
        </div>
        <div class="block">
          <template v-for="(markdown, index) in markdownList">
            <svg-icon :key="index" :type="'markdown-' + markdown.icon" class="svg" style="font-size: 20px" @click="editMarkdown(markdown)" />
          </template>
        </div>
      </div>
    </div>
    <caller v-if="showCaller" @close="showCaller = false" @selectedCaller="selectedCaller" />
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
      actions: ['emoji', 'call', 'topic'],
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
    this.topicListener()
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
    onActions(command) {
      switch (command) {
        case 'emoji' : this.showEmoji = !this.showEmoji
          break
        case 'call' : this.showCaller = true
          break
        case 'topic' : this.showTopic = !this.showTopic
          break
      }
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
    selectEmoji(code) {
      this.getSelection()
      this.text = this.text.slice(0, this.selectionStart) + code + this.text.slice(this.selectionStart, this.text.length)
      this.showEmoji = false
    },
    emojiListener() {
      document.addEventListener('click', e => {
        let pass = true
        e.path.forEach(item => { if ((item.classList && item.classList.contains('emojiList')) || (item.classList && item.classList.contains('actions'))) pass = false })
        if (pass) this.showEmoji = false
      })
    },
    topicListener() {
      document.addEventListener('click', e => {
        let pass = true
        e.path.forEach(item => { if ((item.classList && item.classList.contains('topic-list')) || (item.classList && item.classList.contains('actions'))) pass = false })
        if (pass) this.showTopic = false
      })
    },
    selectedCaller(callerList) {
      // TODO 重复结构
      this.getSelection()
      callerList = callerList.map(item => item + ' ')
      const callerText = ' @' + callerList.join('@')
      this.text = this.text.slice(0, this.selectionStart) + callerText + this.text.slice(this.selectionStart, this.text.length)
      this.showCaller = false
      console.log(callerText, 'callers')
    },
    selectTopic(topic) {
      this.getSelection()
      this.text = this.text.slice(0, this.selectionStart) + topic + this.text.slice(this.selectionStart, this.text.length)
      this.showTopic = false
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
     > .emojiList {
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
