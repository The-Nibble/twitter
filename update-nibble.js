const fs = require("fs");
const path = require("path");

const indexHtmlFile = path.join(__dirname, "index.html");

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
    regex: /Nibble #(\d+)/,
    replacement: (newNum) => `Nibble #${newNum}`,
  },
];

fs.readFile(indexHtmlFile, "utf8", function (err, data) {
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
        replacement(currentNumber + 1)
      );
    }
  });

  if (updatedData === data) {
    return;
  }

  fs.writeFile(indexHtmlFile, updatedData, "utf8", function (err) {
    if (err) return console.log(err);
  });
});
