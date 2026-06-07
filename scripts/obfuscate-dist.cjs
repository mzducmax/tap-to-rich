const fs = require('fs/promises');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

const DIST_ASSETS_DIR = path.resolve(__dirname, '..', 'dist', 'assets');

const OBFUSCATION_OPTIONS = {
  compact: true,
  simplify: true,
  stringArray: true,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayThreshold: 0.2,
  splitStrings: false,
  controlFlowFlattening: false,
  deadCodeInjection: false,
  renameGlobals: false,
  selfDefending: false,
  debugProtection: false,
  identifierNamesGenerator: 'hexadecimal',
};

async function obfuscateDist() {
  const files = await fs.readdir(DIST_ASSETS_DIR);
  const jsFiles = files.filter((name) => name.endsWith('.js'));

  if (jsFiles.length === 0) {
    console.log('[obfuscate] No JS bundles found in dist/assets');
    return;
  }

  for (const fileName of jsFiles) {
    const filePath = path.join(DIST_ASSETS_DIR, fileName);
    const source = await fs.readFile(filePath, 'utf8');
    const result = JavaScriptObfuscator.obfuscate(source, OBFUSCATION_OPTIONS);
    await fs.writeFile(filePath, result.getObfuscatedCode(), 'utf8');
    console.log(`[obfuscate] ${fileName}`);
  }
}

obfuscateDist().catch((error) => {
  console.error('[obfuscate] Failed:', error);
  process.exit(1);
});
