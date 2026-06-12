/**
 * Client-side image compression for document photos.
 *
 * Phone cameras produce 4-12 MB JPEGs; we downscale to a max dimension and
 * re-encode before upload so the request stays small (~200-800 KB), uploads
 * fast on bad connections, and never hits the API body limits.
 *
 * Text on documents survives 1600px fine for vision OCR purposes.
 */

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;
// Route caps base64 at 4M chars; stay safely below.
const MAX_BASE64_CHARS = 3_900_000;

export interface CompressedImage {
  base64: string; // raw base64, no data: prefix
  mediaType: "image/jpeg" | "application/pdf";
}

/**
 * PDFs can't go through canvas — read them as base64 directly, with the
 * same size cap. Official letters are usually well under 1 MB.
 */
export async function pdfFileToBase64(file: File): Promise<CompressedImage | null> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("pdf read failed"));
    reader.readAsDataURL(file);
  });
  const base64 = dataUrl.split(",")[1] ?? "";
  if (!base64 || base64.length > MAX_BASE64_CHARS) return null;
  return { base64, mediaType: "application/pdf" };
}

/** Dispatch by file type: PDFs raw, images compressed via canvas. */
export async function fileToUploadPayload(file: File): Promise<CompressedImage | null> {
  if (file.type === "application/pdf") return pdfFileToBase64(file);
  return compressImageFile(file);
}

export async function compressImageFile(
  file: File
): Promise<CompressedImage | null> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("image decode failed"));
      el.src = url;
    });

    const scale = Math.min(
      1,
      MAX_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight)
    );
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    // White backdrop: PNGs with transparency would otherwise turn black
    // when re-encoded as JPEG.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);

    const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
    const base64 = dataUrl.split(",")[1] ?? "";
    if (!base64 || base64.length > MAX_BASE64_CHARS) return null;

    return { base64, mediaType: "image/jpeg" };
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}
