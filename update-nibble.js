const fs = require('fs');
const path = require('path');

const indexHtmlFile = path.join(__dirname, 'index.html');
const wallpaperHtmlFile = path.join(__dirname, 'wallpaper.html');

const regexesToUpdate = [
  {
    regex: /https:\/\/thenibble\.substack\.com\/p\/(\d+)/,
    replacement: (newNum) => `https://thenibble.substack.com/p/${newNum}`,
  },
  {
    regex: /https:\/\/files\.nibbles\.dev\/covers\/(\d+)/,
    replacement: (newNum) => `https://files.nibbles.dev/covers/${newNum}`,
  },
  {
    regex: /https:\/\/files\.nibbles\.dev\/wallapapers\/(\d+)/,
    replacement: (newNum) => `https://files.nibbles.dev/wallapapers/${newNum}`,
  },
  {
    regex: /Nibble #(\d+)/,
    replacement: (newNum) => `Nibble #${newNum}`,
  },
];

const files = [indexHtmlFile, wallpaperHtmlFile];

for (const file of files) {
  fs.readFile(file, 'utf8', function (err, data) {
    if (err) {
      return console.log(err);
    }
    let updatedData = data;

    regexesToUpdate.forEach(({ regex, replacement }) => {
      const [fullMatch, number] = data.match(regex);
      if (number) {
        const currentNumber = parseInt(number);
        updatedData = updatedData.replaceAll(
          fullMatch,
          replacement(currentNumber + 1),
        );
      }
    });

    if (updatedData === data) {
      return;
    }

    fs.writeFile(file, updatedData, 'utf8', function (err) {
      if (err) return console.log(err);
    });
  });
}

