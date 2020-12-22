<template>
  <div class="emoji-list">
    <span v-for="(emoji, index) in emojiList" :key="index" @click="$emit('selectEmoji', emoji.code)">
      <img :src="emoji.url" :alt="emoji.code">
    </span>
  </div>
</template>

<script>
export default {
  name: 'EmojiList',
  data() {
    return {
      emojiList: []
    };
  },
  mounted() {
    this.getEmojiList();
  },
  methods: {
    getEmojiList() {
      this.$store.dispatch('jv/get', ['emoji', {}]).then(data => {
        this.emojiList = data;
        // TODO this.$store.commit('emoji/SET_EMOJI', this.list)
      });
    }
  }
};
</script>

<style lang="scss" scoped>
  @import '@/assets/css/variable/color.scss';

  .emoji-list {
    border-radius: 6px;
    width: 370px;
    height: 200px;
    padding: 15px;
    overflow: auto;
    background: #ffffff;
    box-shadow: 0 5px 10px rgba(0, 0, 0, .3);
  }

  img {
    cursor: pointer;
    width: 30px;
    height: 30px;
  }
</style>
