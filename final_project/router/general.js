const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  //Write your code here
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and passwrod are requied" });
  }
  if (isValid(username)) {
    users.push({
      username: username,
      password: password,
    });
    return res.status(200).json({
      message: `The user ${username} has been successfully registered!`,
    });
  } else {
    return res.status(400).json({ message: "Username already exists" });
  }
});

public_users.get("/", async function (req, res) {
  try {
    const getBooks = () => {
      return Promise.resolve(books);
    };
    const bookData = await getBooks();
    return res.status(200).send(JSON.stringify(bookData));
  } catch (error) {
    return res.status(500).json({ message: "Error laoding books" });
  }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const getisbn = () => {
      return new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) {
          resolve(book);
        } else {
          reject(new Error("Book not found"));
        }
      });
    };
    const bookData = await getisbn();
    return res.status(200).send(JSON.stringify(bookData));
  } catch (errro) {
    return res.status(404).json({ message: errro.message });
  }
});

// Get book details based on author
public_users.get("/author/:author", async function (req, res) {
  try {
    const author = req.params.author;
    const getBook = () => {
      return new Promise((resolve, reject) => {
        const bookList = Object.values(books);
        const filtered_books = bookList.filter(
          (book) => book.author === author,
        );

        if (filtered_books.length > 0) {
          resolve(filtered_books);
        } else {
          reject(new Error("No books found"));
        }
      });
    };
    const matchingBooks = await getBook();
    return res.status(200).send(JSON.stringify(matchingBooks));
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// Get all books based on title
public_users.get("/title/:title", async function (req, res) {
  try {
    const title = req.params.title;

    const getBooksByTitle = () => {
      return new Promise((resolve, reject) => {
        const bookList = Object.values(books);
        const filtered_books = bookList.filter((book) => book.title === title);

        if (filtered_books.length > 0) {
          resolve(filtered_books);
        } else {
          reject(new Error("No books found with this title"));
        }
      });
    };

    const matchingBooks = await getBooksByTitle();
    return res.status(200).send(JSON.stringify(matchingBooks));
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const review = books[isbn].review;
  res.send(JSON.stringify(review );
});

module.exports.general = public_users;
