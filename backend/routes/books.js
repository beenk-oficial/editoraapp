const express = require('express');
const router = express.Router();
const bookStore = require('../store/books');

// GET /api/books - List all complete books
router.get('/', (req, res) => {
  const { genre, status } = req.query;
  let books = bookStore.getAll();

  if (genre) books = books.filter(b => b.genre === genre);
  if (status) books = books.filter(b => b.status === status);

  // Return summary (without full chapter content)
  const summaries = books.map(b => ({
    id: b.id,
    title: b.title,
    author: b.author,
    genre: b.genre,
    description: b.description,
    cover: b.cover,
    status: b.status,
    progress: b.progress,
    pages: b.pages,
    totalWords: b.totalWords,
    estimatedReadingTime: b.estimatedReadingTime,
    reviews: b.reviews,
    createdAt: b.createdAt,
    chapterCount: b.chapters?.length || 0,
  }));

  res.json({ books: summaries, total: summaries.length });
});

// GET /api/books/featured - Featured books
router.get('/featured', (req, res) => {
  const featured = bookStore.getFeatured();
  res.json({ books: featured.map(b => ({
    id: b.id,
    title: b.title,
    author: b.author,
    genre: b.genre,
    description: b.description,
    cover: b.cover,
    pages: b.pages,
    estimatedReadingTime: b.estimatedReadingTime,
    reviews: b.reviews?.slice(0, 1),
    createdAt: b.createdAt,
  })) });
});

// GET /api/books/:id - Get full book
router.get('/:id', (req, res) => {
  const book = bookStore.getById(req.params.id);
  if (!book) return res.status(404).json({ error: 'Livro não encontrado' });
  res.json({ book });
});

// GET /api/books/:id/chapter/:num - Get single chapter
router.get('/:id/chapter/:num', (req, res) => {
  const book = bookStore.getById(req.params.id);
  if (!book) return res.status(404).json({ error: 'Livro não encontrado' });

  const chapterNum = parseInt(req.params.num);
  const chapter = book.chapters?.find(c => c.number === chapterNum);
  if (!chapter) return res.status(404).json({ error: 'Capítulo não encontrado' });

  res.json({ chapter, bookTitle: book.title, author: book.author });
});

// DELETE /api/books/:id - Delete book
router.delete('/:id', (req, res) => {
  const book = bookStore.getById(req.params.id);
  if (!book) return res.status(404).json({ error: 'Livro não encontrado' });
  bookStore.remove(req.params.id);
  res.json({ success: true });
});

module.exports = router;
