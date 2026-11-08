// Browser helper for turning a chosen screenshot into an inline base64 image
// for the Gemini request. The image is held only in memory for the current
// request and is never uploaded anywhere except, with consent, to our /api/guide
// route for a single answer. DeClear does not store it.

export const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']
// Keep in step with the server limit (~1.5MB of base64).
export const MAX_IMAGE_BASE64_CHARS = 1_500_000

/**
 * Read a File into { mimeType, dataBase64 } (base64 without the data: prefix).
 * @param {File} file
 * @returns {Promise<{ mimeType: string, dataBase64: string }>}
 */
export function fileToInlineImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.onload = () => {
      const result = String(reader.result)
      // result looks like "data:image/png;base64,AAAA..."
      const comma = result.indexOf(',')
      const dataBase64 = comma >= 0 ? result.slice(comma + 1) : ''
      resolve({ mimeType: file.type, dataBase64 })
    }
    reader.readAsDataURL(file)
  })
}
