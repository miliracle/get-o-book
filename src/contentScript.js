/* eslint-disable no-undef */
'use strict';

import {
  findTableOfContents,
  fetchChapterContent,
  fetchBookAuthor,
  fetchBookTitle,
  fetchBookCover,
} from './helpers/fetch';

// Content script file will run in the context of web page.
// With content script you can manipulate the web pages using
// Document Object Model (DOM).
// You can also pass information to the parent extension.

// We execute this script by making an entry in manifest.json file
// under `content_scripts` property

// For more information on Content Scripts,
// See https://developer.chrome.com/extensions/content_scripts

// Log `title` of current active web page
const pageTitle = document.head.getElementsByTagName('title')[0].innerHTML;
console.log(
  `Page title is: '${pageTitle}' - evaluated by Chrome extension's 'contentScript.js' file`
);

// Prevent multiple injections
if (!window.hasRun) {
  window.hasRun = true;

  // Log that content script is loaded
  console.log('Content script loaded and ready to receive messages');

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Content script received message:', request);

    if (request.type === 'FETCH_BOOK_INFO') {
      try {
        console.log("Fetching book's info...");
        const author = fetchBookAuthor();
        const title = fetchBookTitle();
        const cover = fetchBookCover();
        const chapters = findTableOfContents();
        console.log('Found chapters:', chapters);
        sendResponse({
          success: true,
          data: {
            author,
            title,
            cover,
            chapters,
          },
        });
      } catch (error) {
        console.error('Error in content script:', error);
        sendResponse({
          success: false,
          message: error.message,
        });
      }
      return true; // Keep the message channel open for async response
    }

    if (request.type === 'FETCH_CHAPTER_CONTENT') {
      fetchChapterContent({
        title: request.chapterTitle,
        url: request.chapterUrl,
      })
        .then((chapterContent) => {
          console.log('Chapter content fetched:', request.chapterTitle);
          sendResponse({
            success: true,
            data: chapterContent,
          });
        })
        .catch((error) => {
          console.error('Error in content script:', error);
          sendResponse({
            success: false,
            message: error.message,
          });
        });
      return true; // Keep the message channel open for async response
    }
  });
}
