module.exports = {
  computed: {
    key() {
      const forums = this.$store.state.site.info.attributes
      return forums.lbs.qq_lbs_key
    }
  },
  methods: {
    createLocationPicker() {
      document.body.appendChild(this.createIframe())
    },
    createIframe() {
      const iframe = document.createElement('iframe')
      iframe.id = 'mapPage'
      iframe.width = '500px'
      iframe.height = '700px'
      iframe.style.border = '1.5px solid rgba(228,228,228,0.6)'
      iframe.style.borderRadius = '8px'
      iframe.style.position = 'fixed'
      iframe.style.top = '50%'
      iframe.style.left = '50%'
      iframe.style.transform = 'translate(-50%, -50%)'
      iframe.style.zIndex = '1000'
      iframe.src = `https://apis.map.qq.com/tools/locpicker?search=1&type=1&key=${this.key}&referer=discuzq`
      return iframe
    },
    removeLocationPicker() {
      const iframe = document.getElementById('mapPage')
      console.log(iframe, 'node')
      iframe && document.removeChild(iframe)
    }
  }
}
