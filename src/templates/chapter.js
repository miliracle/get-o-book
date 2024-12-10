export default function chapterTemplate(chapter) {
  const { title, content } = chapter;
  return `<?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE html>
    <html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en">
      <head>
      <meta charset="UTF-8" />
      <title>${title}</title>
      <link rel="stylesheet" type="text/css" href="override_v1.css" />
      <link rel="stylesheet" type="text/css" href="epub.css" />
      </head>
    <body>
      <h1>${title}</h1>
      ${content}
    </body>
    </html>
  `;
}
