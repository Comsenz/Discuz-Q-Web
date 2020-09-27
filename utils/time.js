/**
 * 计算指定时间到当前时间的时间间隔
 * @param {*} time 指定时间
 * @return 时间间隔或年月日时分
 *
 * example:
 * time2MinuteOrHour('2020-04-25T13:42:00.000Z')
 */
export const time2MinuteOrHour = time => {
  const now = new Date()
  const pass = new Date(time)
  const result = now - pass
  // 分钟差小于60分钟
  if (parseInt(parseInt(result / 1000, 0) / 60, 0) < 60) {
    return `${Math.ceil(result / 1000 / 60) > 0 ? Math.ceil(result / 1000 / 60) : 1}分钟前`
  }
  // 小时差小于16小时
  if (parseInt(parseInt(parseInt(result / 1000, 0) / 60, 0) / 60, 0) < 16) {
    return `${Math.ceil(result / 1000 / 60 / 60) > 0 ? Math.ceil(result / 1000 / 60 / 60) : 1}小时前`
  }
  // 超过16个小时展示 年月日时分
  return time
    .replace(/T/, ' ')
    .replace(/Z/, '')
    .substring(0, 16)
}

/**
 * 时间转换为带有上午或下午的时间
 * @param {*} originTime 原始时间
 * @return 年月日 上午/下午 时分
 *
 * example:
 * time2MorningOrAfternoon('2020-04-25T11:54:17+08:00')
 */
export const time2MorningOrAfternoon = originTime => {
  const time = originTime.replace(/T/, ' ').replace(/Z/, '')
  // 0-12为上午，12-24为下午
  if (parseInt(time.substring(11, 13), 0) < 12) {
    return `${time.substring(0, 10)} 上午 ${time.substring(11, 16)}`
  }
  return `${time.substring(0, 10)} 下午 ${time.substring(11, 16)}`
}

/**
 * 有效期（时间戳减去当前时间戳再转换为天）
 * @param {*} timestamp 时间戳
 * @return 天
 * example:
 * timestamp2day(1589785128)
 */
export const timestamp2day = timestamp => {
  const interval = timestamp - Math.round(new Date() / 1000)
  return parseInt(interval / (60 * 60 * 24), 0)
}
/**
 * 圈龄（当前时间减去加入时间再转换为天，月，年）
 * @param {*} date 加入时间
 * @return 天，月，年
 * example:
 * dateDay(2020-04-16T19:26:23+08:00)
 */
export const dateDay = date => {
  const timestamp = Math.round(new Date(date) / 1000)
  const interval = Math.round(new Date() / 1000) - timestamp
  const day = parseInt(interval / (60 * 60 * 24), 0)
  if (day > 365) {
    const year = parseInt(interval / (60 * 60 * 24) / 365, 0)
    return year + '年'
  }
  // if (day > 30) {
  //   const month = parseInt(interval / (60 * 60 * 24) / 30, 0)
  //   return month + '个月'
  // }
  return day + '天'
}
export const formatDate = (date, fmt) => {
  const _date = new Date(date)
  const o = {
    'M+': _date.getMonth() + 1,
    'd+': _date.getDate(),
    'h+': _date.getHours(),
    'm+': _date.getMinutes(),
    's+': _date.getSeconds(),
    'q+': Math.floor((_date.getMonth() + 3) / 3),
    'S': _date.getMilliseconds()
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (_date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
    }
  }
  return fmt
}

// 2020年-4月-16日

export const time2YearMonthDay = date => {
  const d = new Date(date)
  const year = d.getFullYear() + '年'
  const month = d.getMonth() + 1 + '月'
  const dated = d.getDate() + '日'
  return [year, month, dated].join('-')
}
