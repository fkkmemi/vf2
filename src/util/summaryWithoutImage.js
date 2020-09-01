export default (md) => {
  const ms = md.split('')
  const ts = []
  let step = 0
  for (const m of ms) {
    if (step === 0) {
      if (m === '!') {
        step++
      } else {
        ts.push(m)
      }
    } else if (step === 1) {
      if (m === '[') step++
      else {
        step = 0
        ts.push(m)
      }
    } else {
      if (m === ')') {
        step = 0
      }
    }
  }
  return ts.join('')
}
