export const roundf = (num, roundexp) => Math.round((num * (1 + Number.EPSILON)) / roundexp) * roundexp
export const floatStr = (num, decimals = 2) => num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
export const dateStr = (d) => {
  const date = new Date(d)
  return date.toLocaleDateString('zh-CN', { hour12: false })
}
export const timeStr = (time) => {
  const date = new Date(time)
  return date.toLocaleTimeString('en-US', { hour12: false }).split(' ')[0]
  // return date.toISOString().split('T')[1].split('.')[0]
}
export const datetimeStr = (time) => {
  const date = new Date(time)
  return date.toLocaleString('zh-CN', { hour12: false }).replaceAll('/', '-')
  // return date.toLocaleTimeString('en-US', { hour12: false })
}
