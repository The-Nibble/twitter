const getUrl = (str) => {
  const cleanedUrl = str.trim();
  const regex = /\[(.*?)\]\((.*?)\)/;
  const match = cleanedUrl.match(regex);
  return match[2];
};

const getLatestNibble = async () => {
  const readmeUrl =
    "https://raw.githubusercontent.com/aashutoshrathi/aashutoshrathi/master/README.md";
  const readmeResponse = await fetch(readmeUrl);
  const readme = await readmeResponse.text();
  const start = readme.indexOf("<!-- BLOGS:START -->");
  const end = readme.indexOf("<!-- BLOGS:END -->");

  const blogs = readme.slice(start, end);
  const [_, latest] = blogs.split("\n");
  return getUrl(latest);
};

setTimeout(async () => {
 // const latestUrl = await getLatestNibble();
  const latestUrl = "https://thenibble.substack.com/p/37";
  window.location.href = latestUrl;
}, 1000);
