export default (url) => {
  if (!url) return ''
  let md = '![image]('
  md += url
  md += ')'
  return md
}
