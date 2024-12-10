import jsZip from 'jszip';
import { saveAs } from 'file-saver';
import {
  containerTemplate,
  contentTemplate,
  tocTemplate,
  chapterTemplate,
} from '../templates/index.js';
import { getUid, getImgExt, slugify } from '../utils.js';
import imgPlaceholder from '../assets/img-placeholder.jpg';
import overrideStyles from '../materials/css/overRide_v1.css';
import ePubStyles from '../materials/css/epub.css';

// Base URL for fetching images from O'Reilly's learning platform
const IMG_SOURCE = 'https://learning.oreilly.com/';

// Fetches an image from a URL and returns it as a blob
async function fetchImage(url) {
  try {
    const response = await fetch(url);
    return await response.blob();
  } catch (error) {
    console.error('Failed to fetch image:', error);
    return null;
  }
}

// Processes an image element by downloading it and updating its src attribute
async function processImage($img, src) {
  try {
    // Add random delay between 1-10 seconds to avoid overwhelming the server
    await new Promise((resolve) =>
      setTimeout(resolve, Math.floor(Math.random() * 9000) + 1000)
    );

    const imgBlob = await fetchImage(IMG_SOURCE + src);
    if (!imgBlob) throw new Error('Failed to fetch image');

    console.log('Fetched', src);

    // Generate unique ID and determine file extension
    const uid = getUid();
    const ext = getImgExt({ mimeType: imgBlob.type, fileUrl: src });
    const id = `${uid}.${ext}`;

    // Update image source to point to local file
    $img.setAttribute('src', `images/${id}`);
    return [id, imgBlob.type, imgBlob];
  } catch (error) {
    console.error(error);
    console.log('Failed to fetch (will use placeholder):', src);
    $img.setAttribute('src', 'images/img-placeholder.jpg');
    return null;
  }
}

// Parses chapter content, processes images, and cleans up HTML
async function parseChapterContent({ title, content }, index) {
  const $html = new DOMParser().parseFromString(
    `<div>${content}</div>`,
    'text/html'
  );

  // Remove srcset attributes as they're not needed in EPUB
  $html.querySelectorAll('img[srcset]').forEach($img => {
    $img.removeAttribute('srcset');
  });

  // Process all images in the chapter
  const images = await Promise.all(
    Array.from($html.querySelectorAll('img')).map(async ($img) => {
      const src = $img.getAttribute('src');
      return processImage($img, src);
    })
  ).then((imgs) => imgs.filter(Boolean));

  // Remove template and picture source elements that aren't needed
  Array.from($html.querySelectorAll('template, picture > source')).forEach($node => {
    $node.remove();
  });

  return {
    id: String(index).padStart(3, '0'),
    title: title || '[Untitled]',
    content: new XMLSerializer().serializeToString($html.querySelector('body > div')),
    images,
  };
}

// Processes the book cover image
async function processCover(cover) {
  if (!cover) return '';

  try {
    const coverBlob = await fetchImage(cover);
    if (!coverBlob) throw new Error('Failed to fetch cover');

    const ext = getImgExt({ mimeType: coverBlob.type, fileUrl: cover });
    const coverFile = `cover.${ext}`;

    return { coverFile, coverBlob };
  } catch (error) {
    console.error('Failed to fetch cover image:', error);
    return { coverFile: '', coverBlob: null };
  }
}

// Main function to build the EPUB file
export async function buildEpub({ title, chapters, author, cover }) {
  // Parse all chapter contents in parallel
  const parsedChapterContents = await Promise.all(
    chapters.map((chapter, index) => parseChapterContent(chapter, index))
  );

  const epub = {
    title: `${title} - ${author}`,
    chapters: parsedChapterContents,
  };

  // Create new ZIP file and add mimetype
  const zip = new jsZip();
  zip.file('mimetype', 'application/epub+zip');

  // Process and add cover if present
  const { coverFile, coverBlob } = await processCover(cover);
  if (coverBlob) {
    zip.file(`OEBPS/images/${coverFile}`, coverBlob);
  }

  // Add required EPUB templates and stylesheets
  zip.file('META-INF/container.xml', containerTemplate());
  zip.file('OEBPS/content.opf', contentTemplate(epub, author, "O'Reilly", coverFile));
  zip.file('OEBPS/toc.xhtml', tocTemplate(epub));
  zip.file('OEBPS/override_v1.css', overrideStyles);
  zip.file('OEBPS/epub.css', ePubStyles);

  // Add chapters and their associated images
  epub.chapters.forEach((chapter) => {
    zip.file(`OEBPS/${chapter.id}.xhtml`, chapterTemplate(chapter));
    chapter.images.forEach(([id, , blob]) => {
      zip.file(`OEBPS/images/${id}`, blob);
    });
  });

  // Add placeholder image for failed image downloads
  zip.file('OEBPS/images/img-placeholder.jpg', imgPlaceholder);

  // Generate final EPUB file as blob
  const content = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/epub+zip'
  });

  // Save the EPUB file with a sanitized filename
  saveAs(content, `${slugify(epub.title)}.epub`);
}
