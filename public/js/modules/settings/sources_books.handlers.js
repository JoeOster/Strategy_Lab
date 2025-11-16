// public/js/modules/settings/sources_books.handlers.js
import { api } from '../../services/apiFetch.js';
// --- START: ADD THIS IMPORT ---
import { updateImagePreview } from './sources.handlers.js';
// --- END: ADD THIS IMPORT ---

/**
 * Fetches book info from the server-side proxy.
 */
export async function handleFetchIsbnInfo() {
  const isbnInput = /** @type {HTMLInputElement} */ (
    document.getElementById('source-form-book-isbn')
  );
  const titleInput = /** @type {HTMLInputElement} */ (
    document.getElementById('source-form-name')
  );
  const authorInput = /** @type {HTMLInputElement} */ (
    document.getElementById('source-form-book-author')
  );
  const descInput = /** @type {HTMLTextAreaElement} */ (
    document.getElementById('source-form-description')
  );
  const fetchBtn = /** @type {HTMLButtonElement} */ (
    document.getElementById('fetch-isbn-btn')
  );
  // --- START: ADD NEW ELEMENTS ---
  const imageInput = /** @type {HTMLInputElement} */ (
    document.getElementById('source-form-image-path')
  );
  const urlInput = /** @type {HTMLInputElement} */ (
    document.getElementById('source-form-url')
  );
  // --- END: ADD NEW ELEMENTS ---

  if (!isbnInput.value) {
    alert('Please enter an ISBN to fetch.');
    return;
  }

  const originalBtnText = fetchBtn.textContent;
  fetchBtn.textContent = 'Fetching...';
  fetchBtn.disabled = true;

  try {
    const bookInfo = await api.get(`/api/book-lookup/${isbnInput.value}`);

    // Populate the fields
    if (bookInfo.title) {
      titleInput.value = bookInfo.title;
    }
    if (bookInfo.authors && bookInfo.authors.length > 0) {
      authorInput.value = bookInfo.authors.join(', '); // Join if multiple authors
    }
    if (bookInfo.description) {
      descInput.value = bookInfo.description;
    }

    // --- START: POPULATE NEW FIELDS ---
    if (bookInfo.imageLink) {
      imageInput.value = bookInfo.imageLink;
      // Trigger the preview update
      updateImagePreview('book', bookInfo.imageLink);
    }
    if (bookInfo.previewLink) {
      urlInput.value = bookInfo.previewLink;
    }
    // --- END: POPULATE NEW FIELDS ---

  } catch (error) {
    console.error('Failed to fetch book info:', error);
    alert('Failed to fetch book info. Check the ISBN or try again.');
  } finally {
    // Restore button
    fetchBtn.textContent = originalBtnText;
    fetchBtn.disabled = false;
  }
}