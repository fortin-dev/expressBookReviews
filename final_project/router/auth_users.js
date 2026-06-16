const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  const userExists = users.filter((user) => user.username === username);
  if (userExists.length > 0) {
    return false;
  } else {
    return true;
  }
};

const authenticatedUser = (username, password) => {
  //returns boolean
  const validUsers = users.filter(
    (user) => user.username === username && user.password === password,
  );
  return validUsers.length > 0;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "usernaem and password required" });
  }
  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      {
        username: username,
      },
      "access",
      { expiresIn: 60 * 60 },
    );
    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).json({ message: "Customer successfully logged in" });
  } else {
    return res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const review_text = req.query.review;

  const username = req.user ? req.user.username : null;

  if (!username) {
    return res.status(403).json({ message: "User not authorized" });
  }

  if (!review_text) {
    return res
      .status(400)
      .json({ message: "Review content query is required" });
  }

  if (books[isbn]) {
    // Create the reviews object if it doesn't exist yet
    if (!books[isbn].reviews) {
      books[isbn].reviews = {};
    }

    books[isbn].reviews[username] = review_text;

    return res.status(200).json({
      message: "Review added/updated successfully",
      reviews: books[isbn].reviews,
    });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user ? req.user.username : null;

  if (!username) {
    return res.status(403).json({ message: "User not authorized" });
  }

  if (books[isbn]) {
    if (books[isbn].reviews && books[isbn].reviews[username]) {
      delete books[isbn].reviews[username];

      return res.status(200).json({
        message: `The review for the book with ISBN ${isbn} has been added/updated successfully.`,
        reviews: books[isbn].reviews,
      });
    } else {
      return res.status(404).json({
        message: `No review found for ISBN ${isbn} by user ${username}.`,
      });
    }
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
