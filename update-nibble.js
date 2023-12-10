const fs = require('fs');
const path = require('path');

const indexHtmlFile = path.join(__dirname, "index.html");

fs.readFile(indexHtmlFile, "utf8", function (err, data) {
  if (err) {
    return console.log(err);
  }
  let updatedData = data;

  const blogUrlRegex = /https:\/\/thenibble\.substack\.com\/p\/(\d+)/;
  const blogUrlMatch = data.match(blogUrlRegex);
  if (blogUrlMatch?.[1]) {
    const currentNumber = parseInt(blogUrlMatch[1]);
    updatedData = data.replaceAll(
      blogUrlMatch[0],
      `https://thenibble.substack.com/p/${currentNumber + 1}`
    );
  }

  const coverUrlRegex = /https:\/\/files\.nibbles\.dev\/covers\/(\d+)/;
  const coverUrlMatch = data.match(coverUrlRegex);
  console.log(coverUrlMatch);
  if (coverUrlMatch?.[1]) {
    const currentNumber = parseInt(coverUrlMatch[1]);
    updatedData = updatedData.replaceAll(
      coverUrlMatch[0],
      `https://files.nibbles.dev/covers/${currentNumber + 1}`
    );
  }

  const blogTitleRegex = /Nibble #(\d+)/;
  const titleMatch = data.match(blogTitleRegex);
  console.log(titleMatch);

  if (titleMatch?.[1]) {
    const currentNumber = parseInt(titleMatch[1]);
    updatedData = updatedData.replaceAll(
      titleMatch[0],
      `Nibble #${currentNumber + 1}`
    );
  }
  if (updatedData === data) {
    return;
  }

  fs.writeFile(indexHtmlFile, updatedData, "utf8", function (err) {
    if (err) return console.log(err);
  });
});
