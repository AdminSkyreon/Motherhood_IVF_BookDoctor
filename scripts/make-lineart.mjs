// Converts the line-art source (black strokes on white) into a transparent,
// strokes-only image used as a CSS mask by components/LineArtBackdrop.tsx.
// Usage: node scripts/make-lineart.mjs
import sharp from "sharp";

const SOURCE = "scripts/assets/lineart-source.png";
const OUT = "public/brand/lineart-mother";
// The source screenshot has a grey border line along its bottom edge.
const BOTTOM_CROP = 6;
// Ignore near-white noise so the background is fully transparent.
const NOISE_FLOOR = 24;

const meta = await sharp(SOURCE).metadata();
const { data, info } = await sharp(SOURCE)
  .extract({ left: 0, top: 0, width: meta.width, height: meta.height - BOTTOM_CROP })
  .flatten({ background: "#ffffff" })
  .greyscale()
  .raw()
  .toBuffer({ resolveWithObject: true });

const rgba = Buffer.alloc(info.width * info.height * 4);
for (let i = 0; i < info.width * info.height; i++) {
  const ink = 255 - data[i];
  rgba[i * 4 + 3] = ink < NOISE_FLOOR ? 0 : Math.min(255, Math.round(ink * 1.15));
}

const trimmed = await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
  .trim({ threshold: 1 })
  .png()
  .toBuffer({ resolveWithObject: true });

await sharp(trimmed.data).webp({ quality: 90, alphaQuality: 100 }).toFile(`${OUT}.webp`);
await sharp(trimmed.data).png({ compressionLevel: 9 }).toFile(`${OUT}.png`);
console.log(`Wrote ${OUT}.webp/.png (${trimmed.info.width}x${trimmed.info.height})`);
