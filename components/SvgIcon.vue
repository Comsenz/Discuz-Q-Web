<script>
export default {
  name: 'SvgIcon',
  props: {
    type: {
      type: String,
      default: ''
    }
  },
  render() {
    return (
      <svg
        class={'svg-icon svg-icon-' + this.type}
        role='img'
        title={this.type}
        aria-hidden='true'
      >
        <use xlinkHref={'#' + this.type} />
      </svg>
    )
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
