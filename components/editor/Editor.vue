<template>
  <div class="editor">
    <label v-if="titleShow">
      <input v-model="title" :placeholder="$t('post.pleaseInputPostTitle')" class="input-title" type="text">
    </label>
    <div class="container-textarea">
      <label>
        <textarea
          id="textarea"
          v-model="text"
          class="input-text"
          :placeholder="$t('post.placeholder')"
          :maxlength="textLimit"
        />
      </label>
      <div>
        <div v-if="showUploadImg || showUploadVideo" class="resources-list">
          <picture-upload v-if="showUploadImg" :url="url" :header="header" :image-id-list.sync="imageIdList" />
          <video-upload v-if="showUploadVideo" :video-list.sync="videoList" />
        </div>
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
              <svg-icon
                :key="index"
                :type="action.icon"
                class="svg"
                style="font-size: 20px"
                @click="onActions(action.toggle)"
              />
            </template>
          </div>
          <div class="block">
            <template v-for="(resource, index) in resources">
              <svg-icon
                :key="index"
                :type="resource.icon"
                class="svg"
                style="font-size: 20px"
                @click="addResource(resource.toggle)"
              />
            </template>
          </div>
          <editor-markdown :text="text" class="block" @changeText="changeText" />
          <el-button class="button-publish" type="primary" size="small" @click="publish">{{ $t('post.post') }} </el-button>
        </div>
        <caller v-if="showCaller" @close="showCaller = false" @selectedCaller="selectActions" />
      </div>

    </div>
  </div>
</template>

<script>
import handleError from '@/mixin/handleError'

export default {
  name: 'Editor',
  mixins: [handleError],
  props: {
    categoryId: {
      type: String,
      default: ''
    },
    type: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      titleShow: true,
      title: '',
      text: '',
      textLimit: 10000,
      selectionStart: 0,
      selectionEnd: 0,
      showEmoji: false,
      showTopic: false,
      showCaller: false,
      showUploadImg: false,
      showUploadVideo: false,
      imageIdList: [],
      videoList: [],
      listenerList: ['emoji-list', 'topic-list'],
      actions: [
        { icon: 'emoji', toggle: 'showEmoji' },
        { icon: 'call', toggle: 'showCaller' },
        { icon: 'topic', toggle: 'showTopic' }
      ],
      resources: [
        { icon: 'picture', toggle: 'showUploadImg' },
        { icon: 'video', toggle: 'showUploadVideo' }
      ]
    }
  },
  computed: {
    url() {
      // if (process.client) return window.location.origin
      return 'https://dq.comsenz-service.com'
    },
    header() {
      if (process.client) {
        const token = window.localStorage.getItem('access_token')
        return { authorization: `Bearer ${token}` }
      }
      return ''
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
    changeText(newText) {
      this.text = newText
    },
    getSelection() {
      this.selectionStart = document.getElementById('textarea').selectionStart
      this.selectionEnd = document.getElementById('textarea').selectionEnd
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
    },
    onActions(toggle) {
      this[toggle] = !this[toggle]
    },
    addResource(toggle) {
      this[toggle] = true
    },
    selectActions(code) {
      this.getSelection()
      this.text = this.text.slice(0, this.selectionStart) + code + this.text.slice(this.selectionStart, this.text.length)
      this.showEmoji = false
      this.showTopic = false
      this.showCaller = false
    },
    publish() {
      if (!this.categoryId) this.$message.warning('请选择分类')
      const params = {
        _jv: {
          type: `/threads`,
          relationships: {
            category: {
              data: { type: 'categories', id: this.categoryId }
            }
          }
        },
        title: this.title,
        content: this.text
      }
      if (this.type === 1 && this.imageIdList.length > 0) {
        params._jv.relationships.attachments = {}
        params._jv.relationships.attachments.data = this.imageIdList.splice(',').map(item => {
          const obj = {}
          obj.id = item
          obj.type = 'attachments'
          return obj
        })
      }
      if (this.type === 2 && this.videoList.length > 0) {
        params.file_id = this.videoList[0].id
        params.file_name = this.videoList[0].name
      }
      params.type = this.type
      return this.$store.dispatch('jv/post', params).then(data => {
        console.log(data, 'data')
      }, e => this.handleError(e))
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
    }

    .resources-list {
      background: #f7f7f7;
      padding: 20px;
    }

    .actions {
      width: 100%;
      height: 45px;
      display: flex;
      padding: 0 10px;
      align-items: center;
      background: #ffffff;

      > .block {
        padding: 0 10px;
        border-left: 1px solid $border-color-base;

        &:first-child {
          border: 0;
        }

        > .svg {
          cursor: pointer;
          margin-left: 20px;

          &:first-child {
            margin-left: 0;
          }
        }
      }

      > .button-publish {
        margin-left: auto;
      }
    }

    .tip {
      position: absolute;
      bottom: 50px;
      right: 10px;
      color: #D0D4DC;
    }

    .emoji-list {
      position: absolute;
      bottom: -205px;
      left: 0;
    }

    .topic-list {
      position: absolute;
      top: calc(100% + 5px);
      left: 88px;
    }
  }
</style>
