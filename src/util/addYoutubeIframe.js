import youtubeUrl from 'youtube-url'

export default (el) => {
  const setIframe = (id) => {
    const iframe = document.createElement('iframe')
    iframe.setAttribute('width', '560')
    iframe.setAttribute('height', '315')
    iframe.setAttribute('frameborder', '0')
    iframe.setAttribute('allow', 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture')
    iframe.setAttribute('allowfullscreen', '')
    iframe.setAttribute('src', 'https://www.youtube.com/embed/' + id)
    return iframe
  }
  const len = el.firstChild.children
  const items = []
  for (const p of len) {
    for (const a of p.children) {
      if (!a.href) continue
      const id = youtubeUrl.extractId(a.href)
      if (!id) continue
      p.setAttribute('id', id)
      items.push({
        doc: p,
        id: id
      })
    }
  }
  items.forEach(p => {
    p.doc.parentNode.insertBefore(setIframe(p.id), p.doc)
  })
  console.log(el)

  return el.innerHTML
}
