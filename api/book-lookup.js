// api/book-lookup.js
import express from 'express';
const router = express.Router();

// GET /api/book-lookup/:isbn
router.get('/:isbn', async (req, res) => {
  const { isbn } = req.params;
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;

  if (!apiKey) {
    console.error('Google Books API key is missing.');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  if (!isbn) {
    return res.status(400).json({ error: 'ISBN is required.' });
  }

  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Books API responded with ${response.status}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return res.status(404).json({ error: 'Book not found for that ISBN.' });
    }

    const book = data.items[0].volumeInfo;

    // --- START: MODIFICATION ---
    // Send back a clean, simple object with the new fields
    res.json({
      title: book.title,
      authors: book.authors || [], // authors is an array
      description: book.description,
      // Add the thumbnail image link (if it exists)
      imageLink: book.imageLinks?.thumbnail || null,
      // Add the Google Books preview link
      previewLink: book.previewLink || null,
    });
    // --- END: MODIFICATION ---
  } catch (error) {
    console.error('Error fetching book info:', error);
    res.status(500).json({ error: 'Failed to fetch book information.' });
  }
});

export default router;