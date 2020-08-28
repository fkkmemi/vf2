import { readAndCompressImage } from 'browser-image-resizer'

export default async (file) => {
  const config = {
    quality: 0.8,
    maxWidth: 480
    // maxHeight: 300,
    // autoRotate: false
  }
  let thumbnail
  if (file.size > 1024 * 10) thumbnail = await readAndCompressImage(file, config)
  else thumbnail = file
  return thumbnail
}
