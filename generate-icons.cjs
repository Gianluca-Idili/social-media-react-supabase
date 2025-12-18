const { Jimp } = require('jimp');
const fs = require('fs');

async function createIcon(size, filename) {
  // Create new image with purple background
  const image = new Jimp({ width: size, height: size, color: 0x8b5cf6ff });
  await image.write(filename);
  console.log(`Created ${filename}`);
}

async function createScreenshot(width, height, filename) {
  // Create dark background
  const image = new Jimp({ width, height, color: 0x0a0a0aff });
  
  // Add purple header bar
  for (let y = 0; y < height * 0.1; y++) {
    for (let x = 0; x < width; x++) {
      image.setPixelColor(0x8b5cf6ff, x, y);
    }
  }
  
  await image.write(filename);
  console.log(`Created ${filename}`);
}

async function main() {
  try {
    await createIcon(192, 'public/icon-192.png');
    await createIcon(512, 'public/icon-512.png');
    await createScreenshot(1280, 720, 'public/screenshot-wide.png');
    await createScreenshot(720, 1280, 'public/screenshot-mobile.png');
    console.log('All icons created!');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();