import sharp from "sharp";

export async function createWatermarkedPreview(inputBuffer: Buffer) {
  const image = sharp(inputBuffer).rotate();
  const metadata = await image.metadata();
  const width = metadata.width ?? 1024;
  const height = metadata.height ?? 1024;
  const targetWidth = Math.min(width, 1400);
  const targetHeight = Math.round(height * (targetWidth / width));
  const fontSize = Math.max(24, Math.round(targetWidth / 24));

  const watermarkSvg = Buffer.from(`
    <svg width="${targetWidth}" height="${targetHeight}" viewBox="0 0 ${targetWidth} ${targetHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shade" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="#000000" stop-opacity="0"/>
          <stop offset="1" stop-color="#000000" stop-opacity="0.30"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#shade)"/>
      <g transform="translate(${Math.round(targetWidth * 0.06)} ${Math.round(targetHeight * 0.86)})">
        <rect x="0" y="-${fontSize * 1.35}" rx="10" ry="10" width="${fontSize * 11.8}" height="${fontSize * 2.05}" fill="#080706" opacity="0.72"/>
        <text x="${fontSize * 0.7}" y="0" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="700" fill="#f4d27d">Yaadein AI Preview</text>
      </g>
    </svg>
  `);

  return image
    .resize({ width: targetWidth, withoutEnlargement: true })
    .composite([{ input: watermarkSvg, gravity: "center" }])
    .jpeg({ quality: 88 })
    .toBuffer();
}

export async function normalizeHdExport(inputBuffer: Buffer) {
  return sharp(inputBuffer)
    .rotate()
    .resize({ width: 3840, height: 3840, fit: "inside", withoutEnlargement: false })
    .sharpen({ sigma: 1.05, m1: 0.6, m2: 0.4 })
    .jpeg({ quality: 94 })
    .toBuffer();
}

export async function createBeforeAfterShareImage(beforeBuffer: Buffer, afterBuffer: Buffer) {
  const width = 1600;
  const height = 1200;
  const panelWidth = width / 2;
  const labelFont = 38;
  const brandFont = 34;
  const before = await sharp(beforeBuffer)
    .rotate()
    .resize({ width: panelWidth, height, fit: "cover", position: "attention" })
    .jpeg({ quality: 92 })
    .toBuffer();
  const after = await sharp(afterBuffer)
    .rotate()
    .resize({ width: panelWidth, height, fit: "cover", position: "attention" })
    .jpeg({ quality: 92 })
    .toBuffer();

  const overlay = Buffer.from(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bottom" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stop-color="#000000" stop-opacity="0"/>
          <stop offset="1" stop-color="#000000" stop-opacity="0.58"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="none"/>
      <rect x="0" y="${height - 210}" width="${width}" height="210" fill="url(#bottom)"/>
      <line x1="${panelWidth}" y1="0" x2="${panelWidth}" y2="${height}" stroke="#f4d27d" stroke-width="6"/>
      <g font-family="Arial, Helvetica, sans-serif" font-weight="700">
        <rect x="44" y="42" rx="18" ry="18" width="150" height="62" fill="#080706" opacity="0.72"/>
        <text x="72" y="84" font-size="${labelFont}" fill="#fff7ea">Before</text>
        <rect x="${panelWidth + 44}" y="42" rx="18" ry="18" width="170" height="62" fill="#080706" opacity="0.72"/>
        <text x="${panelWidth + 72}" y="84" font-size="${labelFont}" fill="#fff7ea">Restored</text>
        <text x="52" y="${height - 68}" font-size="${brandFont}" fill="#f4d27d">Yaadein AI</text>
        <text x="52" y="${height - 28}" font-size="24" fill="#fff7ea">Restored memories worth sharing</text>
      </g>
    </svg>
  `);

  return sharp({
    create: {
      width,
      height,
      channels: 3,
      background: "#080706"
    }
  })
    .composite([
      { input: before, left: 0, top: 0 },
      { input: after, left: panelWidth, top: 0 },
      { input: overlay, left: 0, top: 0 }
    ])
    .jpeg({ quality: 92 })
    .toBuffer();
}

export async function createMockRestoration(inputBuffer: Buffer, mode: "preview" | "hd") {
  const width = mode === "hd" ? 2400 : 1400;

  return sharp(inputBuffer)
    .rotate()
    .resize({ width, fit: "inside", withoutEnlargement: false })
    .modulate({ brightness: 1.05, saturation: 1.12 })
    .linear(1.04, -3)
    .sharpen({ sigma: mode === "hd" ? 1.2 : 0.9 })
    .jpeg({ quality: mode === "hd" ? 94 : 88 })
    .toBuffer();
}
