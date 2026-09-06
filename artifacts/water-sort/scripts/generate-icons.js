import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resvg } from '@resvg/resvg-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.resolve(__dirname, '../public');
const iconsDir = path.resolve(publicDir, 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const svgPath = path.resolve(publicDir, 'icon.svg');
const svgContent = fs.readFileSync(svgPath, 'utf8');

function renderSvg(svgStr, width, height) {
  const resvg = new Resvg(svgStr, {
    fitTo: {
      mode: 'width',
      value: width,
    },
  });
  const pngData = resvg.render();
  return pngData.asPng();
}

// 1. Square Icons
const squareSizes = [
  // Standard PWA / Web
  { name: 'icon-512x512.png', size: 512, dest: publicDir },
  { name: 'icon-192x192.png', size: 192, dest: publicDir },
  { name: 'icon-144x144.png', size: 144, dest: iconsDir },
  { name: 'icon-96x96.png', size: 96, dest: iconsDir },
  { name: 'icon-48x48.png', size: 48, dest: iconsDir },
  { name: 'favicon.png', size: 32, dest: publicDir },

  // Microsoft Store / Windows AppX / MSIX package logos
  { name: 'StoreLogo.png', size: 50, dest: iconsDir },
  { name: 'StoreLogo.scale-100.png', size: 50, dest: iconsDir },
  { name: 'StoreLogo.scale-200.png', size: 100, dest: iconsDir },
  { name: 'StoreLogo.scale-400.png', size: 200, dest: iconsDir },

  { name: 'Square44x44Logo.png', size: 44, dest: iconsDir },
  { name: 'Square44x44Logo.targetsize-44.png', size: 44, dest: iconsDir },
  { name: 'Square44x44Logo.scale-100.png', size: 44, dest: iconsDir },
  { name: 'Square44x44Logo.scale-200.png', size: 88, dest: iconsDir },
  { name: 'Square44x44Logo.scale-400.png', size: 176, dest: iconsDir },

  { name: 'Square71x71Logo.png', size: 71, dest: iconsDir },
  { name: 'Square71x71Logo.scale-100.png', size: 71, dest: iconsDir },
  { name: 'Square71x71Logo.scale-200.png', size: 142, dest: iconsDir },

  { name: 'Square150x150Logo.png', size: 150, dest: iconsDir },
  { name: 'Square150x150Logo.scale-100.png', size: 150, dest: iconsDir },
  { name: 'Square150x150Logo.scale-200.png', size: 300, dest: iconsDir },
  { name: 'Square150x150Logo.scale-400.png', size: 600, dest: iconsDir },

  { name: 'Square310x310Logo.png', size: 310, dest: iconsDir },
  { name: 'Square310x310Logo.scale-100.png', size: 310, dest: iconsDir },
  { name: 'Square310x310Logo.scale-200.png', size: 620, dest: iconsDir },
];

console.log('Generating square icons...');
for (const item of squareSizes) {
  const pngBuffer = renderSvg(svgContent, item.size, item.size);
  const outPath = path.resolve(item.dest, item.name);
  fs.writeFileSync(outPath, pngBuffer);
  console.log(`Generated: ${item.name} (${item.size}x${item.size})`);
}

// 2. Wide Logos (310x150, 620x300) and Splash Screens (620x300, 1240x600)
function createWideSvg(width, height) {
  const iconHeight = Math.round(height * 0.75);
  const iconWidth = iconHeight;
  const offsetX = Math.round((width - iconWidth) / 2);
  const offsetY = Math.round((height - iconHeight) / 2);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <rect width="${width}" height="${height}" fill="#08101a"/>
    <g transform="translate(${offsetX}, ${offsetY}) scale(${iconHeight / 512})">
      ${svgContent.replace(/<svg[^>]*>/, '').replace('</svg>', '')}
    </g>
  </svg>`;
}

const wideSizes = [
  { name: 'Wide310x150Logo.png', width: 310, height: 150, dest: iconsDir },
  { name: 'Wide310x150Logo.scale-100.png', width: 310, height: 150, dest: iconsDir },
  { name: 'Wide310x150Logo.scale-200.png', width: 620, height: 300, dest: iconsDir },

  { name: 'SplashScreen.png', width: 620, height: 300, dest: iconsDir },
  { name: 'SplashScreen.scale-100.png', width: 620, height: 300, dest: iconsDir },
  { name: 'SplashScreen.scale-200.png', width: 1240, height: 600, dest: iconsDir },
];

console.log('Generating wide & splash screen icons...');
for (const item of wideSizes) {
  const wideSvg = createWideSvg(item.width, item.height);
  const pngBuffer = renderSvg(wideSvg, item.width, item.height);
  const outPath = path.resolve(item.dest, item.name);
  fs.writeFileSync(outPath, pngBuffer);
  console.log(`Generated: ${item.name} (${item.width}x${item.height})`);
}

console.log('All Microsoft Store & Windows icons successfully generated!');
