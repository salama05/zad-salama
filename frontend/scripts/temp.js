const Jimp = require('jimp');
async function findColor() {
  const image = await Jimp.read('D:\\1- my projects 2026\\zad salama\\frontend\\assets\\icon.png');
  const hex = image.getPixelColor(0, 0);
  console.log('Top Left Color Hex:', hex.toString(16));
}
findColor();
