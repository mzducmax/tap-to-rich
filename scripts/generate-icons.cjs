/**
 * Build Windows .ico from resources/icon.png (electron-builder + BrowserWindow).
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const srcPng = path.join(root, 'resources', 'icon.png');
const buildDir = path.join(root, 'build');
const publicDir = path.join(root, 'public');

async function main() {
  if (!fs.existsSync(srcPng)) {
    console.error('[icons] Missing resources/icon.png — add a 512×512 PNG source file.');
    process.exit(1);
  }

  fs.mkdirSync(buildDir, { recursive: true });
  fs.mkdirSync(publicDir, { recursive: true });

  const sharp = (await import('sharp')).default;
  const squarePng = path.join(buildDir, 'icon.png');
  await sharp(srcPng)
    .resize(512, 512, { fit: 'cover', position: 'centre' })
    .png()
    .toFile(squarePng);

  const { default: pngToIco } = await import('png-to-ico');
  const ico = await pngToIco(squarePng);
  fs.writeFileSync(path.join(buildDir, 'icon.ico'), ico);
  fs.copyFileSync(squarePng, path.join(publicDir, 'favicon.png'));

  console.log('[icons] Wrote build/icon.ico');
  console.log('[icons] Wrote public/favicon.png');
}

main().catch((err) => {
  console.error('[icons] Failed:', err);
  process.exit(1);
});
