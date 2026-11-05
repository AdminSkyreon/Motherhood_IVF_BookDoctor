// Builds the Motherhood heart mark (transparent) used by components/BrandLoader.tsx,
// plus the favicon and Apple touch icon.
// Usage: node scripts/make-mark.mjs
import sharp from "sharp";

const SOURCE = "../Motherhood_IVF/public/shared/motherhood-favicon-source.png";
const OUT = "public/brand/motherhood-mark";
const SIZE = 192;

const { data, info } = await sharp(SOURCE).flatten({ background: "#ffffff" }).raw().toBuffer({ resolveWithObject: true });

// Treat white as transparent and un-blend colours from white so edges don't halo.
const rgba = Buffer.alloc(info.width * info.height * 4);
for (let i = 0; i < info.width * info.height; i++) {
  const [r, g, b] = [data[i * 3], data[i * 3 + 1], data[i * 3 + 2]];
  const ink = 255 - Math.min(r, g, b);
  const alpha = ink < 12 ? 0 : Math.min(1, (ink / 255) * 1.6);
  const unblend = (c) => (alpha === 0 ? 0 : Math.max(0, Math.min(255, Math.round((c - 255 * (1 - alpha)) / alpha))));
  rgba.set([unblend(r), unblend(g), unblend(b), Math.round(alpha * 255)], i * 4);
}

const trimmed = await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
  .trim({ threshold: 1 })
  .png()
  .toBuffer();

const square = (size, pad, background) =>
  sharp(trimmed)
    .resize(size - pad * 2, size - pad * 2, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background })
    .png();

const clear = { r: 0, g: 0, b: 0, alpha: 0 };
await square(SIZE, 8, clear).webp({ quality: 92, alphaQuality: 100 }).toFile(`${OUT}.webp`);
await square(SIZE, 8, clear).toFile(`${OUT}.png`);
await square(96, 4, clear).toFile("app/icon.png");
await square(180, 22, { r: 255, g: 255, b: 255, alpha: 1 }).flatten({ background: "#ffffff" }).toFile("app/apple-icon.png");
console.log(`Wrote ${OUT}.webp/.png, app/icon.png, app/apple-icon.png`);
