const express = require("express");
const fs = require("fs");
const app = express();
const PORT = 3000;

// Middleware to parse JSON body
app.use(express.json());

// Load books from JSON file or start with default
let books = [];
const dataFile = "books.json";

function loadBooks() {
  if (fs.existsSync(dataFile)) {
    const data = fs.readFileSync(dataFile);
    books = JSON.parse(data);
  } else {
    books = [
      { id: 1, title: "The Alchemist", author: "Paulo Coelho" },
      { id: 2, title: "Atomic Habits", author: "James Clear" }
    ];
    saveBooks();
  }
}

function saveBooks() {
  fs.writeFileSync(dataFile, JSON.stringify(books, null, 2));
}

// Load books when server starts
loadBooks();

// --- Root route ---
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the Book API!",
    books: books
  });
});

// --- GET all books ---
app.get("/books", (req, res) => {
  res.json(books);
});

// --- GET book by ID ---
app.get("/books/:id", (req, res) => {
  const book = books.find(b => b.id === parseInt(req.params.id));
  if (!book) return res.status(404).json({ message: "Book not found" });
  res.json(book);
});

// --- POST add new book ---
app.post("/books", (req, res) => {
  const { title, author } = req.body;
  if (!title || !author) {
    return res.status(400).json({ message: "Title and Author are required" });
  }
  const newBook = {
    id: books.length ? books[books.length - 1].id + 1 : 1,
    title,
    author
  };
  books.push(newBook);
  saveBooks();
  res.status(201).json(newBook);
});

// --- PUT update book by ID ---
app.put("/books/:id", (req, res) => {
  const { title, author } = req.body;
  const book = books.find(b => b.id === parseInt(req.params.id));

  if (!book) return res.status(404).json({ message: "Book not found" });

  if (title) book.title = title;
  if (author) book.author = author;

  saveBooks();
  res.json(book);
});

// --- DELETE book by ID ---
app.delete("/books/:id", (req, res) => {
  const bookIndex = books.findIndex(b => b.id === parseInt(req.params.id));
  if (bookIndex === -1) return res.status(404).json({ message: "Book not found" });

  const deletedBook = books.splice(bookIndex, 1);
  saveBooks();
  res.json({ message: "Book deleted", book: deletedBook[0] });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
