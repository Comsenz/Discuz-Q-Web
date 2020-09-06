<template>
  <svg
    :class="'svg-icon svg-icon-' + type"
    role="img"
    :title="type"
    aria-hidden="true"
    @click="$emit('click')"
  >
    <use :xlink:href="'#' + type" @click="$emit('click')" />
  </svg>
</template>

<script>
export default {
  name: 'SvgIcon',
  props: {
    type: {
      type: String,
      default: ''
    }
  }
}
</script>

<style>
.svg-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
  transition: all ease 0.3s;
}
</style>
