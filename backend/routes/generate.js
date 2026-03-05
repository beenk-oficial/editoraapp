const express = require('express');
const router = express.Router();
const orchestrator = require('../agents/ContentOrchestrator');

// POST /api/generate - Start book generation with SSE streaming
router.post('/', async (req, res) => {
  const { genre, theme, targetAudience, language, numChapters } = req.body;

  if (!genre || !theme || !targetAudience) {
    return res.status(400).json({
      error: 'Campos obrigatórios: genre, theme, targetAudience'
    });
  }

  // Set up SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const send = (data) => {
    if (res.writableEnded) return;
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Heartbeat to keep connection alive
  const heartbeat = setInterval(() => {
    if (!res.writableEnded) {
      res.write(': heartbeat\n\n');
    }
  }, 15000);

  req.on('close', () => {
    clearInterval(heartbeat);
  });

  try {
    await orchestrator.generateBook(
      {
        genre,
        theme,
        targetAudience,
        language: language || 'Português',
        numChapters: Math.min(Math.max(parseInt(numChapters) || 8, 4), 15),
      },
      send
    );
  } catch (err) {
    send({ type: 'error', message: err.message });
  } finally {
    clearInterval(heartbeat);
    if (!res.writableEnded) {
      res.end();
    }
  }
});

// GET /api/generate/status/:bookId - Check generation status
router.get('/status/:bookId', (req, res) => {
  const bookStore = require('../store/books');
  const book = bookStore.getById(req.params.bookId);
  if (!book) return res.status(404).json({ error: 'Livro não encontrado' });

  res.json({
    bookId: book.id,
    status: book.status,
    progress: book.progress,
    title: book.title,
    chaptersWritten: book.chapters?.length || 0,
  });
});

module.exports = router;
