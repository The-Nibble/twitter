import fs from 'fs';
import fetch from 'node-fetch';
import { execSync } from 'child_process';

const RSS2JSON_ENDPOINT = 'https://api.rss2json.com/v1/api.json?rss_url=';
const FEED_URL = encodeURIComponent('https://www.nibbles.dev/feed');
const API_URL = `${RSS2JSON_ENDPOINT}${FEED_URL}`;

// Files to update
const filesToUpdate = ['index.html', 'wallpaper.html'];

// Regexes to update
const regexesToUpdate = [
  {
    regex: /https:\/\/thenibble\.substack\.com\/p\/(\d+)/,
    replacement: (newNum) => `https://thenibble.substack.com/p/${newNum}`,
  },
  {
    regex: /https:\/\/open\.substack\.com\/pub\/thenibble\/p\/(\d+)/,
    replacement: (newNum) =>
      `https://open.substack.com/pub/thenibble/p/${newNum}`,
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

// Fetch the latest nibble data
async function fetchLatestNibble() {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();

  if (data.status !== 'ok' || !data.items || data.items.length === 0) {
    throw new Error('Failed to fetch RSS feed or no items found');
  }

  const latestItem = data.items[0];
  const link = latestItem.link;
  const title = latestItem.title;
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
      let data = fs.readFileSync(file, 'utf-8');
      let updatedContent = data;

      regexesToUpdate.forEach(({ regex, replacement }) => {
        const res = data.match(regex);
        if (!res) {
          return;
        }
        const [match, oldNumber] = res;
        if (!oldNumber || oldNumber === latestNumber) {
          return;
        }
        updatedContent = updatedContent.replaceAll(
          regex,
          replacement(latestNumber),
        );
      });
      fs.writeFileSync(file, updatedContent, 'utf-8');
    } catch (error) {
      console.error(`Error updating file ${file}:`, error);
    }
  });

  // Update the current link and nibble number
  try {
    fs.writeFileSync('current_link.txt', `${newLink}|${latestNumber}`, 'utf-8');
  } catch (error) {
    console.error('Error updating current_link.txt:', error);
  }
}

function getCurrentData() {
  try {
    // Assuming the current link and nibble number are stored in 'current_link.txt' separated by a pipe
    if (fs.existsSync('current_link.txt')) {
      const data = fs.readFileSync('current_link.txt', 'utf-8').trim();
      const [link, number] = data.split('|');
      return { link, number };
    }
    return { link: '', number: '' };
  } catch (error) {
    console.error('Error reading current_link.txt:', error);
    return { link: '', number: '' };
  }
}

// Commit and push changes if any
function commitChanges(latestNumber) {
  execSync('git config user.name "Nibble Devs"');
  execSync('git config user.email "git@nibbles.dev"');
  execSync('git add .');
  execSync(`git commit -m "Automated update of Nibble ${latestNumber}"`);
  execSync('git push');
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
      commitChanges(latestNumber);
      console.log('Files updated and changes pushed.');
    } else {
      console.log('No changes detected. No action taken.');
    }
  } catch (error) {
    console.error('Error updating Nibble link and number:', error);
    process.exit(1);
  }
})();
