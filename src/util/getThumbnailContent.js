export default (item) => {
  // const text = 'gasda![img](https://firebasestorage.googleapis.com/v0/b/memi-blog.appspot.com/o/images%2Fboards%2Ftest%2F1598541084939%2F1598541116586-azRiNpab6SRG7f1bewduWBFgMoF3-7000A0C4-DCEC-4B9E-9636-752980F6DE4D.png?alt=media&token=283915c9-1cc2-4d03-bee6-524c90982d92)awefcd[img](http'
  // const content = 'gasda![img](https://firebasestorage.googleapis.com/v0/b/memi-blog.appspot.com/o/images%2Fboards%2Ftest%2F1598541084939%2F1598541116586-azRiNpab6SRG7f1bewduWBFgMoF3-7000A0C4-DCEC-4B9E-9636-752980F6DE4D.png?alt=media&token=283915c9-1cc2-4d03-bee6-524c90982d92)awefcd[img](http)xx![ss-](http:gg)'

  // const f = text.indexOf('![')
  // const l = text.indexOf(')')

  // const str = text.substring(f, l)
  // console.log(str)
  const ts = item.summary.split('')

  const texts = []
  let step = 0
  let text = ''
  let image = ''
  for (let i = 0; i < ts.length; i++) {
    const t = ts[i]

    if (step === 0) {
      if (t === '!') {
        step++
        texts.push(text)
        text = ''
        image = t
      } else {
        text += t
      }
    } else if (step === 1) {
      image += t
      if (t === '[') {
        step++
      }
    } else if (step === 2) {
      image += t
      if (t === '(') {
        step++
      }
    } else if (step === 3) {
      image += t
      if (t === ')') {
        step = 0
        text = ''
        texts.push(image)
      }
    }
  }
  if (text.length) texts.push(text)
  const rs = texts.map(t => {
    if (t.indexOf('https://firebasestorage.googleapis.com') >= 0) {
      const firstIndex = t.indexOf('](') + 2
      if (firstIndex < 2) return t
      const lastIndex = t.length - 1
      const url = t.substring(firstIndex, lastIndex)
      const findImage = item.images.find(image => image.url === url)
      if (!findImage) return t
      if (!findImage.thumbUrl) return t
      return `![img](${findImage.thumbUrl})`
    }
    // const findImage = item.images.find(image => image.url === t)
    // if (!findImage) return t
    return t
  })
  const r = rs.join('')
  if (!r.length) return '![img](/logo.png)'
  return r
}
// "https://firebasestorage.googleapis.com/v0/b/memi-blog.appspot.com/o/images%2Fboards%2Ftest%2F1598541084939%2F1598541117898-azRiNpab6SRG7f1bewduWBFgMoF3-thumb-7000A0C4-DCEC-4B9E-9636-752980F6DE4D.png?alt=media&token=c4206f48-6562-4a85-b8a1-8f76e5c2dba9"
