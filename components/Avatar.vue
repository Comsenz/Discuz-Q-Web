<template>
  <div @click="click">
    <img
      v-if="avatarUrl && !errorUrl"
      :src="user.avatarUrl"
      :class="'avatar-size-' + size"
      :alt="user.username"
      @error="error"
    >
    <div v-else-if="styleText" :class="'avatar avatar-size-' + size" :style="styleText">
      {{ usernameAt }}
    </div>
  </div>
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
        30: 'font-size: 18px;line-height: 30px;border-radius: 50%'
      }
    }
  },
  computed: {
    avatarUrl() {
      return this.user.avatarUrl && this.user.avatarUrl.indexOf('/static/noavatar.gif') !== 0
    },
    usernameAt() {
      return this.user.username ? this.user.username.charAt(0).toUpperCase() : this.$t('core.noAvatar')
    },
    styleText() {
      return `background-color: #${stringToColor(this.usernameAt)};${this.sizes[this.size]}`
    }
  },
  methods: {
    error() { this.errorUrl = true },
    click() { this.$emit('click') }
  }
}
</script>

<style lang="scss" scoped>
.avatar-size-80 {
  width: 80px;
  height: 80px;
}
.avatar-size-70 {
  width: 70px;
  height: 70px;
}
.avatar-size-60 {
  width: 60px;
  height: 60px;
}
.avatar-size-50 {
  width: 50px;
  height: 50px;
}

.avatar-size-30 {
  width: 30px;
  height: 30px;
  border-radius: 50%;
}

.avatar {
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
