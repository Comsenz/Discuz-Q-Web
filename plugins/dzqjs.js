export default function dzqjs() {
  // 引入第三方js
  if (process.client) {
    window.sessionStorage.setItem('__TD_td_channel', window.location.hostname.replace(/\./g, '_'));
    const tdjs = document.createElement('script');
    tdjs.type = 'text/javascript';
    tdjs.async = true;
    tdjs.src = 'https://jic.talkingdata.com/app/h5/v1?appid=750AEE91CF4446A19A2D12D5EE32F725';
    document.getElementsByTagName('body')[0].appendChild(tdjs);

    const dzqjs = document.createElement('script');
    dzqjs.type = 'text/javascript';
    dzqjs.async = true;
    dzqjs.src = 'https://dl.discuz.chat/dzq.js';
    document.getElementsByTagName('body')[0].appendChild(dzqjs);
  }
}
