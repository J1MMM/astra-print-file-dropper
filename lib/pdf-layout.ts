"use client";

export type PdfImageOptions = {
  fit?: "cover" | "contain";
  color?: "color" | "grayscale" | "sepia";
  rotation?: number;
  zoom?: number;
  offsetX?: number;
  offsetY?: number;
};

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error("An image could not be loaded for PDF export."));
    image.src = url;
  });
}

export async function renderImageForPdf(
  url: string,
  aspectRatio: number,
  options: PdfImageOptions = {},
) {
  const image = await loadImage(url);
  const width =
    aspectRatio >= 1 ? 1400 : Math.max(600, Math.round(1400 * aspectRatio));
  const height = Math.max(600, Math.round(width / aspectRatio));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser cannot prepare this PDF.");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  if (options.color === "grayscale") context.filter = "grayscale(1)";
  if (options.color === "sepia") context.filter = "sepia(.7)";

  const rotation = (((options.rotation ?? 0) % 360) + 360) % 360;
  const swapped = rotation === 90 || rotation === 270;
  const effectiveWidth = swapped ? image.naturalHeight : image.naturalWidth;
  const effectiveHeight = swapped ? image.naturalWidth : image.naturalHeight;
  const scale =
    (options.fit === "contain"
      ? Math.min(width / effectiveWidth, height / effectiveHeight)
      : Math.max(width / effectiveWidth, height / effectiveHeight)) *
    (options.zoom ?? 1);

  context.save();
  context.translate(
    width / 2 + ((options.offsetX ?? 0) / 100) * width,
    height / 2 + ((options.offsetY ?? 0) / 100) * height,
  );
  context.rotate((rotation * Math.PI) / 180);
  context.drawImage(
    image,
    -(image.naturalWidth * scale) / 2,
    -(image.naturalHeight * scale) / 2,
    image.naturalWidth * scale,
    image.naturalHeight * scale,
  );
  context.restore();
  return canvas.toDataURL("image/jpeg", 0.94);
}

export function safePdfName(value: string) {
  return `${
    value
      .replace(/[^a-z0-9-_]+/gi, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase() || "print-layout"
  }.pdf`;
}
