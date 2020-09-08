export default (email) => {
  const es = email.split('@')
  if (es.length !== 2) return email
  es[0] = es[0].substr(0, Math.floor(es[0].length / 2)).padEnd(es[0].length, '*')
  return es.join('@')
}
