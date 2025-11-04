import sharp from "sharp";

await sharp("src/assets/logo-abattoir.png")
  .resize({ width: 140 })
  .webp({ quality: 70 })
  .toFile("src/assets/logo-abattoir.webp");

console.log("OK: src/assets/logo-abattoir.webp");
