const path = require("path");
const promises = require("fs/promises");
const sharp = require("sharp");

async function processImage(originalPath, filename) {
  const processedDir = path.resolve(
    process.cwd(),
    process.env.PROCESSED_DIR || "../main_service/uploads/processed",
  );

  await promises.mkdir(processedDir, { recursive: true });

  const processedPath = path.join(processedDir, filename);

  const metadata = await sharp(originalPath).metadata();

  const originalWidth = metadata.width || 1200;
  const originalHeight = metadata.height || 800;

  const maxWidth = 1200;

  const targetWidth = Math.min(originalWidth, maxWidth);
  const targetHeight = Math.round(
    (originalHeight * targetWidth) / originalWidth,
  );

  const watermarkHeight = Math.min(
    120,
    Math.max(24, Math.floor(targetHeight * 0.2)),
    targetHeight,
  );

  const fontSize = Math.max(12, Math.floor(watermarkHeight * 0.35));

  const watermarkSvg = Buffer.from(`
    <svg width="${targetWidth}" height="${watermarkHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="${targetWidth}" height="${watermarkHeight}" fill="black" opacity="0.35"/>
      <text x="30" y="${Math.floor(watermarkHeight * 0.65)}" font-size="${fontSize}" fill="white" font-family="Arial, sans-serif">
        Теорема вечных страданий
      </text>
    </svg>
  `);

  await sharp(originalPath)
    .resize({
      width: maxWidth,
      withoutEnlargement: true,
    })
    .composite([
      {
        input: watermarkSvg,
        gravity: "south",
      },
    ])
    .jpeg({
      quality: 80,
    })
    .toFile(processedPath);

  return processedPath;
}

module.exports = {
  processImage,
};
