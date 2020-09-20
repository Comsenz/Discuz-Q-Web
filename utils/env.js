const $ua = process.client && navigator.userAgent.toLowerCase()
console.log('$ua', $ua)
export default {
  isWeixinBrowser: /micromessenger/.test($ua),
  isMobile: /mobile|Android|webOS|iPhone|BlackBerry/i.test($ua),
  isPC: ''
}
