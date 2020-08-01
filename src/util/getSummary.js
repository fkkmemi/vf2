export default (text, limit, filter) => {
  if (!text.length) return ''
  let summary = '내용 없음'
  const ts = text.split('\n')
  const ss = []
  for (const t of ts) {
    const index = t.indexOf(filter)
    if (index >= 0) continue
    if (t.length) ss.push(t)
  }
  const s = ss.join('\n')
  if (s.length > limit) {
    summary = s.substr(0, limit)
    summary += ' ...'
  } else {
    summary = s
  }
  return summary
}
