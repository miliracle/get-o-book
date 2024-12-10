/**
 * Finds and extracts the table of contents from the O'Reilly learning platform page.
 * Looks for an ordered list with "tableofcontents" in the class name and extracts chapter links.
 * @returns {Array<{title: string, url: string}>|null} Array of chapter info objects, or null if not found
 */
function findTableOfContents() {
  console.log('Searching for table of contents...');

  const tableOfContentsOl = document.querySelector('ol[class*="tableofcontents" i]');
  if (!tableOfContentsOl) {
    console.log('No ordered list found');
    return null;
  }

  console.log('Found ordered list:', tableOfContentsOl);

  const links = Array.from(tableOfContentsOl.querySelectorAll('a.orm-Link-root'))
    .filter(link => !link.getAttribute('href').includes('#'))
    .map(link => ({
      title: link.textContent.trim(),
      url: link.getAttribute('href')
    }));

  console.log('Extracted index list:', links);
  return links;
}

/**
 * Fetches the content of a specific chapter from the O'Reilly API.
 * @param {Object} indexInfo - Object containing chapter URL and other info
 * @param {string} indexInfo.url - The chapter URL to fetch
 * @returns {Promise<string>} The chapter content as HTML text
 */
async function fetchChapterContent(indexInfo) {
  console.log('Fetching chapter content:', indexInfo);

  const { url } = indexInfo;
  const [idBook, idChapter] = url.split('/').slice(4, 6);
  const urlApi = `https://learning.oreilly.com/api/v2/epubs/urn:orm:book:${idBook}/files/${idChapter}`;

  const headers = {
    Accept: '*/*',
    'Accept-Language': 'vi,en-US;q=0.9,en;q=0.8,ko;q=0.7,vi-VN;q=0.6',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    Cookie: document.cookie,
    DNT: '1',
    Pragma: 'no-cache',
    Referer: window.location.href,
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'User-Agent': navigator.userAgent,
    'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"'
  };

  const response = await fetch(urlApi, { headers });
  return response.text();
}

/**
 * Helper function to get content from a DOM element based on a selector and attribute.
 * @param {string} selector - CSS selector to find the element
 * @param {string} [attribute='textContent'] - Which attribute to extract ('textContent' or 'src')
 * @returns {string} The extracted content or empty string if element not found
 */
function getElementContent(selector, attribute = 'textContent') {
  const element = document.querySelector(selector);
  console.log(`${selector.split('[')[0]}DOM:`, element);

  if (!element) return '';

  if (attribute === 'textContent') {
    return element.textContent.trim();
  }

  if (attribute === 'src') {
    return element.src.replace('200w', '800w');
  }

  return '';
}

/**
 * Extracts the book author from the page.
 * @returns {string} The book author's name
 */
function fetchBookAuthor() {
  return getElementContent('p[class*="author"] a');
}

/**
 * Extracts the book title from the page.
 * @returns {string} The book title
 */
function fetchBookTitle() {
  return getElementContent('h3[class*="title"] a');
}

/**
 * Extracts the book cover image URL from the page.
 * Replaces low-res (200w) with high-res (800w) version.
 * @returns {string} The book cover image URL
 */
function fetchBookCover() {
  return getElementContent('img[class*="cover"]', 'src');
}

export {
  findTableOfContents,
  fetchChapterContent,
  fetchBookAuthor,
  fetchBookTitle,
  fetchBookCover,
};
