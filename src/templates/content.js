import { escapeXml } from "../utils.js";

export default function contentTemplate(epub, author, publisher, cover) {
  const { description, title, chapters } = epub;
  const modified = new Date().toISOString().split(".")[0] + "Z";

  return `<?xml version="1.0" encoding="UTF-8"?>
<package
  xmlns="http://www.idpf.org/2007/opf"
  xmlns:opf="http://www.idpf.org/2007/opf"
  version="3.0"
  unique-identifier="BookId"
  >
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    ${/* @TODO figure out the ID stuff */ ""}
    <dc:identifier id="BookId">${Date.now()}</dc:identifier>
      <meta refines="#BookId" property="identifier-type" scheme="onix:codelist5">22</meta>
      <meta property="dcterms:identifier" id="meta-identifier">BookId</meta>

    <dc:title>${escapeXml(title)}</dc:title>
    <dc:language>en</dc:language>
    ${
      description
        ? `<dc:description>${escapeXml(description)}</dc:description>`
        : ""
    }
    <dc:creator id="creator">${author}</dc:creator>
    <dc:publisher>${publisher}</dc:publisher>

    <meta name="generator" content="readlists.jim-nielsen.com" />
    <meta property="dcterms:modified">${modified}</meta>
    ${cover ? `<meta name="cover" content="cover-image"/>` : ''}
  </metadata>

    <manifest>
      <item id="toc" href="toc.xhtml" media-type="application/xhtml+xml" properties="nav" />
      <item id="chapter-image-placeholder" href="images/img-placeholder.jpg" media-type="image/jpeg" />
      ${cover ? `<item id="cover-image" href="images/${cover}" media-type="image/jpeg" properties="cover-image"/>` : ''}

      ${chapters
        .map(
          (chapter) =>
            `<item
              id="chapter-${chapter.id}"
              href="${chapter.id}.xhtml"
              media-type="application/xhtml+xml"
            />` +
            chapter.images
              .map(
                ([id, mimeType]) =>
                  `<item id="chapter-image-${id}" href="images/${id}" media-type="${mimeType}" />`
              )
              .join("\n")
        )
        .join("\n")}
    </manifest>
    <spine>
      <itemref idref="toc"/>
      ${chapters
        .map((chapter) => `<itemref idref="chapter-${chapter.id}" />`)
        .join("\n")}
    </spine>
    <guide>
      <reference title="Table of content" type="toc" href="toc.xhtml"/>
      ${cover ? `<reference type="cover" title="Cover" href="cover.xhtml"/>` : ''}
    </guide>
</package>
  `;
}
