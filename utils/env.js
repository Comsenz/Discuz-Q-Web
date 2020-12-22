const $ua = process.client && navigator.userAgent.toLowerCase();
export default {
  isWeixinBrowser: /micromessenger/.test($ua),
  isMobile: /mobile|android|webos|iphone|blackberry/i.test($ua),
  // eslint-disable-next-line max-len
  isTablet: /(?:ipad|playbook)/.test($ua) || (/(?:android)/ && !/(?:mobile)/.test($ua)) || (/(?:firefox)/ && /(?:tablet)/.test($ua)),
  isPC: '',
  isSpider: false
};
