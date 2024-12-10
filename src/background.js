'use strict';
// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages
// https://blog.jim-nielsen.com/2022/generating-epub-file-in-browser/

const imgRootPath = "https://learning.oreilly.com/";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'SAVE_BOOK_CONTENT') {
    const bookContent = request.payload;
    console.log('Received book content:', bookContent);

    // Return true to indicate that the response will be sent asynchronously
    return true;
  }
});


