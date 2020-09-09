<template>
  <div class="chat-box">
    <div class="header">
      <span class="name">小李子</span>
      <span>与你对话</span>
      <svg-icon class="icon-close" type="close" style="font-size: 16px" />
    </div>
    <div id="xxx" ref="chatContent" class="chat-content">
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
      class="editor-chat"
      editor-style="chat"
      :type-information="chatType"
      :post.sync="chatContent"
      :on-publish="onChatPublish"
      @publish="postChatPublish"
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
      pageLimit: 10,
      onChatPublish: false,
      chatContent: { text: '', imageList: [], attachedList: [] },
      chatType: { type: 4, textLimit: 450, showPayment: false, showTitle: false, showImage: true, showVideo: false,
        showAttached: false, showMarkdown: false, showEmoji: true, showTopic: false, showCaller: false }
    }
  },
  computed: {
    userId() {
      return this.$store.getters['session/get']('userId')
    }
  },
  watch: {
    dialog: {
      handler(val) {
        if (val.id && val.name) this.getChatRecord()
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    getChatRecord() {
      const params = {
        'filter[dialog_id]': this.dialog.id,
        include: 'user,user.groups',
        'page[number]': 1,
        'page[limit]': this.pageLimit,
        sort: 'createdAt'
      }
      return this.$store.dispatch('jv/get', ['dialog/message', { params }]).then(res => {
        this.recordList = res
        this.onChatPublish = false
        this.$nextTick(() => {
          this.$refs.chatContent.scrollTop = 999
        })
      }, e => this.handleError(e))
    },
    formatDate(date) {
      return dayjs(new Date(date)).format('YYYY-MM-DD HH:mm')
    },
    postChatPublish() {
      if (!this.chatContent.text) return this.$message.warning('消息内容不能为空')
      if (!this.chatContent.text.length > 450) return this.$message.warning('消息内容不能超过 450 字')
      this.onChatPublish = true
      if (this.dialog.id) {
        const params = {
          _jv: {
            type: 'dialog/message'
          },
          dialog_id: this.dialog.id,
          message_text: this.chatContent.text
        }
        // 调用发送消息接口
        this.$store.dispatch('jv/post', params).then(res => {
          console.log('message ->', res)
          this.getChatRecord()
          this.chatContent.text = ''
        }, e => {
          this.onChatPublish = false
          this.handleError(e)
        })
      } else {
        alert('哈哈哈, 没人和你聊天')
      }
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
      > .record {
        position: relative;
        > .record-item {
          width: 100%;
          margin-top: 30px;
          display: flex;
          > .message {
            margin-left: 20px;
            > .message-box {
              position: relative;
              padding: 10px;
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
                &::before {
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
    > .editor-chat {
      margin-top: 0 !important;
    }
  }
</style>
