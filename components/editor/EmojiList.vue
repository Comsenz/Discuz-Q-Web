<template>
  <div class="global">
    <div class="emoji-list">
      <span v-for="(emoji, index) in emojiList" :key="index" @click="$emit('selectEmoji', emoji.code)">
        <img :src="emoji.url" :alt="emoji.code">
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Emoji',
  data() {
    return {
      emojiList: []
    }
  },
  mounted() {
    this.getEmojiList()
  },
  methods: {
    getEmojiList() {
      this.$store.dispatch('jv/get', ['emoji', {}]).then(data => {
        this.emojiList = data
        // TODO this.$store.commit('emoji/SET_EMOJI', this.list)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/variable/color.scss';
  .global {
    width: 370px;
    height: 200px;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
    border-radius: 5px;
    background: #ffffff;
    position: relative;

    &::after {
      content: '';
      display: block;
      width: 20px;
      height: 20px;
      position: absolute;
      border-radius: 5px;
      transform: rotate(45deg);
      background: #ffffff;
      border-left: 1px solid $border-color-base;
      border-top: 1px solid $border-color-base;
      top: -10px;
      left: 20px;
      z-index: 2;
    }

    > .emoji-list {
      border-radius: 5px;
      width: 370px;
      height: 200px;
      z-index: 10;
      position: absolute;
      top: 0;
      left: 0;
      padding: 15px;
      overflow: auto;
      background: #ffffff;
    }

    img {
      cursor: pointer;
      width: 30px;
      height: 30px;
    }
  }
</style>
