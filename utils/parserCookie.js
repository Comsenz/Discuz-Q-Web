export default {
  get: function(name, cookie) {
    // eslint-disable-next-line no-mixed-operators
    const _cookie = cookie || process.client && document.cookie || '';
    const cookieName = `${encodeURIComponent(name)}=`;
    const cookieStart = _cookie.indexOf(cookieName);
    let val = null;

    if (cookieStart > -1) {
      let cookieEnd = _cookie.indexOf(';', cookieStart);
      if (cookieEnd === -1) {
        cookieEnd = _cookie.length;
      }
      val = decodeURIComponent(_cookie.substring(cookieStart + cookieName.length, cookieEnd));
    }

    return val;
  },
  set: function(name, value, expires, path, domain, secure) {
    let cookieText = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    expires instanceof Date && (cookieText += `; expires${expires.toGMTString()}`);

    path && (cookieText += `; path=${path}`);

    domain && (cookieText += `; domain=${domain}`);

    secure && (cookieText += '; secure');

    document.cookie = cookieText;
  },
  remove: function(name, path, domain, secure) {
    this.set(name, '', new Date(0), path, domain, secure);
  }
};
