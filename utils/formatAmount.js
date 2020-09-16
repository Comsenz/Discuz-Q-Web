const formatAmount = amount => {
  return amount.replace(/[^\d.]/g, '')
    .replace(/^\./g, '')
    .replace(/\.{2,}/g, '.')
    .replace('.', '$#$')
    .replace(/\./g, '')
    .replace('$#$', '.') // 只能输入两个小数
    .replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3')
}

export default formatAmount
