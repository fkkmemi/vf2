export default (id) => {
  const ids = id.split('.')
  if (ids.length < 2) return false
  if (ids.pop().toLowerCase() !== 'gif') return false
  return true
}
