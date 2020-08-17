<template>
  <div class="code">
    <span v-for="(item, index) in 6" :key="index" :style="{'--color': color}" class="code-item">{{ password[index] ? '*' : ' ' }}</span>
  </div>
</template>

<script>
export default {
  name: 'PasswordInput',
  props: {
    color: {
      type: String,
      default: '#C5CAD5'
    }
  },
  data() {
    return {
      password: ''
    }
  },
  mounted() {
    document.addEventListener('keyup', this.onInput)
  },
  methods: {
    onInput(e) {
      if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].indexOf(e.key) > 0) this.password += e.key
      if (this.password.length >= 6) return this.$emit('password', this.password.substr(0, 6))
      if (e.key === 'Backspace') this.password = this.password.substr(0, this.password.length - 1)
    }
  }
}
</script>

<style lang="scss" scoped>
  .code {
    display: flex;
  > .code-item {
    display: inline-block;
    line-height: 50px;
    text-align: center;
    font-size: 40px;
    font-weight: bold;
    height: 50px;
    width: 36px;
    border-bottom: 1px solid var(--color);
    margin-top: 10px;
    margin-right: 10px;
    margin-bottom: 10px;
  &:last-child {
     margin-right: 0;
   }
  }
  }
</style>
