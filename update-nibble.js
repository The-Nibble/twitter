const fs = require('fs');
const fetch = require('node-fetch');
const { execSync } = require('child_process');

const RSS2JSON_ENDPOINT = 'https://api.rss2json.com/v1/api.json?rss_url=';
const FEED_URL = encodeURIComponent('https://www.nibbles.dev/feed');
const API_URL = `${RSS2JSON_ENDPOINT}${FEED_URL}`;

// Files to update
const filesToUpdate = ['index.html', 'wallpaper.html'];

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
    let content = fs.readFileSync(file, 'utf-8');
    const updatedContent = content
      .replace(/https:\/\/www\.nibbles\.dev\/[^'"]+/, newLink)
      .replace(/Nibble #\d+/, `Nibble #${latestNumber}`);
    fs.writeFileSync(file, updatedContent, 'utf-8');
  });

  // Update the current link and nibble number
  fs.writeFileSync('current_link.txt', `${newLink}|${latestNumber}`, 'utf-8');
}

function getCurrentData() {
  // Assuming the current link and nibble number are stored in 'current_link.txt' separated by a pipe
  if (fs.existsSync('current_link.txt')) {
    const data = fs.readFileSync('current_link.txt', 'utf-8').trim();
    const [link, number] = data.split('|');
    return { link, number };
  }
  return { link: '', number: '' };
}

// Commit and push changes if any
function commitChanges() {
  execSync('git config user.name "Nibble Devs"');
  execSync('git config user.email "git@nibbles.dev"');
  execSync('git add .');
  execSync('git commit -m "Automated update of Nibble link"');
  execSync('git push');
}

(async () => {
  try {
    const { link: fetchedLink, latestNumber } = await fetchLatestNibble();
    const { link: currentLink, number: currentNumber } = getCurrentData();

    if (fetchedLink !== currentLink || latestNumber !== currentNumber) {
      console.log('Link or Nibble number has changed. Updating files...');
      updateFiles(fetchedLink, latestNumber);
      commitChanges();
      console.log('Files updated and changes pushed.');
    } else {
      console.log('No changes detected. No action taken.');
    }
  } catch (error) {
    console.error('Error updating Nibble link and number:', error);
    process.exit(1);
  }
})();
