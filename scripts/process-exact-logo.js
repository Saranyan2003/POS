const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputPath = 'C:\\Users\\saran\\.gemini\\antigravity-ide\\brain\\c9da1c1c-c957-43c7-ab0e-e5229108ffa9\\.user_uploaded\\media_1790423290284.png';
const outDir = path.join(__dirname, '..', 'public', 'brand');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  console.log('Loading user image:', inputPath);
  const metadata = await sharp(inputPath).metadata();
  console.log(`Original size: ${metadata.width} x ${metadata.height}`);

  const rawObj = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
  const { data, info } = rawObj;
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
      const brightness = Math.max(r, g, b);

      if (brightness > 25) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  console.log(`Exact logo bounding box: [${minX}, ${minY}] to [${maxX}, ${maxY}] (W: ${maxX - minX + 1}, H: ${maxY - minY + 1})`);

  const pad = 8;
  const cropX = Math.max(0, minX - pad);
  const cropY = Math.max(0, minY - pad);
  const cropW = Math.min(width - cropX, (maxX - minX + 1) + pad * 2);
  const cropH = Math.min(height - cropY, (maxY - minY + 1) + pad * 2);

  console.log(`Crop dimensions: ${cropW} x ${cropH}`);

  // Extract the cropped buffer
  const cropped = await sharp(inputPath)
    .extract({ left: cropX, top: cropY, width: cropW, height: cropH })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const cData = cropped.data;
  const cW = cropped.info.width;
  const cH = cropped.info.height;
  const cChannels = cropped.info.channels;

  // Let's create multiple color theme variations with perfect alpha blending:
  // 1. Pure White on Transparent (for dark backgrounds / headers)
  // 2. Theme Dark / Obsidian (#090d0b / #0f172a) on Transparent (for light marble background)
  // 3. Theme Primary Emerald (#059669) on Transparent
  // 4. Theme Vivid Emerald (#10b981) on Transparent
  // 5. Dual-tone Theme: "Ticket" & "Grow" in Dark/Obsidian, and "2" in Emerald (#059669 / #10b981)
  // 6. Dual-tone Theme: "Ticket" & "Grow" in White, and "2" in Emerald (#10b981)

  // First, let's find the exact horizontal bounds of the '2' glyph inside the cropped image
  // Let's analyze column brightness distribution across X
  const colBrightnesses = new Array(cW).fill(0);
  for (let x = 0; x < cW; x++) {
    for (let y = 0; y < cH; y++) {
      const idx = (y * cW + x) * cChannels;
      const b = Math.max(cData[idx], cData[idx+1], cData[idx+2]);
      if (b > 30) colBrightnesses[x] += b;
    }
  }

  // Let's find columns where there is content
  console.log('Analyzing character segments...');

  // Function to create colorized transparent PNG buffer
  function createVariantBuffer(colorFn) {
    const buf = Buffer.alloc(cW * cH * 4);
    for (let y = 0; y < cH; y++) {
      for (let x = 0; x < cW; x++) {
        const srcIdx = (y * cW + x) * cChannels;
        const outIdx = (y * cW + x) * 4;

        const r = cData[srcIdx];
        const g = cData[srcIdx + 1];
        const b = cData[srcIdx + 2];
        const brightness = Math.max(r, g, b);

        let alpha = 0;
        if (brightness > 20) {
          // Smooth anti-aliased alpha
          alpha = Math.min(255, Math.round(((brightness - 20) / (255 - 20)) * 255));
        }

        const [outR, outG, outB] = colorFn(x, y, alpha);
        buf[outIdx] = outR;
        buf[outIdx + 1] = outG;
        buf[outIdx + 2] = outB;
        buf[outIdx + 3] = alpha;
      }
    }
    return buf;
  }

  // 1. Pure White
  const whiteBuf = createVariantBuffer(() => [255, 255, 255]);
  await sharp(whiteBuf, { raw: { width: cW, height: cH, channels: 4 } })
    .png()
    .toFile(path.join(outDir, 'ticket2grow-logo-white.png'));

  // 2. Theme Dark / Obsidian (#090d0b)
  const darkBuf = createVariantBuffer(() => [9, 13, 11]);
  await sharp(darkBuf, { raw: { width: cW, height: cH, channels: 4 } })
    .png()
    .toFile(path.join(outDir, 'ticket2grow-logo-dark.png'));

  // 3. Theme Primary Emerald (#059669)
  const emeraldBuf = createVariantBuffer(() => [5, 150, 105]);
  await sharp(emeraldBuf, { raw: { width: cW, height: cH, channels: 4 } })
    .png()
    .toFile(path.join(outDir, 'ticket2grow-logo-emerald.png'));

  // 4. Dual-tone for Light Theme: "Ticket" & "Grow" = #090d0b, "2" (and connecting arrow) = #059669
  // "2" is roughly located around x = cW * 0.42 to 0.58
  const glyphXStart = Math.round(cW * 0.425);
  const glyphXEnd = Math.round(cW * 0.575);

  const dualToneDarkBuf = createVariantBuffer((x) => {
    if (x >= glyphXStart && x <= glyphXEnd) {
      // Emerald for '2'
      return [5, 150, 105];
    }
    // Obsidian for Ticket and Grow
    return [9, 13, 11];
  });
  await sharp(dualToneDarkBuf, { raw: { width: cW, height: cH, channels: 4 } })
    .png()
    .toFile(path.join(outDir, 'ticket2grow-logo-dualtone-dark.png'));

  // 5. Dual-tone for Dark Theme: "Ticket" & "Grow" = #ffffff, "2" = #10b981
  const dualToneWhiteBuf = createVariantBuffer((x) => {
    if (x >= glyphXStart && x <= glyphXEnd) {
      // Vivid Emerald for '2'
      return [16, 185, 129];
    }
    // Pure White for Ticket and Grow
    return [255, 255, 255];
  });
  await sharp(dualToneWhiteBuf, { raw: { width: cW, height: cH, channels: 4 } })
    .png()
    .toFile(path.join(outDir, 'ticket2grow-logo-dualtone-white.png'));

  // Extract exact "2" glyph separately for app icon / favicon / compact navbar glyphs
  // Let's find exact bounds of the '2' glyph
  let glyphMinX = cW, glyphMaxX = 0, glyphMinY = cH, glyphMaxY = 0;
  for (let x = Math.round(cW * 0.40); x <= Math.round(cW * 0.60); x++) {
    for (let y = 0; y < cH; y++) {
      const idx = (y * cW + x) * cChannels;
      const b = Math.max(cData[idx], cData[idx+1], cData[idx+2]);
      if (b > 30) {
        if (x < glyphMinX) glyphMinX = x;
        if (x > glyphMaxX) glyphMaxX = x;
        if (y < glyphMinY) glyphMinY = y;
        if (y > glyphMaxY) glyphMaxY = y;
      }
    }
  }

  const gPad = 4;
  const gX = Math.max(0, glyphMinX - gPad);
  const gY = Math.max(0, glyphMinY - gPad);
  const gW = Math.min(cW - gX, (glyphMaxX - glyphMinX + 1) + gPad * 2);
  const gH = Math.min(cH - gY, (glyphMaxY - glyphMinY + 1) + gPad * 2);

  console.log(`Glyph '2' extracted bounds: ${gW} x ${gH} at [${gX}, ${gY}]`);

  // Extract glyph white
  await sharp(whiteBuf, { raw: { width: cW, height: cH, channels: 4 } })
    .extract({ left: gX, top: gY, width: gW, height: gH })
    .png()
    .toFile(path.join(outDir, 'ticket2grow-glyph-white.png'));

  // Extract glyph emerald
  await sharp(emeraldBuf, { raw: { width: cW, height: cH, channels: 4 } })
    .extract({ left: gX, top: gY, width: gW, height: gH })
    .png()
    .toFile(path.join(outDir, 'ticket2grow-glyph-emerald.png'));

  // Extract glyph dark
  await sharp(darkBuf, { raw: { width: cW, height: cH, channels: 4 } })
    .extract({ left: gX, top: gY, width: gW, height: gH })
    .png()
    .toFile(path.join(outDir, 'ticket2grow-glyph-dark.png'));

  // Also create a high-res app icon with rounded container and gradient background
  const iconSize = 256;
  const glyphResized = await sharp(path.join(outDir, 'ticket2grow-glyph-white.png'))
    .resize(160, 160, { fit: 'inside' })
    .toBuffer();

  const iconBg = await sharp({
    create: {
      width: iconSize,
      height: iconSize,
      channels: 4,
      background: { r: 5, g: 150, b: 105, alpha: 1 }
    }
  })
    .composite([{ input: glyphResized, gravity: 'center' }])
    .png()
    .toFile(path.join(outDir, 'ticket2grow-app-icon.png'));

  console.log('✅ ALL EXACT BRAND ASSETS GENERATED SUCCESSFULLY!');
}

run().catch(console.error);
