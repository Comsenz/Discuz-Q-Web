<template>
  <svg
    :class="['svg-icon','svg-icon-' + type, rotate ? 'rotate' : '']"
    role="img"
    :title="type"
    aria-hidden="true"
    @click="$emit('click')"
  >
    <use :xlink:href="'#' + type" />
  </svg>
</template>

<script>
export default {
  name: 'SvgIcon',
  props: {
    type: {
      type: String,
      default: ''
    },
    rotate: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style scoped>
.svg-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
  transition: all ease 0.3s;
}
@keyframes rotating{
  from{transform:rotate(0)}
  to{transform:rotate(360deg)}
}

.rotate {
  animation:rotating 1.2s linear infinite
}
</style>
