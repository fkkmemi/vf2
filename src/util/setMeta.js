export default (item) => {
  const ts = []
  if (item.title) ts.push(item.title)
  ts.push(process.env.VUE_APP_SITE_TITLE)
  const title = ts.join(' : ')
  const description = item.description.replace(/(<([^>]+)>)/gi, '') || process.env.VUE_APP_SITE_DESCRIPTION
  const image = item.image || process.env.VUE_APP_SITE_IMAGE

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
