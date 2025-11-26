/**
 * Script to download placeholder images from Unsplash
 * Run: node scripts/download-images.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const imageDir = path.join(__dirname, '../src/public/images');

// Create images directory if it doesn't exist
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true });
}

// Unsplash image URLs (using source.unsplash.com for random images)
const images = [
  {
    name: 'hero-healthcare.jpg',
    url: 'https://source.unsplash.com/1920x1080/?healthcare,hospital,medical',
    description: 'Hero section background'
  },
  {
    name: 'about-team.jpg',
    url: 'https://source.unsplash.com/1200x800/?professional,headshot,business',
    description: 'About page team section'
  },
  {
    name: 'services-technology.jpg',
    url: 'https://source.unsplash.com/1200x800/?medical,technology,digital',
    description: 'Services page background'
  },
  {
    name: 'features-medical.jpg',
    url: 'https://source.unsplash.com/1200x800/?healthcare,abstract,blue',
    description: 'Features section background'
  },
  {
    name: 'contact-support.jpg',
    url: 'https://source.unsplash.com/1200x800/?office,support,customer',
    description: 'Contact page background'
  },
  {
    name: 'testimonial-avatar-1.jpg',
    url: 'https://source.unsplash.com/400x400/?portrait,professional,face',
    description: 'Testimonial avatar 1'
  },
  {
    name: 'testimonial-avatar-2.jpg',
    url: 'https://source.unsplash.com/400x400/?portrait,professional,woman',
    description: 'Testimonial avatar 2'
  },
  {
    name: 'testimonial-avatar-3.jpg',
    url: 'https://source.unsplash.com/400x400/?portrait,professional,man',
    description: 'Testimonial avatar 3'
  }
];

/**
 * Download a single image
 * @param {Object} image - Image object with url, name, and description
 * @returns {Promise<void>}
 */
function downloadImage(image) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(imageDir, image.name);

    // Check if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`✓ ${image.name} already exists, skipping...`);
      resolve();
      return;
    }

    console.log(`Downloading ${image.name}...`);

    const file = fs.createWriteStream(filePath);

    https.get(image.url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        https.get(response.headers.location, (redirectResponse) => {
          redirectResponse.pipe(file);
          file.on('finish', () => {
            file.close();
            console.log(`✓ ${image.name} downloaded successfully`);
            resolve();
          });
        }).on('error', (err) => {
          fs.unlink(filePath, () => {});
          reject(err);
        });
      } else {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✓ ${image.name} downloaded successfully`);
          resolve();
        });
      }
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      reject(err);
    });

    file.on('error', (err) => {
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}

/**
 * Download all images
 */
async function downloadAllImages() {
  console.log('');
  console.log('==========================================');
  console.log('  LibaraNHS Image Downloader');
  console.log('==========================================');
  console.log('');
  console.log(`Downloading ${images.length} images from Unsplash...`);
  console.log('');

  try {
    for (const image of images) {
      await downloadImage(image);
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('');
    console.log('==========================================');
    console.log('  All images downloaded successfully!');
    console.log('==========================================');
    console.log('');
    console.log('Images saved to:', imageDir);
    console.log('');
  } catch (error) {
    console.error('');
    console.error('==========================================');
    console.error('  Error downloading images');
    console.error('==========================================');
    console.error('');
    console.error(error);
    console.error('');
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  downloadAllImages();
}

module.exports = { downloadAllImages };
