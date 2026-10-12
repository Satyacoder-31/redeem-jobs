const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const srcPath = 'C:/Users/krish/.gemini/antigravity-ide/brain/3564779c-44e9-472d-aaa6-339fb1407fb4/.user_uploaded/media_1791844693982.jpg';
const outDir = 'c:/Users/krish/Downloads/hirekaro-main/public/brand';

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function processLogo() {
  console.log('Processing authentic Redeem Jobs logo...');

  // 1. Copy the original uploaded image directly
  fs.copyFileSync(srcPath, path.join(outDir, 'redeem-jobs-original.jpg'));

  // 2. Load original image into sharp buffer
  const image = sharp(srcPath);
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;

  // 3. Create transparent RGBA buffer with clean alpha extraction from white background
  const rgba = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const r = data[i * 3];
    const g = data[i * 3 + 1];
    const b = data[i * 3 + 2];

    // Compute distance from pure white (255, 255, 255)
    const whiteness = Math.min(r, g, b);
    let alpha = 255 - whiteness;

    if (whiteness >= 252) {
      alpha = 0;
    } else if (whiteness > 235) {
      // Smooth falloff curve
      alpha = Math.round(Math.pow((255 - whiteness) / 20, 1.2) * (255 - whiteness));
    } else {
      alpha = 255;
    }

    // Un-multiply color against white background to recover clean saturation
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
      rgba[i * 4] = 255;
      rgba[i * 4 + 1] = 255;
      rgba[i * 4 + 2] = 255;
      rgba[i * 4 + 3] = 0;
    }
  }

  // 4. Save 1x transparent PNG
  const transparent1x = sharp(rgba, { raw: { width, height, channels: 4 } });
  await transparent1x.png().toFile(path.join(outDir, 'redeem-jobs-transparent.png'));

  // 5. Upscale to 4x Ultra HD (1696 x 732) with lanczos3
  const hdWidth = width * 4;
  const hdHeight = height * 4;
  await sharp(rgba, { raw: { width, height, channels: 4 } })
    .resize(hdWidth, hdHeight, { kernel: sharp.kernel.lanczos3 })
    .png({ compressionLevel: 8 })
    .toFile(path.join(outDir, 'redeem-jobs-hd.png'));
  console.log('Saved 4x HD transparent logo: redeem-jobs-hd.png');

  // 6. Extract standalone RTP Emblem (Rows 0 to 95) in 4x HD
  const emblemHeight = 96;
  const emblemRgba = Buffer.alloc(width * emblemHeight * 4);
  for (let y = 0; y < emblemHeight; y++) {
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4;
      const dstIdx = (y * width + x) * 4;
      emblemRgba[dstIdx] = rgba[srcIdx];
      emblemRgba[dstIdx + 1] = rgba[srcIdx + 1];
      emblemRgba[dstIdx + 2] = rgba[srcIdx + 2];
      emblemRgba[dstIdx + 3] = rgba[srcIdx + 3];
    }
  }

  await sharp(emblemRgba, { raw: { width, height: emblemHeight, channels: 4 } })
    .trim()
    .resize(null, 240, { kernel: sharp.kernel.lanczos3 })
    .png()
    .toFile(path.join(outDir, 'redeem-jobs-mark-hd.png'));
  console.log('Saved 4x HD RTP mark: redeem-jobs-mark-hd.png');

  // 7. Extract Text Portion ("REDEEM JOBS" + "Training & Placement Solutions") (Rows 98 to 178)
  const textStartY = 98;
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
    .png()
    .toFile(path.join(outDir, 'redeem-jobs-text-hd.png'));
  console.log('Saved 4x HD text: redeem-jobs-text-hd.png');

  // 8. Create a horizontal version: [Mark] + [Text] side by side!
  const markTrimmed = await sharp(path.join(outDir, 'redeem-jobs-mark-hd.png')).resize(null, 90).toBuffer({ resolveWithObject: true });
  const textTrimmed = await sharp(path.join(outDir, 'redeem-jobs-text-hd.png')).resize(null, 70).toBuffer({ resolveWithObject: true });

  const totalHWidth = markTrimmed.info.width + 24 + textTrimmed.info.width + 20;
  const totalHHeight = 100;

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
      { input: markTrimmed.data, left: 10, top: markTop },
      { input: textTrimmed.data, left: 10 + markTrimmed.info.width + 20, top: textTop }
    ])
    .png()
    .toFile(path.join(outDir, 'redeem-jobs-horizontal-hd.png'));
  console.log('Saved horizontal HD logo: redeem-jobs-horizontal-hd.png');

  // 9. Create a crisp white-backed badge version (perfect for dark headers so it stands out with 100% clarity)
  const badgeWidth = width * 2 + 32;
  const badgeHeight = height * 2 + 20;
  const whiteCard = sharp({
    create: {
      width: badgeWidth,
      height: badgeHeight,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  });

  const logo2x = await sharp(rgba, { raw: { width, height, channels: 4 } })
    .resize(width * 2, height * 2, { kernel: sharp.kernel.lanczos3 })
    .toBuffer();

  await whiteCard
    .composite([{ input: logo2x, left: 16, top: 10 }])
    .png()
    .toFile(path.join(outDir, 'redeem-jobs-badge-white.png'));
  console.log('Saved white badge logo: redeem-jobs-badge-white.png');

  console.log('All authentic HD assets created successfully!');
}

processLogo().catch(console.error);
