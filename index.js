const getUrl = (str) => {
  const cleanedUrl = str.trim();
  const regex = /\[(.*?)\]\((.*?)\)/;
  const match = cleanedUrl.match(regex);
  if (match) {
    return match[2];
  }
};

const NIBBLE_SUBSTACK_URL = "thenibble.substack.com";
const getLatestNibble = async () => {
  const readmeUrl =
    "https://raw.githubusercontent.com/aashutoshrathi/aashutoshrathi/master/README.md";
  const readmeResponse = await fetch(readmeUrl);
  const readme = await readmeResponse.text();
  const start = readme.indexOf("<!-- BLOGS:START -->");
  const end = readme.indexOf("<!-- BLOGS:END -->");

  const blogs = readme.slice(start, end);
  const links = blogs
    .split("\n")
    .map((blog) => getUrl(blog))
    .filter((i) => !!i && i.includes(NIBBLE_SUBSTACK_URL));

  return links[0];
};

setTimeout(async () => {
  const latestUrl = await getLatestNibble();
  window.location.href = latestUrl;
}, 1000);
