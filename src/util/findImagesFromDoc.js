export default (md, images) => {
  const content = decodeURIComponent(md)
  const filteredImages = images.filter(image => {
    return content.indexOf(decodeURIComponent(image.url)) >= 0
  })
  return filteredImages
}
