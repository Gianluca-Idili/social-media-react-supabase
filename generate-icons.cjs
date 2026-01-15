const { Jimp } = require('jimp');
const fs = require('fs');
const path = require('path');

async function processIcons(sourcePath) {
  try {
    console.log(`Reading source image from ${sourcePath}...`);
    const sourceImage = await Jimp.read(sourcePath);
    
    // Create icons
    const iconSizes = [192, 512];
    for (const size of iconSizes) {
      const icon = sourceImage.clone();
      await icon.resize({ w: size, h: size });
      const filename = `public/icon-${size}.png`;
      await icon.write(filename);
      console.log(`Created ${filename}`);
    }

    // Create screenshots (PWA screenshots should ideally be representative of the app, 
    // but using the logo/splash theme is a common fallback if no UI screenshot is provided)
    // We'll use the source image for now but centered on a dark canvas for "screenshot-wide" 
    // and "screenshot-mobile" if the user wants them.
    
    // For now, let's just make sure the main icons are updated.
    
    console.log('All icons processed successfully!');
  } catch (error) {
    console.error('Error processing icons:', error);
  }
}

const source = path.join(__dirname, 'pwa-source.jpg');
if (fs.existsSync(source)) {
  processIcons(source);
} else {
  console.error('Source image pwa-source.jpg not found!');
}