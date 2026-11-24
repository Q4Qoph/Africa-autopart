// Offline authoring only. Install tesseract.js@6.0.1 in OCR_DIRECTORY and put
// eng.traineddata.gz there. MEMBERSHIP_JSON maps PNG filenames to exact API PNCs.
// Review candidates against the original drawing and vehicle-specific catalog rows
// before adding them to the frontend's reviewed diagram registry.
import fs from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'

const [ocrDirectory, imageDirectory, membershipFile, destination] = process.argv.slice(2)
if (!destination) throw new Error('Usage: node scripts/extract-pnc-candidates.mjs OCR_DIRECTORY IMAGE_DIRECTORY MEMBERSHIP_JSON OUTPUT_JSON')
const require = createRequire(path.resolve(ocrDirectory, 'package.json'))
const { createWorker, PSM } = require('tesseract.js')
const membership = JSON.parse(await fs.readFile(membershipFile, 'utf8'))
const images = Object.entries(membership)
const output = {}
let cursor = 0

await Promise.all(Array.from({ length: Math.min(4, images.length) }, async () => {
  const worker = await createWorker('eng', 1, { langPath: path.resolve(ocrDirectory), cachePath: path.resolve(ocrDirectory) })
  try {
    await worker.setParameters({ tessedit_pageseg_mode: PSM.SPARSE_TEXT, user_defined_dpi: '300' })
    while (cursor < images.length) {
      const [filename, pncs] = images[cursor++]
      if (!/^[A-Za-z0-9_-]+\.png$/.test(filename)) throw new Error('Invalid diagram filename')
      const png = await fs.readFile(path.join(imageDirectory, filename)).catch(error => {
        if (error.code !== 'ENOENT') throw error
        return null
      })
      if (!png || png.length < 24 || png.toString('hex', 0, 8) !== '89504e470d0a1a0a') {
        output[filename] = { status: 'missing-image' }
        continue
      }
      const width = png.readUInt32BE(16)
      const height = png.readUInt32BE(20)
      const allowed = new Set(pncs)
      const { data } = await worker.recognize(png, {}, { text: false, blocks: true })
      const regions = []
      for (const block of data.blocks ?? []) {
        for (const paragraph of block.paragraphs) {
          for (const line of paragraph.lines) {
            for (const word of line.words) {
              const pnc = word.text.toUpperCase().replace(/^-|-$/g, '')
              const { x0, y0, x1, y1 } = word.bbox
              if (!allowed.has(pnc) || word.confidence < 75 || x0 < 0 || y0 < 0 || x1 > width || y1 > height || x1 <= x0 || y1 <= y0) continue
              regions.push({ pnc, box: [x0, y0, x1 - x0, y1 - y0], confidence: Math.round(word.confidence) })
            }
          }
        }
      }
      output[filename] = { status: 'needs-review', sha256: createHash('sha256').update(png).digest('hex'), width, height, regions }
    }
  } finally {
    await worker.terminate()
  }
}))
await fs.writeFile(destination, JSON.stringify(Object.fromEntries(Object.entries(output).sort()), null, 2) + '\n')
