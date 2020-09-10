<template>
  <div class="chat-box">
    <div class="header">
      <span class="name">{{ dialog.name }}</span>
      <span>{{ $t('chat.chatWithYou') }}</span>
      <svg-icon class="icon-close" type="close" style="font-size: 16px" @click="$emit('close')" />
    </div>
    <div id="xxx" ref="chatContent" class="chat-content">
      <div v-if="loadMoreMessage" class="load-tip">{{ noMore ? $t('chat.noMore') : $t('chat.loadRecord') }}</div>
      <div v-for="(item, index) in recordList" :key="index" class="record">
        <div v-if="item.user_id === parseInt(userId)" class="record-item mine">
          <div class="message">
            <div class="message-box" v-html="item.message_text_html" />
            <div class="created-at">{{ formatDate(item.updated_at) }}</div>
          </div>
          <Avatar :user="item.user" :size="50" />
        </div>
        <div v-else class="record-item his">
          <Avatar :user="item.user" :size="50" />
          <div class="message">
            <div class="message-box">
              <div class="message-box" v-html="item.message_text_html" />
            </div>
            <div class="created-at">{{ formatDate(item.updated_at) }}</div>
          </div>
        </div>
      </div>
    </div>
    <editor
      class="chat-editor"
      editor-style="chat"
      selector="chat-editor"
      :type-information="chatType"
      :post.sync="chatContent"
      :on-publish="onChatPublish"
      @publish="chatPublish"
    />
    <Cover />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import handleError from '@/mixin/handleError'
export default {
  name: 'ChatBox',
  mixins: [handleError],
  props: {
    dialog: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      recordList: [],
      recordTotal: 0,
      pageLimit: 10,
      pollId: '',
      onChatPublish: false,
      chatContent: { text: '', imageList: [], attachedList: [] },
      chatType: { type: 4, textLimit: 450, showPayment: false, showTitle: false, showImage: false, showVideo: false,
        showAttached: false, showMarkdown: false, showEmoji: true, showTopic: false, showCaller: false },
      loadMoreMessage: false
    }
  },
  computed: {
    userId() {
      return this.$store.getters['session/get']('userId')
    },
    noMore() {
      return this.recordList.length === this.recordTotal
    }
  },
  watch: {
    dialog: {
      handler(val) {
        if (val.id && val.name) this.getChatRecord(val.id).then(() => this.$nextTick(() => { this.$refs.chatContent.scrollTop = this.$refs.chatContent.scrollHeight }))
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
    if (process.client) {
      this.activePolling()
      this.scrollListener()
    }
  },
  beforeDestroy() {
    process.client && window.clearInterval(this.pollId)
  },
  methods: {
    scrollListener() {
      this.$refs.chatContent.addEventListener('scroll', e => {
        if (e.target.scrollTop === 0) {
          if (this.loadMoreMessage) return
          this.loadMoreMessage = true
          this.pageLimit += 10
          this.getChatRecord(this.dialog.id)
        }
      })
    },
    activePolling() {
      this.pollId = window.setInterval(() => {
        if (this.dialog.id) this.getChatRecord(this.dialog.id)
      }, 1500)
    },
    getChatRecord(id) {
      const params = { 'filter[dialog_id]': id, include: 'user,user.groups', 'page[number]': 1, 'page[limit]': this.pageLimit, sort: '-createdAt' }
      return this.$store.dispatch('jv/get', ['dialog/message', { params }]).then(res => {
        const { _jv: { json: { meta: { total }}}} = res
        this.recordList = [...res].reverse()
        this.onChatPublish = false
        if (this.recordTotal !== total && !this.loadMoreMessage) this.$nextTick(() => { this.$refs.chatContent.scrollTop = this.$refs.chatContent.scrollHeight })
        this.loadMoreMessage = false
        this.recordTotal = total
      }, e => this.handleError(e))
    },
    formatDate(date) {
      return dayjs(new Date(date)).format('YYYY-MM-DD HH:mm')
    },
    postMessage() {
      const params = { _jv: { type: 'dialog/message' }, dialog_id: this.dialog.id, message_text: this.chatContent.text }
      this.$store.dispatch('jv/post', params).then(() => {
        this.getChatRecord(this.dialog.id)
        this.chatContent.text = ''
      }, e => {
        this.onChatPublish = false
        this.handleError(e)
      })
    },
    createDialogAndPost() {
      const params = { _jv: { type: 'dialog' }, recipient_username: this.dialog.name, message_text: this.chatContent.text }
      this.$store.dispatch('jv/post', params).then(res => {
        this.getChatRecord(res._jv.id)
        this.chatContent.text = ''
      }, e => {
        this.onChatPublish = false
        this.handleError(e)
      })
    },
    chatPublish() {
      if (!this.chatContent.text) return this.$message.warning(this.$t('chat.messageCannotBeBlack'))
      if (this.chatContent.text.length > 450) return this.$message.warning(this.$t('chat.messageLengthCannotOver'))
      if (this.onChatPublish) return
      this.onChatPublish = true
      this.dialog.id ? this.postMessage() : this.createDialogAndPost()
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '@/assets/css/variable/color.scss';
  .chat-box {
    z-index: 100;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 620px;
    height: 600px;
    border-radius: 3px;
    background: $background-color-grey;
    > .header {
      height: 50px;
      background: $background-color-grey;
      border-radius: 3px;
      text-align: center;
      position: relative;
      font-size: 16px;
      > span {
        &.name {
          font-weight: bold;
          margin-right: 5px;
        }
        line-height: 50px;
      }
      > .icon-close {
        cursor: pointer;
        position: absolute;
        top: 50%;
        right: 15px;
        transform: translateY(-50%);
      }
    }
    > .chat-content {
      background: $background-color-grey;
      padding: 0 30px 30px 30px;
      height: 500px;
      overflow: auto;
      overscroll-behavior: contain;
      > .load-tip {
        text-align: center;
        color: $font-color-grey
      }
      > .record {
        position: relative;
        > .record-item {
          width: 100%;
          margin-top: 30px;
          display: flex;
          > .message {
            margin-left: 20px;
            > .message-box {
              word-break: break-all;
              position: relative;
              padding: 15px;
              max-width: 360px;
              background: #ffffff;
              border: 1px solid $border-color-base;
              border-radius: 5px;
              ::v-deep p {
                font-size: 16px;
              }

              ::v-deep img {
                height: 22px;
              }

              &::before {
                content: '';
                position: absolute;
                top: 20px;
                left: -6px;
                display: block;
                width: 10px;
                height: 10px;
                background: #ffffff;
                border-left: 1px solid $border-color-base;
                border-bottom: 1px solid $border-color-base;
                border-radius: 1px;
                transform: rotate(45deg);
              }
            }
            > .created-at {
              position: absolute;
              bottom: -20px;
              left: 70px;
              color: $font-color-grey;
            }

          }
          &.mine {
            justify-content: flex-end;
            > .message {
              margin-left: 0;
              margin-right: 20px;
              text-align: right;
              > .created-at {
                left: auto;
                right: 70px;
              }
              > .message-box {
                background: #d1e0ff;
                text-align: left;
                &::before {
                  background: #d1e0ff;
                  left: auto;
                  right: -6px;
                  border: none;
                  border-right: 1px solid $border-color-base;
                  border-top: 1px solid $border-color-base;
                }
              }
            }
          }
        }

      }

    }
    > .chat-editor {
      margin-top: 0 !important;
    }
  }
</style>
