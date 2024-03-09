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
    regex: /https:\/\/open\.substack\.com\/pub\/thenibble\/p\/(\d+)/,
    replacement: (newNum) => `https://open.substack.com/pub/thenibble/p/${newNum}`,
  },
  {
    regex: /https:\/\/nibbles\.dev\/p\/(\d+)/,
    replacement: (newNum) => `https://nibbles.dev/p/${newNum}`,
  },
  {
    regex: /https:\/\/files\.nibbles\.dev\/covers\/(\d+)/,
    replacement: (newNum) => `https://files.nibbles.dev/covers/${newNum}`,
  },
  {
    regex: /https:\/\/files\.nibbles\.dev\/wallpapers\/(\d+)/,
    replacement: (newNum) => `https://files.nibbles.dev/wallpapers/${newNum}`,
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
      const res = data.match(regex);
      if (!res) {
        return null;
      }
      const [fullMatch, number] = res;
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
