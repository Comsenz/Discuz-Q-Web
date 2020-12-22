<template>
  <div class="author">
    <div class="title">{{ $t("topic.aboutAuthor") }}</div>
    <avatar-component :author="author" class="author-info">
      {{ $t("topic.activeAt") }} {{ timerDiff(author.updatedAt)
      }}{{ $t("topic.before") }}
    </avatar-component>
    <div class="signature">{{ author.signature }}</div>
    <div class="container-billBoard">
      <div
        v-for="(item, index) in billboard"
        :key="index"
        class="billBoard-item"
        @click="toprofile(index)"
      >
        <div class="text">{{ item.text }}</div>
        <div class="count">{{ item.count }}</div>
      </div>
    </div>
    <div v-if="canOpera" class="buttons">
      <el-button
        type="primary"
        :loading="followLoading"
        @click="followStatus === 0 ? $emit('follow') : $emit('unFollow')"
      >
        {{
          followStatus === 0
            ? "+ " + $t("profile.following")
            : followStatus === 1
              ? $t("profile.followed")
              : $t("profile.mutualfollow")
        }}
      </el-button>
      <el-button @click="openChatBox">{{ $t("topic.sendMessage") }}</el-button>
    </div>
    <chat-box
      v-if="chatting"
      :dialog="dialog || {}"
      @close="chatting = false"
    />
  </div>
</template>

<script>
const include = 'groups,dialog';
import timerDiff from '@/mixin/timerDiff';
import handleError from '@/mixin/handleError';

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
    followStatus: {
      type: Number,
      default: 0
    },
    canOpera: {
      type: Boolean,
      default: false
    },
    followLoading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dialog: { id: '', name: '' },
      chatting: false
    };
  },
  watch: {
    author: {
      handler() {
        this.getAuthorInfo();
      }
    },
    deep: true
  },
  mounted() {
    this.getAuthorInfo();
  },
  methods: {
    getAuthorInfo() {
      if (!this.author.id || (this.author.id && this.author.id === -1)) return;
      return this.$store
        .dispatch('jv/get', [
          `users/${this.author._jv.id}`,
          { params: { include }}
        ])
        .then(
          res => {
            if (res.dialog) this.dialog.id = res.dialog._jv.id;
            this.dialog.name = this.author.username;
          },
          e => this.handleError(e)
        );
    },
    openChatBox() {
      this.chatting = true;
    },
    toprofile(index) {
      this.$router.push(`/user/${this.author._jv.id}?current=${index + 1}`);
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/variable/color.scss";

.author {
  margin-top: 0;
  padding: 20px;
  background: #ffffff;
  border-radius: 3px;
  box-shadow: 0 3px 3px rgba(0, 0, 0, 0.03);
  > .title {
    font-size: 16px;
    color: #6d6d6d;
  }

  > .author-info {
    margin-top: 20px;
  }

  > .signature {
    font-size: 12px;
    word-break: break-all;
    margin-top: 10px;
    color: $font-color-grey;
  }

  > .container-billBoard {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid $border-color-base;
    display: flex;
    justify-content: space-between;

    > .billBoard-item {
      flex: 1;
      text-align: center;
      cursor: pointer;

      > .text {
        color: $font-color-grey;
        font-size: 12px;
      }

      > .count {
        font-weight: bold;
        font-size: 16px;
        line-height: 22px;
      }
    }
  }

  > .buttons {
    margin-top: 20px;
    display: flex;
    justify-content: space-between;

    ::v-deep.el-button {
      width: 120px;
    }

    > button {
      &:nth-child(1) {
        color: white;
      }
    }

    ::v-deep.el-button--default {
      color: $color-blue-base;
      border: 1px solid $color-blue-base;
      &:hover {
        background: #e5f2ff !important;
        border: 1px solid #d4e6fc;
      }
    }

    @media screen and (max-width: 1005px) {
      ::v-deep.el-button {
        width: 85px;
      }
    }
  }
}
</style>
