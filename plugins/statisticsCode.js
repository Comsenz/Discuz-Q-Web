/* eslint-disable no-useless-escape */
import service from '@/api/request';
export default function statisticsCode() {
  // 引入统计js
  service.get('/forum').then(res => {
    if (res.status === 200 && res.data && res.data.data) {
      const data = res.data.data;
      if (process.client && data.attributes && data.attributes.set_site && data.attributes.set_site.site_stat) {
        evalscript(data.attributes.set_site.site_stat);
      }
    }
  });
}

function evalscript(s) {
  if (s.indexOf('<script') === -1) return s;
  const p = /<script[^\>]*?>([^\x00]*?)<\/script>/gi;
  let arr = [];
  while ((arr = p.exec(s))) {
    let p1 = /<script[^\>]*?src=\"([^\>]*?)\"[^\>]*?(reload=\"1\")?(?:charset=\"([\w\-]+?)\")?><\/script>/i;
    let arr1 = [];
    arr1 = p1.exec(arr[0]);
    if (arr1) {
      appendscript(arr1[1], '', arr1[2], arr1[3]);
    } else {
      p1 = /<script(.*?)>([^\x00]+?)<\/script>/i;
      arr1 = p1.exec(arr[0]);
      appendscript('', arr1[2], arr1[1].indexOf('reload=') !== -1);
    }
  }
  return s;
}

function appendscript(src, text, reload, charset) {
  const id = hash(src + text);
  const evalscripts = [];
  const JSLOADED = [];
  if (!reload && in_array(id, evalscripts)) return;
  if (reload && document.getElementById(id)) {
    document.getElementById(id).parentNode.removeChild(document.getElementById(id));
  }
  evalscripts.push(id);
  const scriptNode = document.createElement('script');
  scriptNode.type = 'text/javascript';
  scriptNode.id = id;
  try {
    if (src) {
      scriptNode.src = src;
      scriptNode.onloadDone = false;
      scriptNode.onload = () => {
        scriptNode.onloadDone = true;
        JSLOADED[src] = 1;
      };
      scriptNode.onreadystatechange = function() {
        if (
          (scriptNode.readyState === 'loaded' || scriptNode.readyState === 'complete')
          && !scriptNode.onloadDone
        ) {
          scriptNode.onloadDone = true;
          JSLOADED[src] = 1;
        }
      };
    } else if (text) {
      scriptNode.text = text;
    }
    document.getElementsByTagName('head')[0].appendChild(scriptNode);
  } catch (e) {
    console.log(e);
  }
}

function hash(string, length = 32) {
  let start = 0;
  let i = 0;
  let result = '';
  let filllen = '';
  filllen = length - (string.length % length);
  for (i = 0; i < filllen; i += 1) {
    string += '0';
  }
  while (start < string.length) {
    result = stringxor(result, string.substr(start, length));
    start += length;
  }
  return result;
}

function stringxor(s1, s2) {
  let s = '';
  const hash = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const max = Math.max(s1.length, s2.length);
  for (let i = 0; i < max; i++) {
    const k = s1.charCodeAt(i) ^ s2.charCodeAt(i);
    s += hash.charAt(k % 52);
  }
  return s;
}

function in_array(needle, haystack) {
  if (typeof needle === 'string' || typeof needle === 'number') {
    for (const i in haystack) {
      if (haystack[i] === needle) {
        return true;
      }
    }
  }
  return false;
}
