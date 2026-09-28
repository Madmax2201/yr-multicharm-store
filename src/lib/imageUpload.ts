const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.85;

export interface CompressOptions {
  maxDimension?: number;
  quality?: number;
}

export async function compressImage(
  file: File,
  { maxDimension = MAX_DIMENSION, quality = JPEG_QUALITY }: CompressOptions = {}
): Promise<File> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });

  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality)
  );

  if (!blob) return file;

  const base = file.name.replace(/\.[^.]+$/, "") || "image";
  return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
}

export async function uploadImage(file: File, options?: CompressOptions): Promise<string> {
  const prepared = await compressImage(file, options);

  const formData = new FormData();
  formData.append("file", prepared);

  const res = await fetch("/api/upload", { method: "POST", body: formData });

  const text = await res.text();

  let data: { url?: string; error?: string } = {};
  try {
    data = JSON.parse(text);
  } catch {
    if (res.status === 413) {
      throw new Error("Image is too large. Please pick a smaller file.");
    }
    throw new Error(`Upload failed (HTTP ${res.status}). Please try again.`);
  }

  if (!res.ok || !data.url) {
    throw new Error(data.error || "Upload failed. Please try again.");
  }

  return data.url;
}
