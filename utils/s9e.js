/* eslint-disable */
// <p>&lt;p&gt;111&lt;/p&gt;</p>

const tags = {
  topic: text => {
    if (!text) return;
    const regexp = /<span\s*id="topic"\s*value="(?<value>\w+)"\s*>(?<string>[^<]+)<\/span>/gimu;
    return text.replace(regexp, match => {
      return match.replace(regexp, (content, value, text) => {
        const href = `/topic/${value}`;
        return `<a href="${href}" class="content-topic a-blue">${text}</a> `;
      });
    });
  },
  usermention: text => {
    if (!text) return;
    const regexp = /<span\s*id="member"\s*value="(?<value>\w+)"\s*>(?<string>[^<]+)<\/span>/gimu;
    return text.replace(regexp, match => {
      return match.replace(regexp, (content, value, text) => {
        const href = `/user/${value}`;
        return `<a href="${href}" class="content-member a-blue">${text}</a> `;
      });
    });
  },
  parseHtml1: text => { // 恢复 <
    if (!text) return;
    const regexp = /&lt;/gimu;
    return text.replace(regexp, match => {
      return match.replace(regexp, (content, value, text) => {
        return `<`;
      });
    });
  },
  parseHtml2: text => {  // 恢复 >
    if (!text) return;
    const regexp = /&gt;/gimu;
    return text.replace(regexp, match => {
      return match.replace(regexp, (content, value, text) => {
        return `>`;
      });
    });
  }
};
function parse(text) {
  for (const tag in tags) {
    text = tags[tag](text);
  }

  return text;
}

export default { parse };
