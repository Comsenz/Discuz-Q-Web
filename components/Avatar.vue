<template>
  <a style="display: block" :href="preventJump ? 'javascript:void(0)' : ('/profile/' + user.id)" :class="[sizeClass]">
    <img
      v-if="avatarUrl && !errorUrl"
      :src="user.avatarUrl"
      :class="[sizeClass, roundClass]"
      :alt="user.username"
      @error="error"
    >
    <div v-else-if="styleText" :class="['avatar', sizeClass, roundClass]" :style="styleText">
      {{ usernameAt }}
    </div>
  </a>
</template>

<script>
import stringToColor from '@/utils/stringToColor'

export default {
  props: {
    user: {
      type: [Object, String],
      default: () => {}
    },
    size: {
      type: [Number, String],
      default: 50
    },
    round: {
      type: Boolean,
      default: false
    },
    preventJump: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      errorUrl: false,
      sizes: {
        80: 'font-size: 32px;line-height: 80px;border-radius: 14px',
        70: 'font-size: 28px;line-height: 70px;border-radius: 12px',
        60: 'font-size: 26px;line-height: 60px;border-radius: 10px',
        50: 'font-size: 24px;line-height: 50px;border-radius: 8px',
        45: 'font-size: 22px;line-height: 45px;border-radius: 8px',
        30: 'font-size: 18px;line-height: 30px;border-radius: 6px',
        35: 'font-size: 18px;line-height: 30px;border-radius: 6px'
      }
    }
  },
  computed: {
    avatarUrl() {
      return this.user.avatarUrl && this.user.avatarUrl.indexOf('/static/noavatar.gif') !== 0
    },
    usernameAt() {
      return this.user.username ? this.user.username.charAt(0).toUpperCase() : ''
    },
    styleText() {
      return `background-color: #${stringToColor(this.usernameAt)};${this.sizes[this.size]}`
    },
    sizeClass() {
      return 'avatar-size-' + this.size
    },
    roundClass() {
      return this.round ? 'round' : ''
    }
  },
  methods: {
    error() {
      this.errorUrl = true
    }
  }
}
</script>

<style lang="scss" scoped>
  .avatar-size-80 {
    width: 80px;
    height: 80px;
    border-radius: 14px;
  }

  .avatar-size-70 {
    width: 70px;
    height: 70px;
    border-radius: 12px;
  }

  .avatar-size-60 {
    width: 60px;
    height: 60px;
    border-radius: 10px;
  }
  .avatar-size-50 {
    width: 50px;
    height: 50px;
    border-radius: 8px;
  }
  .avatar-size-45 {
    width: 45px;
    height: 45px;
    border-radius: 8px;
  }
  .avatar-size-35 {
    width: 35px;
    height: 35px;
    border-radius: 6px;
  }
  .avatar-size-30 {
    width: 30px;
    height: 30px;
    border-radius: 6px;
  }

  .round {
    border-radius: 50% !important;
  }

  .avatar {
    color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
