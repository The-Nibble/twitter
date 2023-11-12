const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'index.js');

// Read the contents of index.js
fs.readFile(filePath, 'utf8', function (err, data) {
    if (err) {
        return console.log(err);
    }

    // Regular expression to match the URL and extract the number
    const regex = /https:\/\/thenibble\.substack\.com\/p\/(\d+)/;
    const match = data.match(regex);

    if (match && match[1]) {
        const currentNumber = parseInt(match[1]);
        const updatedNumber = currentNumber + 1;
        const updatedData = data.replace(
            regex,
            `https://thenibble.substack.com/p/${updatedNumber}`
        );

        // Write the updated contents back to index.js
        fs.writeFile(filePath, updatedData, 'utf8', function (err) {
            if (err) return console.log(err);
        });
    }
});
