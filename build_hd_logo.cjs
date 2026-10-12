const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const srcPath = 'C:/Users/krish/.gemini/antigravity-ide/brain/3564779c-44e9-472d-aaa6-339fb1407fb4/.user_uploaded/media_1791844693982.jpg';
const outDir = 'c:/Users/krish/Downloads/hirekaro-main/public/brand';

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function processLogo() {
  console.log('Processing authentic Redeem Jobs logo with 100% transparent background...');

  fs.copyFileSync(srcPath, path.join(outDir, 'redeem-jobs-original.jpg'));

  const image = sharp(srcPath);
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;

  const rgba = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const r = data[i * 3];
    const g = data[i * 3 + 1];
    const b = data[i * 3 + 2];

    const minC = Math.min(r, g, b);
    const maxC = Math.max(r, g, b);
    const delta = maxC - minC;
    const distFromWhite = 255 - minC;

    let alpha = 0;
    if (minC >= 244 && delta < 14) {
      alpha = 0;
    } else if (distFromWhite < 18 && delta < 16) {
      alpha = 0;
    } else {
      if (distFromWhite >= 50) {
        alpha = 255;
      } else {
        const t = (distFromWhite - 18) / (50 - 18);
        alpha = Math.round(Math.max(0, Math.min(255, t * 255)));
      }
    }

    if (alpha > 0) {
      const aNorm = alpha / 255;
      const cleanR = Math.max(0, Math.min(255, Math.round((r - 255 * (1 - aNorm)) / aNorm)));
      const cleanG = Math.max(0, Math.min(255, Math.round((g - 255 * (1 - aNorm)) / aNorm)));
      const cleanB = Math.max(0, Math.min(255, Math.round((b - 255 * (1 - aNorm)) / aNorm)));

      rgba[i * 4] = cleanR;
      rgba[i * 4 + 1] = cleanG;
      rgba[i * 4 + 2] = cleanB;
      rgba[i * 4 + 3] = alpha;
    } else {
      rgba[i * 4] = 0;
      rgba[i * 4 + 1] = 0;
      rgba[i * 4 + 2] = 0;
      rgba[i * 4 + 3] = 0;
    }
  }

  // 1. Stacked HD logo
  await sharp(rgba, { raw: { width, height, channels: 4 } })
    .trim()
    .resize(1600, null, { kernel: sharp.kernel.lanczos3, fit: 'inside' })
    .png({ compressionLevel: 9 })
    .toFile(path.join(outDir, 'redeem-jobs-hd.png'));
  console.log('Saved 100% transparent HD logo: redeem-jobs-hd.png');

  // 2. Standalone RTP emblem (rows 0 to 95)
  const emblemHeight = 96;
  const emblemRgba = Buffer.alloc(width * emblemHeight * 4);
  for (let y = 0; y < emblemHeight; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      emblemRgba[idx] = rgba[idx];
      emblemRgba[idx + 1] = rgba[idx + 1];
      emblemRgba[idx + 2] = rgba[idx + 2];
      emblemRgba[idx + 3] = rgba[idx + 3];
    }
  }
  await sharp(emblemRgba, { raw: { width, height: emblemHeight, channels: 4 } })
    .trim()
    .resize(null, 240, { kernel: sharp.kernel.lanczos3 })
    .png({ compressionLevel: 9 })
    .toFile(path.join(outDir, 'redeem-jobs-mark-hd.png'));
  console.log('Saved 100% transparent HD RTP mark: redeem-jobs-mark-hd.png');

  // 3. Text portion (rows 97 to height)
  const textStartY = 97;
  const textHeight = height - textStartY;
  const textRgba = Buffer.alloc(width * textHeight * 4);
  for (let y = 0; y < textHeight; y++) {
    for (let x = 0; x < width; x++) {
      const srcIdx = ((y + textStartY) * width + x) * 4;
      const dstIdx = (y * width + x) * 4;
      textRgba[dstIdx] = rgba[srcIdx];
      textRgba[dstIdx + 1] = rgba[srcIdx + 1];
      textRgba[dstIdx + 2] = rgba[srcIdx + 2];
      textRgba[dstIdx + 3] = rgba[srcIdx + 3];
    }
  }
  await sharp(textRgba, { raw: { width, height: textHeight, channels: 4 } })
    .trim()
    .resize(null, 160, { kernel: sharp.kernel.lanczos3 })
    .png({ compressionLevel: 9 })
    .toFile(path.join(outDir, 'redeem-jobs-text-hd.png'));
  console.log('Saved 100% transparent HD text: redeem-jobs-text-hd.png');

  // 4. Horizontal version: [Mark] + [Text] side by side
  const markTrimmed = await sharp(path.join(outDir, 'redeem-jobs-mark-hd.png')).resize(null, 84).toBuffer({ resolveWithObject: true });
  const textTrimmed = await sharp(path.join(outDir, 'redeem-jobs-text-hd.png')).resize(null, 66).toBuffer({ resolveWithObject: true });

  const totalHWidth = markTrimmed.info.width + 16 + textTrimmed.info.width;
  const totalHHeight = 92;

  const horizontalBase = sharp({
    create: {
      width: totalHWidth,
      height: totalHHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  });

  const markTop = Math.round((totalHHeight - markTrimmed.info.height) / 2);
  const textTop = Math.round((totalHHeight - textTrimmed.info.height) / 2);

  await horizontalBase
    .composite([
      { input: markTrimmed.data, left: 0, top: markTop },
      { input: textTrimmed.data, left: markTrimmed.info.width + 16, top: textTop }
    ])
    .png({ compressionLevel: 9 })
    .toFile(path.join(outDir, 'redeem-jobs-horizontal-hd.png'));
  console.log('Saved 100% transparent horizontal HD logo: redeem-jobs-horizontal-hd.png');
}

processLogo().catch(console.error);
