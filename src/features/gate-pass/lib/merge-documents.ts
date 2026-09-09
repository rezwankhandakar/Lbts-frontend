import { MAX_PDF_BYTES } from './gate-pass-document'
import { formatBytes } from './gate-pass-meta'
import type { ScannedDocument } from './scanner-agent'

/**
 * Joining several scanned sheets into one gate pass document.
 *
 * A printed challan is not always one sheet. Two or three pages under a single
 * Trip DO is ordinary, and a feeder run therefore produces a stack in which
 * *some* sheets belong together and the rest do not — which nothing but the
 * operator can know. `collect()` on the scanner agent answers the whole-stack
 * case and nothing else, so a subset has to be assembled here.
 *
 * The output is always a PDF, because a gate pass carries one document and one
 * page count, and a several-page image does not exist.
 *
 * pdf-lib is loaded on demand rather than at module scope, exactly as the
 * Challan module defers it: joining is a thing an operator sometimes does, and
 * an operator who never does it should not download a PDF writer to find that
 * out.
 */

export class MergeDocumentsError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'MergeDocumentsError'
  }
}

/**
 * A4 in points. Every joined page is fitted to this rather than sized from the
 * image, because a 300 dpi A4 scan is 2480 px on its long edge and a page that
 * many points across is a 34-inch sheet no printer will ever see.
 */
const A4_WIDTH = 595.28
const A4_HEIGHT = 841.89

/** pdf-lib embeds these two and nothing else. Anything else is re-encoded. */
function isEmbeddable(mimeType: string): boolean {
  return mimeType === 'image/jpeg' || mimeType === 'image/png'
}

/**
 * A WEBP — or anything else a file picker allowed through — as PNG bytes.
 *
 * One re-encode, and only for the formats pdf-lib cannot take directly. A JPEG
 * is embedded as its own compressed stream and never passes through here, so
 * the scanner's own output is joined without being touched.
 */
async function reencodeAsPng(file: File): Promise<ArrayBuffer> {
  let bitmap: ImageBitmap

  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new MergeDocumentsError(`${file.name} could not be read as an image.`)
  }

  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height

  const context = canvas.getContext('2d')
  if (!context) {
    bitmap.close()
    throw new MergeDocumentsError('This browser could not convert that image. Scan it as a PDF.')
  }

  context.drawImage(bitmap, 0, 0)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!blob) {
    throw new MergeDocumentsError('This browser could not convert that image. Scan it as a PDF.')
  }

  return blob.arrayBuffer()
}

function hasPdfSignature(bytes: Uint8Array): boolean {
  return (
    bytes.length > 5 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d
  )
}

/**
 * Joins the given files, in the order given, into one PDF.
 *
 * PDF pages are copied across as page objects — the same `copyPages` the
 * Challan module slices with — so a sheet that arrived as a PDF is neither
 * rasterised nor re-compressed. An image becomes one page, fitted inside the
 * sheet rather than filled to it, because a scan cropped by the paper edge has
 * lost the corner somebody needed.
 *
 * The page count comes back from the assembled document rather than being
 * summed from what the parts claimed: this is the one moment in the module
 * where a real count is available, and a measured one beats a reported one.
 */
export async function joinDocuments(files: File[], stem: string): Promise<ScannedDocument> {
  if (files.length < 2) {
    throw new MergeDocumentsError('Choose at least two sheets to join.')
  }

  const { PDFDocument } = await import('pdf-lib')
  const output = await PDFDocument.create()

  for (const file of files) {
    const bytes = new Uint8Array(await file.arrayBuffer())

    if (file.type === 'application/pdf') {
      if (!hasPdfSignature(bytes)) {
        throw new MergeDocumentsError(`${file.name} is not a readable PDF.`)
      }

      let source
      try {
        source = await PDFDocument.load(bytes)
      } catch {
        throw new MergeDocumentsError(`${file.name} could not be opened. It may be damaged.`)
      }

      const indices = source.getPageIndices()
      for (const page of await output.copyPages(source, indices)) {
        output.addPage(page)
      }

      continue
    }

    const image =
      file.type === 'image/jpeg'
        ? await output.embedJpg(bytes)
        : await output.embedPng(
            isEmbeddable(file.type) ? bytes : new Uint8Array(await reencodeAsPng(file)),
          )

    // Landscape scans get a landscape sheet, so a wide challan is not shrunk
    // to a third of the page to fit a portrait one.
    const page = output.addPage(
      image.width > image.height ? [A4_HEIGHT, A4_WIDTH] : [A4_WIDTH, A4_HEIGHT],
    )

    const scale = Math.min(page.getWidth() / image.width, page.getHeight() / image.height)
    const width = image.width * scale
    const height = image.height * scale

    page.drawImage(image, {
      x: (page.getWidth() - width) / 2,
      y: (page.getHeight() - height) / 2,
      width,
      height,
    })
  }

  const merged = await output.save()

  // The server enforces the same ceiling; failing here saves a 25 MB request
  // crossing a slow line to a cold instance before being refused.
  if (merged.byteLength > MAX_PDF_BYTES) {
    throw new MergeDocumentsError(
      `Those ${files.length} sheets come to ${formatBytes(merged.byteLength)}, over the ${formatBytes(
        MAX_PDF_BYTES,
      )} limit. Join fewer sheets, or scan the stack at a lower resolution.`,
    )
  }

  return {
    file: new File([merged as BlobPart], `${stem}.pdf`, { type: 'application/pdf' }),
    pageCount: output.getPageCount(),
  }
}
