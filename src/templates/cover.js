export default function coverTemplate(bookCover) {
  return `
    <div style="text-align: center; margin-top: 50px;">
      <img src="${bookCover}" alt="Book Cover" style="max-width: 100%; height: auto;">
    </div>
  `;
}

