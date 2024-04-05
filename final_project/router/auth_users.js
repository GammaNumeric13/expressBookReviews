const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{"username":"gammanumeric13","password":"secure_password123"}];

const isValid = (username)=>{
    const match_user = users.filter((user) => user.username === username);
    return my_book .length > 0;
}

const authenticatedUser = (username,password)=>{
  const matchingUsers = users.filter((user) => user.username === username && user.password === password);
  return matchingUsers.length > 0;
}

regd_users.post("/login", (req,res) => {
  console.log("login: ", req.body);
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
    return res.status(404).json({message: "ERROR: logging in failed!"});
  }
  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });
    req.session.authorization = {
            accessToken,username
        }
        return res.status(200).send("SUCCESS: User successfully logged in");
    } else {
        return res.status(208).json({message: "ERROR: Invalid Login. Check your given username and password"});
    }
});

regd_users.put("/auth/review/:isbn", (req, res) => {
    const username = req.session.username;
    const isbn = req.params.isbn;
    const review = req.query.review;
    console.log(username);
    if (!review) {
      return res.status(400).json({message: "ERROR: Please provide a review"});
    }
    if (!books[isbn]) {
      return res.status(404).json({message: "ERROR: Book not found"});
    }
    if (!books[isbn].reviews) {
      books[isbn].reviews = {};
    }
    if (books[isbn].reviews[username]) {
      books[isbn].reviews[username] = review;
      return res.json({message: "SUCCESS: Your review was modified successfully"});
    }
    books[isbn].reviews[username] = review;
    return res.json({message: "SUCCESS: Your review added successfully"});
  });
  
  regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.username;
    console.log(isbn);
    if (!username) {
      return res.status(401).json({message: "ERROR: Unauthorized"});
    }
    if (!isValid(username)) {
      return res.status(401).json({message: "ERROR: Invalid username"});
    }
    if (!books[isbn]) {
      return res.status(400).json({message: "ERROR: Invalid ISBN"});
    }
  
    if (!books[isbn].reviews[username]) {
      return res.status(400).json({message: "ERROR: Review not found for the given ISBN and username"});
    }
    delete books[isbn].reviews[username];
    return res.status(200).json({message: "SUCCESS: Review was deleted!"});
  });

  regd_users.delete("/login", (req, res) => {
    const username = req.session.authorization.username;
    if (!username) {
      return res.status(401).json({message: "ERROR: Unauthorized"});
    }
  
    const userIndex = users.findIndex(user => user.username === username);
    if (userIndex === -1) {
      return res.status(400).json({message: "ERROR: User not found"});
    }

    users.splice(userIndex, 1);
    return res.status(200).json({message: "SUCCESS: User deleted"});
});
  
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
