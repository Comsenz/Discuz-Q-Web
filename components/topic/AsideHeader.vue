<template>
  <div class="author">
    <div class="title">{{ $t('topic.aboutAuthor') }}</div>
    <avatar-component :author="author" class="author-info">
      {{ $t('topic.activeAt') }} {{ timerDiff(author.loginAt) }}{{ $t('topic.before') }}
    </avatar-component>
    <div class="signature">{{ author.signature }}</div>
    <div class="container-billBoard">
      <div v-for="(item, index) in billboard" :key="index" class="billBoard-item">
        <div class="text">{{ item.text }}</div>
        <div class="count">{{ item.count }}</div>
      </div>
    </div>
    <div class="buttons">
      <button
        :class="{disabled: !canFollow}"
        :disabled="!canFollow"
        @click="followed ? $emit('unFollow') : $emit('follow')"
      >{{ followed ? $t('home.followed') : $t('home.follow') }}</button>
      <button v-permission="openChatBox">{{ $t('topic.sendMessage') }}</button>
    </div>
    <chat-box v-if="chatting" :dialog="dialog || {}" @close="chatting = false" />
  </div>
</template>

<script>
const include = 'groups,dialog'
import timerDiff from '@/mixin/timerDiff'
import handleError from '@/mixin/handleError'
export default {
  name: 'AsideHeader',
  mixins: [handleError, timerDiff],
  props: {
    author: {
      type: Object,
      default: () => {}
    },
    billboard: {
      type: Array,
      default: () => []
    },
    followed: {
      type: Boolean,
      default: false
    },
    canFollow: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dialog: { id: '', name: '' },
      chatting: false
    }
  },
  watch: {
    author: {
      handler() {
        this.getAuthorInfo()
      }
    },
    deep: true
  },
  methods: {
    getAuthorInfo() {
      return this.$store.dispatch('jv/get', [`users/${this.author._jv.id}`, { params: { include }}]).then(res => {
        if (res.dialog) this.dialog.id = res.dialog._jv.id
        console.log('dialog -> ', this.dialog)
        this.dialog.name = this.author.username
      }, e => this.handleError(e))
    },
    openChatBox() {
      this.chatting = true
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '@/assets/css/variable/color.scss';

  .author {
    margin-top: 0;
    padding: 20px;
    background: #ffffff;
    border-radius: 3px;

    > .title {
      font-size: 16px;
      font-weight: bolder;
      color: #6D6D6D;
    }

    > .author-info {
      margin-top: 10px;
    }

    > .signature {
      margin-top: 10px;
      color: $font-color-grey;
    }

    > .container-billBoard {
      margin-top: 20px;
      padding: 20px 0;
      border-top: 1px solid $border-color-base;
      display: flex;
      justify-content: space-between;

      > .billBoard-item {
        flex: 1;
        text-align: center;

        > .text {
          color: $font-color-grey;
          font-size: 12px;
        }

        > .count {
          font-weight: bold;
          font-size: 16px;
          line-height: 20px;
        }
      }
    }

    > .buttons {
      display: flex;
      justify-content: space-between;

      > button {
        width: 120px;
        height: 35px;
        line-height: 35px;
        border-radius: 3px;
        text-align: center;

        &.disabled {
          cursor: not-allowed;
        }

        &:nth-child(1) {
          color: white;
          background: $color-blue-base;
        }

        &:nth-child(2) {
          color: $font-color-grey;
          border: 1px solid $border-color-base;
        }
      }

      @media screen and ( max-width: 1005px ) {
        button {
          width: 85px;
        }
      }
    }
  }
</style>
