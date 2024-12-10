'use strict';

import './popup.css';
import {
  displayLoading,
  displayError,
  displayTableOfContents,
  updateChapterStatus,
} from './helpers/ui';
import { buildEpub } from './helpers/epubBuilder';

class BookDownloader {
  constructor() {
    this.downloadBtn = document.getElementById('downloadBtn');
    this.resultsContainer = document.getElementById('results');
    this.statusContainer = document.getElementById('status');
    this.initialize();
  }

  initialize() {
    this.downloadBtn.addEventListener('click', () => this.handleDownload());
    document.addEventListener('DOMContentLoaded', () => this.initialize());
  }

  updateStatus(message, className) {
    this.statusContainer.textContent = message;
    this.statusContainer.className = `status-container ${className}`;
  }

  async injectContentScript(tabId) {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['contentScript.js'],
    });
  }

  async fetchBookInfo(tabId) {
    console.log('Sending message to content script...');
    return await chrome.tabs.sendMessage(tabId, {
      type: 'FETCH_BOOK_INFO',
    });
  }

  async fetchChapterContent(tabId, chapterTitle, chapterUrl) {
    const response = await chrome.tabs.sendMessage(tabId, {
      type: 'FETCH_CHAPTER_CONTENT',
      chapterTitle,
      chapterUrl,
    });
    console.log('Response received:', response);
    return response;
  }

  async saveBookContent(bookContent) {
    console.log('Saving book content');
    this.updateStatus('Building EPUB...', 'status-message');

    try {
      await buildEpub(bookContent);
      this.updateStatus('EPUB built successfully!', 'status-success');
    } catch (error) {
      console.error('Failed to build EPUB:', error);
      this.updateStatus('Failed to build EPUB.', 'status-error');
    }
  }

  async fetchChapters(tabId, chapters) {
    const bookChapters = [];

    for (let i = 0; i < chapters.length; i++) {
      const chapter = chapters[i];
      // Add random delay between 1-10 seconds
      await new Promise(resolve =>
        setTimeout(resolve, Math.floor(Math.random() * 9000) + 1000)
      );

      const chapterContent = await this.fetchChapterContent(
        tabId,
        chapter.title,
        chapter.url
      );

      console.log('Chapter content:', chapterContent.data);
      bookChapters.push({
        title: chapter.title,
        content: chapterContent.data,
      });

      updateChapterStatus(i, chapterContent.success);
    }

    return bookChapters;
  }

  async handleDownload() {
    try {
      displayLoading(this.resultsContainer);

      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab) {
        throw new Error('No active tab found');
      }

      await this.injectContentScript(tab.id);
      const response = await this.fetchBookInfo(tab.id);

      if (response?.success) {
        console.log('Book info:', response.data);
        const { title, author, cover, chapters } = response.data;
        displayTableOfContents(this.resultsContainer, chapters);

        const bookChapters = await this.fetchChapters(tab.id, chapters);

        await this.saveBookContent({
          title,
          author,
          cover,
          chapters: bookChapters,
        });
      } else {
        console.log('Failed to fetch table of contents:', response?.message);
        displayError(this.resultsContainer, 'Failed to fetch table of contents');
      }
    } catch (error) {
      console.error('Error:', error);
      displayError(
        this.resultsContainer,
        'An error occurred while fetching book contents'
      );
    }
  }
}

// Initialize the downloader
new BookDownloader();
