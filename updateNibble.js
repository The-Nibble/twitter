import fs from 'fs';
import fetch from 'node-fetch';

const RSS2JSON_ENDPOINT = 'https://api.rss2json.com/v1/api.json?rss_url=';
const FEED_URL = encodeURIComponent('https://www.nibbles.dev/feed');

const timestamp = Date.now();
const API_URL = `${RSS2JSON_ENDPOINT}${FEED_URL}?t=${timestamp}`;
const DELIMITER = '|';

// Files to update
const filesToUpdate = ['index.html', 'wallpaper.html'];

// Regexes to update
const regexesToUpdate = [
  {
    regex: /https:\/\/thenibble\.substack\.com\/p\/(\d+)\/?/g,
    replacement: (newNum) => `https://thenibble.substack.com/p/${newNum}`,
  },
  {
    regex: /https:\/\/open\.substack\.com\/pub\/thenibble\/p\/(\d+)\/?/g,
    replacement: (newNum) =>
      `https://open.substack.com/pub/thenibble/p/${newNum}`,
  },
  {
    regex: /https:\/\/nibbles\.dev\/p\/(\d+)\/?/g,
    replacement: (newNum) => `https://nibbles.dev/p/${newNum}`,
  },
  {
    regex: /https:\/\/files\.nibbles\.dev\/covers\/(\d+)\/?/g,
    replacement: (newNum) => `https://files.nibbles.dev/covers/${newNum}`,
  },
  {
    regex: /https:\/\/files\.nibbles\.dev\/wallpapers\/(\d+)\/?/g,
    replacement: (newNum) => `https://files.nibbles.dev/wallpapers/${newNum}`,
  },
  {
    regex: /Nibble #(\d+)/g,
    replacement: (newNum) => `Nibble #${newNum}`,
  },
];

// Fetch the latest nibble data
async function fetchLatestNibble() {
  const res = await fetch(API_URL);
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  const data = await res.json();
  const { status, items } = data;

  if (status !== 'ok' || !items?.length) {
    throw new Error('Failed to fetch RSS feed or no items found');
  }

  const [latestItem] = items;
  if (!latestItem) {
    throw new Error('No latest item found in RSS feed');
  }

  const { link, title } = latestItem;
  const match = title.match(/#(\d+)/);
  if (!match) {
    throw new Error('Unable to extract nibble number from title');
  }
  const latestNumber = match[1];

  return { link, latestNumber };
}

// Update files with the new link and nibble number
function updateFiles(newLink, latestNumber) {
  filesToUpdate.forEach((file) => {
    try {
      const data = fs.readFileSync(file, 'utf-8');
      let updatedContent = data;

      regexesToUpdate.forEach(({ regex, replacement }) => {
        updatedContent = updatedContent.replaceAll(
          regex,
          (match, oldNumber) => {
            if (oldNumber && oldNumber !== latestNumber) {
              return replacement(latestNumber);
            }
            return match;
          },
        );
      });

      if (data !== updatedContent) {
        fs.writeFileSync(file, updatedContent, 'utf-8');
        console.log(`Updated ${file}`);
      } else {
        console.log(`No changes needed in ${file}`);
      }
    } catch (error) {
      console.error(`Error updating file ${file}:`, error);
    }
  });

  // Update the current link and nibble number
  try {
    fs.writeFileSync(
      'current_link.txt',
      [newLink, latestNumber].join(DELIMITER),
      'utf-8',
    );
  } catch (error) {
    console.error('Error updating current_link.txt:', error);
  }
}

function getCurrentData() {
  try {
    if (fs.existsSync('current_link.txt')) {
      const data = fs.readFileSync('current_link.txt', 'utf-8').trim();
      const [link, number] = data.split(DELIMITER);
      return { link, number };
    }
    return { link: '', number: '' };
  } catch (error) {
    console.error('Error reading current_link.txt:', error);
    return { link: '', number: '' };
  }
}

(async () => {
  try {
    const { link: fetchedLink, latestNumber } = await fetchLatestNibble();
    const { link: currentLink, number: currentNumber } = getCurrentData();

    if (!fetchedLink || !latestNumber) {
      throw new Error('Invalid fetched link or nibble number');
    }

    if (fetchedLink !== currentLink || latestNumber !== currentNumber) {
      console.log('Link or Nibble number has changed. Updating files...');
      updateFiles(fetchedLink, latestNumber);
      console.log('Files updated.');
    } else {
      console.log('No changes detected. No action taken.');
    }
  } catch (error) {
    console.error('Error updating Nibble link and number:', error);
    process.exit(1);
  }
})();
