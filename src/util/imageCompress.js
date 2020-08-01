import { readAndCompressImage } from 'browser-image-resizer'

export default async (file) => {
  const config = {
    quality: 0.5,
    maxWidth: 300,
    maxHeight: 300,
    autoRotate: true
  }
  let thumbnail
  if (file.size > 1024 * 10) thumbnail = await readAndCompressImage(file, config)
  else thumbnail = file
  return thumbnail
}
