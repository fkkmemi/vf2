export default (item) => {
  const title = item.title + ' : memi'
  const description = item.description
  const image = item.image

  const descriptionNode = document.querySelector('head meta[name="description"]')
  const ogTitleNode = document.querySelector('head meta[property="og:title"]')
  const ogDescriptionNode = document.querySelector('head meta[property="og:description"]')
  const ogImageNode = document.querySelector('head meta[property="og:image"]')

  document.title = title
  descriptionNode.setAttribute('content', description)
  ogTitleNode.setAttribute('content', title)
  ogDescriptionNode.setAttribute('content', description)
  ogImageNode.setAttribute('content', image)
}
