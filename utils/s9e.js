/* eslint-disable */

const tags = {
  topic: text => {
    if (!text) return;
    const regexp = /<span\s*id="topic"\s*value="(?<value>\w+)"\s*>(?<string>[^<]+)<\/span>/gimu;
    return text.replace(regexp, match => {
      return match.replace(regexp, (content, value, text) => {
        // const href = `/topic/content?id=${value}`;
        return `<span href="javascript:;" class="content-topic" style="color: #1878F3">${text}</span> `;
      });
    });
  },
  usermention: text => {
    if (!text) return;
    const regexp = /<span\s*id="member"\s*value="(?<value>\w+)"\s*>(?<string>[^<]+)<\/span>/gimu;
    return text.replace(regexp, match => {
      return match.replace(regexp, (content, value, text) => {
        const href = `/profile/index?userId=${value}`;
        return `<a href="${href}" class="content-member">${text}</a> `;
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
