import sharp from "sharp";

// Must stay in sync with the maxSize/mimeTypes set on questions.question_image /
// hint_image / explanation_image in backend/pb_migrations/1786533147_updated_questions.js.
export const ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_FILE_SIZE_BYTES = 3 * 1024 * 1024;

const BASE64_RE = /^[A-Za-z0-9+/]*={0,2}$/;

const MAGIC_SIGNATURES = [
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { mime: "image/gif", bytes: [0x47, 0x49, 0x46, 0x38] },
  { mime: "image/bmp", bytes: [0x42, 0x4d] },
  { mime: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46] } // RIFF; WEBP fourcc confirmed separately
];

/**
 * Sniffs the real image format from magic bytes rather than trusting the legacy
 * FILENAME extension, which the audit step has already shown can be inconsistent
 * with the actual referenced graphic.
 */
export function sniffImageMime(buffer) {
  for (const candidate of MAGIC_SIGNATURES) {
    if (buffer.length < candidate.bytes.length) continue;
    if (!candidate.bytes.every((byte, i) => buffer[i] === byte)) continue;
    if (candidate.mime === "image/webp") {
      if (buffer.subarray(8, 12).toString("ascii") !== "WEBP") continue;
    }
    return candidate.mime;
  }
  return null;
}

/**
 * Decodes GRAPHIC.CONTENT (already base64 text in the legacy DB) into a Buffer,
 * validating the input is well-formed base64 first so truncated/corrupted LOB
 * exports (e.g. from a DBeaver LOB-length limit) fail loudly instead of
 * producing a silently-truncated image.
 */
export function decodeGraphicContent(base64Content) {
  if (!base64Content) return null;
  const cleaned = base64Content.replace(/\s+/g, "");
  if (cleaned.length === 0) return null;
  if (cleaned.length % 4 !== 0 || !BASE64_RE.test(cleaned)) {
    throw new Error(
      `GRAPHIC.CONTENT is not valid base64 (length=${cleaned.length}) - likely truncated during export`
    );
  }
  return Buffer.from(cleaned, "base64");
}

export const WEBP_QUALITY = 85;

/**
 * Every imported image is converted to WebP at a fixed quality, regardless of
 * its original format or whether it would already satisfy PocketBase's
 * format/size requirements as-is. This matches what the admin panel's own
 * upload path already does to every image a human uploads (see
 * frontend/src/lib/components/ImageUploadField.svelte) - legacy-imported
 * images would otherwise be the only ones in the app not going through that
 * pipeline, ending up as a mix of original jpeg/png at full quality/size
 * instead of consistent WebP like everything else.
 */
export async function normalizeForPocketBase(buffer, { filenameHint } = {}) {
  const sniffed = sniffImageMime(buffer);
  if (!sniffed) {
    throw new Error(`${filenameHint ?? "(unknown file)"}: could not identify image format from magic bytes`);
  }

  let output = await sharp(buffer, { failOn: "error" }).webp({ quality: WEBP_QUALITY }).toBuffer();

  if (output.length > MAX_FILE_SIZE_BYTES) {
    // Real legacy data never hits this (largest is well under 3MB even
    // unconverted), but keep a defensive fallback rather than fail outright.
    output = await sharp(buffer)
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
  }

  if (output.length > MAX_FILE_SIZE_BYTES) {
    throw new Error(`${filenameHint ?? "(unknown file)"}: still exceeds ${MAX_FILE_SIZE_BYTES} bytes after WebP conversion+resize`);
  }

  return { buffer: output, mime: "image/webp", ext: "webp", converted: true, originalMime: sniffed };
}
