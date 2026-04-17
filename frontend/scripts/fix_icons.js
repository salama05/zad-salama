const fs = require('fs');
const path = require('path');
const source = path.join(__dirname, 'resources', 'icon.png');
const resDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');

if (!fs.existsSync(source)) {
    console.error('Source icon not found!');
    process.exit(1);
}

const folders = ['mipmap-hdpi', 'mipmap-mdpi', 'mipmap-xhdpi', 'mipmap-xxhdpi', 'mipmap-xxxhdpi'];
const files = ['ic_launcher.png', 'ic_launcher_round.png', 'ic_launcher_foreground.png'];

folders.forEach(folder => {
    const targetDir = path.join(resDir, folder);
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }
    files.forEach(file => {
        const dest = path.join(targetDir, file);
        fs.copyFileSync(source, dest);
        console.log('Overwrote:', dest);
    });
});
console.log('All Android icons forcefully overwritten!');
