const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputPath = 'C:\\Users\\saran\\.gemini\\antigravity-ide\\brain\\3e44c9cd-8c93-43ec-8a13-c6b7d5d195e7\\.user_uploaded\\media_1790421211272.png';
const outDir = path.join(__dirname, '..', 'public', 'brand');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function processLogo() {
  console.log('Processing exact user logo image...');
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  console.log(`Dimensions: ${metadata.width} x ${metadata.height}`);

  // Get raw RGBA buffer to find exact bounding box of the white logo
  const raw = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
  const { data, info } = raw;
  const width = info.width;
  const height = info.height;
  const channels = info.channels;

  let minX = width, maxX = 0, minY = height, maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // If brightness > 40 (not black background)
      if (r > 40 || g > 40 || b > 40) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  console.log(`Detected logo bounding box: [${minX}, ${minY}] to [${maxX}, ${maxY}]`);
  const pad = 12;
  const cropX = Math.max(0, minX - pad);
  const cropY = Math.max(0, minY - pad);
  const cropW = Math.min(width - cropX, (maxX - minX) + pad * 2);
  const cropH = Math.min(height - cropY, (maxY - minY) + pad * 2);

  // 1. Save original cropped
  await sharp(inputPath)
    .extract({ left: cropX, top: cropY, width: cropW, height: cropH })
    .png()
    .toFile(path.join(outDir, 'ticket2grow-original-cropped.png'));

  // 2. Extract cropped raw buffer to create transparent versions
  const croppedRaw = await sharp(inputPath)
    .extract({ left: cropX, top: cropY, width: cropW, height: cropH })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const cData = croppedRaw.data;
  const cW = croppedRaw.info.width;
  const cH = croppedRaw.info.height;

  // Buffer for White on Transparent
  const whiteTransparent = Buffer.alloc(cW * cH * 4);
  // Buffer for Black/Dark on Transparent (for light/marble backgrounds)
  const darkTransparent = Buffer.alloc(cW * cH * 4);
  // Buffer for Emerald on Transparent
  const emeraldTransparent = Buffer.alloc(cW * cH * 4);

  for (let i = 0; i < cW * cH; i++) {
    const idx = i * 4;
    const r = cData[idx];
    const g = cData[idx + 1];
    const b = cData[idx + 2];
    const brightness = Math.max(r, g, b);

    // If close to black, make transparent; if white/gray, set alpha smoothly
    let alpha = 0;
    if (brightness > 30) {
      alpha = Math.min(255, Math.round(((brightness - 30) / (255 - 30)) * 255));
    }

    // White version
    whiteTransparent[idx] = 255;
    whiteTransparent[idx + 1] = 255;
    whiteTransparent[idx + 2] = 255;
    whiteTransparent[idx + 3] = alpha;

    // Dark version (#0f172a / black)
    darkTransparent[idx] = 15;
    darkTransparent[idx + 1] = 23;
    darkTransparent[idx + 2] = 42;
    darkTransparent[idx + 3] = alpha;

    // Emerald version (#059669)
    emeraldTransparent[idx] = 5;
    emeraldTransparent[idx + 1] = 150;
    emeraldTransparent[idx + 2] = 105;
    emeraldTransparent[idx + 3] = alpha;
  }

  // Save White Transparent
  await sharp(whiteTransparent, { raw: { width: cW, height: cH, channels: 4 } })
    .png()
    .toFile(path.join(outDir, 'ticket2grow-white.png'));

  // Save Dark Transparent
  await sharp(darkTransparent, { raw: { width: cW, height: cH, channels: 4 } })
    .png()
    .toFile(path.join(outDir, 'ticket2grow-dark.png'));

  // Save Emerald Transparent
  await sharp(emeraldTransparent, { raw: { width: cW, height: cH, channels: 4 } })
    .png()
    .toFile(path.join(outDir, 'ticket2grow-emerald.png'));

  // Also extract the exact "2" with arrow glyph
  // Let's locate the "2" bounding box inside the cropped area
  // In "Ticket2Grow", "2" is roughly between 40% and 60% of the width
  const glyphLeft = Math.round(cW * 0.41);
  const glyphWidth = Math.round(cW * 0.17);
  
  await sharp(whiteTransparent, { raw: { width: cW, height: cH, channels: 4 } })
    .extract({ left: glyphLeft, top: 0, width: glyphWidth, height: cH })
    .png()
    .toFile(path.join(outDir, 'ticket2grow-glyph-white.png'));

  await sharp(darkTransparent, { raw: { width: cW, height: cH, channels: 4 } })
    .extract({ left: glyphLeft, top: 0, width: glyphWidth, height: cH })
    .png()
    .toFile(path.join(outDir, 'ticket2grow-glyph-dark.png'));

  await sharp(emeraldTransparent, { raw: { width: cW, height: cH, channels: 4 } })
    .extract({ left: glyphLeft, top: 0, width: glyphWidth, height: cH })
    .png()
    .toFile(path.join(outDir, 'ticket2grow-glyph-emerald.png'));

  console.log('✅ Successfully created all exact Ticket2Grow brand assets in public/brand/ !');
}

processLogo().catch(err => {
  console.error('Error processing logo:', err);
  process.exit(1);
});
