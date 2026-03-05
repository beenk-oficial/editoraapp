const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const STORE_FILE = path.join(__dirname, 'books_data.json');

let books = [];

// Load persisted data on startup
try {
  if (fs.existsSync(STORE_FILE)) {
    books = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
  }
} catch (e) {
  books = [];
}

function persist() {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(books, null, 2));
  } catch (e) {
    console.error('Failed to persist books:', e.message);
  }
}

function getAll() {
  return books;
}

function getById(id) {
  return books.find(b => b.id === id) || null;
}

function create(data) {
  const book = {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'generating',
    ...data,
  };
  books.push(book);
  persist();
  return book;
}

function update(id, data) {
  const idx = books.findIndex(b => b.id === id);
  if (idx === -1) return null;
  books[idx] = { ...books[idx], ...data, updatedAt: new Date().toISOString() };
  persist();
  return books[idx];
}

function remove(id) {
  books = books.filter(b => b.id !== id);
  persist();
}

function getFeatured() {
  return books.filter(b => b.status === 'complete').slice(0, 8);
}

function getByGenre(genre) {
  return books.filter(b => b.genre === genre && b.status === 'complete');
}

module.exports = { getAll, getById, create, update, remove, getFeatured, getByGenre };
