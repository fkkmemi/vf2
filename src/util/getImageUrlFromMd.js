export default (md) => {
  const ds = md.split('\n')
  for (const d of ds) {
    const us = d.split('](')
    if (us.length !== 2) continue
    if (us[0].indexOf('!') < 0) continue
    const i = us[1].indexOf(')')
    return us[1].substr(0, i)
  }
}
