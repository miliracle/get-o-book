/**
 * UI Helper Functions for managing the book downloader interface
 */

/**
 * Displays a loading indicator while fetching the table of contents
 * @param {HTMLElement} container - The container element to show the loading state in
 */
export function displayLoading(container) {
  container.innerHTML = '<div class="loading">Loading table of contents...</div>';
}

/**
 * Displays an error message when something goes wrong
 * @param {HTMLElement} container - The container element to show the error in
 * @param {string} message - The error message to display
 */
export function displayError(container, message) {
  container.innerHTML = `<div class="error">${message}</div>`;
}

/**
 * Renders the table of contents with chapter links and status indicators
 * @param {HTMLElement} container - The container element to render the TOC in
 * @param {Array<{title: string, url: string}>} chapters - Array of chapter objects
 */
export function displayTableOfContents(container, chapters) {
  // Show message if no chapters found
  if (!chapters || chapters.length === 0) {
    container.innerHTML = '<div class="no-content">No table of contents found</div>';
    return;
  }

  // Create main TOC list container
  const tocList = document.createElement('ul');
  tocList.className = 'toc-list';

  // Create list items for each chapter
  chapters.forEach(chapter => {
    // Create list item
    const li = document.createElement('li');
    li.className = 'toc-item';

    // Create chapter link
    const link = document.createElement('a');
    link.className = 'toc-link';
    link.href = chapter.url;
    link.textContent = chapter.title;
    link.target = '_blank'; // Open chapters in new tab

    // Create status indicator
    const status = document.createElement('span');
    status.className = 'status';
    status.textContent = 'Fetching...';

    // Assemble the elements
    li.appendChild(link);
    li.appendChild(status);
    tocList.appendChild(li);
  });

  // Clear container and add TOC
  container.innerHTML = '';
  container.appendChild(tocList);
}

/**
 * Updates the status indicator for a chapter after fetch attempt
 * @param {number} index - The index of the chapter in the TOC
 * @param {boolean} success - Whether the chapter fetch was successful
 */
export function updateChapterStatus(index, success) {
  // Small delay to ensure DOM is ready
  setTimeout(() => {
    const tocItems = document.querySelectorAll('.toc-item');
    if (tocItems.length > index) {
      tocItems[index].querySelector('.status').textContent = success ? 'Fetched' : 'Failed';
    }
  }, 100);
}
