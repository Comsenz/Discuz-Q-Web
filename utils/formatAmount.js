const formatAmount = amount => {
  // 避免 00 的情况
  if (amount[0] === amount[1] && amount[0] === '0') {
    amount = amount.substr(0, 1);
  }

  return amount.replace(/[^\d.]/g, '')
    .replace(/\.{2,}/g, '.')
    .replace('.', '$#$')
    .replace(/\./g, '')
    .replace('$#$', '.')
    .replace(/^(-)*(\d+)\.(\d\d).*$/, '$1$2.$3')
    .replace(/^\./g, '');
};

export default formatAmount;
