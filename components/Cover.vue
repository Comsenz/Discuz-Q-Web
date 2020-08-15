<script>
export default {
  name: 'Cover',
  mounted() {
    const cover = document.createElement('div')
    cover.style.position = 'fixed'
    cover.style.top = '0'
    cover.style.left = '0'
    cover.style.width = '100%'
    cover.style.height = '100%'
    cover.style.background = 'rgba(0, 0, 0, .4)'
    cover.style.zIndex = '10'
    cover.id = 'cover'
    document.querySelector('body').appendChild(cover)
  },
  destroyed() {
    document.querySelector('#cover').remove()
  },
  render() {
    return ''
  }
}
</script>
