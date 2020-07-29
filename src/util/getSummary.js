export default (text, limit) => {
  if (!text.length) return ''
  let summary = '내용 없음'
  const ts = text.split('\n')
  const ss = []
  for (const t of ts) {
    const fc = t.substr(0, 1)
    if (fc === '[' || fc === '!') continue
    ss.push(t)
  }
  const s = ss.join('\n')
  if (s.length > limit) {
    summary = s.substr(0, limit)
    summary += '\n...'
  } else {
    summary = s
  }
  return summary
}
