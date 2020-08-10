export default (md) => {
  const us = md.split('](')
  if (us[0].substr(0, 1) === '!' && us.length !== 2) return ''
  return us[1].slice(0, -1)
}
