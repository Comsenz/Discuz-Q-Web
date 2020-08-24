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
          :placeholder="$t('discuzq.post.placeholder')"
          :maxlength="10000"
        />
        <!--focus="focusEvent"-->
        <!--:focus="type !== 1"-->
      </label>
      <span class="tip">还能输入 500 字</span>
      <div class="emojiList">
        <emoji-list v-show="showEmoji" @selectEmoji="selectEmoji" />
      </div>
      <div class="actions">
        <div class="block">
          <template v-for="(icon, index) in actions">
            <svg-icon :key="index" :type="icon" class="svg" style="font-size: 20px" @click="onActions(icon)" />
          </template>
        </div>
        <div class="block">
          <template v-for="(icon, index) in markdown">
            <svg-icon :key="index" :type="'markdown-' + icon" class="svg" style="font-size: 20px" @click="editMarkdown(icon)" />
          </template>
        </div>
      </div>
    </div>

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
      selectionStart: 0,
      selectionEnd: 0,
      showEmoji: false,
      actions: ['emoji', 'call', 'tag'],
      markdown: ['bold', 'header', 'italics', 'code', 'more-code', 'link', 'list', 'order-list']
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
    onActions(command) {
      switch (command) {
        case 'emoji' :
          this.showEmoji = !this.showEmoji
          break
      }
    },
    editMarkdown(command) {
      alert(command)
    },
    selectEmoji(code) {
      this.selectionStart = document.getElementById('textarea').selectionStart
      this.selectionEnd = document.getElementById('textarea').selectionEnd
      console.log(this.selectionStart, this.selectionEnd)
      this.text = this.text.slice(0, this.selectionStart) + code + this.text.slice(this.selectionStart, this.text.length)
      this.showEmoji = false
    },
    emojiListener() {
      document.addEventListener('click', e => {
        let pass = true
        e.path.forEach(item => { if ((item.classList && item.classList.contains('emojiList')) || (item.classList && item.classList.contains('actions'))) pass = false })
        if (pass) this.showEmoji = false
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
     > .emojiList {
       position: absolute;
       bottom: -205px;
       left: 0;
     }
   }
  }
</style>
