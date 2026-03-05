require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8081', 'http://localhost:19006', '*'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Editora AI Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    apiKeyConfigured: !!process.env.ANTHROPIC_API_KEY,
  });
});

// Routes
app.use('/api/books', require('./routes/books'));
app.use('/api/generate', require('./routes/generate'));

// Genres list
app.get('/api/genres', (req, res) => {
  res.json({
    genres: [
      { id: 'fiction', name: 'Ficção Científica', emoji: '🚀' },
      { id: 'fantasy', name: 'Fantasia', emoji: '✨' },
      { id: 'romance', name: 'Romance', emoji: '💕' },
      { id: 'thriller', name: 'Thriller', emoji: '🔪' },
      { id: 'mystery', name: 'Mistério', emoji: '🔍' },
      { id: 'horror', name: 'Horror', emoji: '👁️' },
      { id: 'selfhelp', name: 'Autoajuda', emoji: '🌟' },
      { id: 'business', name: 'Negócios', emoji: '📈' },
      { id: 'history', name: 'História', emoji: '📜' },
      { id: 'adventure', name: 'Aventura', emoji: '⚔️' },
      { id: 'poetry', name: 'Poesia', emoji: '🌸' },
      { id: 'children', name: 'Infantil', emoji: '🦋' },
    ]
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Erro interno do servidor', message: err.message });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Editora AI Backend rodando na porta ${PORT}`);
  console.log(`📚 API: http://localhost:${PORT}/api`);
  console.log(`🔑 API Key: ${process.env.ANTHROPIC_API_KEY ? 'Configurada ✓' : 'AUSENTE - configure ANTHROPIC_API_KEY'}\n`);
});

module.exports = app;
