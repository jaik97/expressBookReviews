const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  // return res.status(300).json({message: "Yet to be implemented"});
  const username = req.body.username;
  const password = req.body.password;

  if(username && password){
      if(!isValid(username)){
          users.push({"username":username, "password":password});
          return res.status(200).json({message: "User successfully registered. Now you can login"});
      } else{
          return res.status(404).json({message: "User already exists!"});
      }
  }
  return res.status(404).json({message: "Unable to register user."});
});


// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  // return res.status(300).json({message: "Yet to be implemented"});
  res.send(JSON.stringify({books}, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const isbn = parseInt(req.params.isbn);
  if(!isbn){
    return res.status(400).json({error: "Valid ISBN parameter is required"});
  }
  const book = books[isbn];
  res.json(book);
  
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  const author = req.params.author;
  if(!author){
    return res.status(400).json({error: "Author parameter is required"});
  }
  const authorBooks = Object.values(books).filter(book=>book.author===author)
  if(authorBooks.length ===0){
    return res.status(404).json({message: "No books found for the given author"});
  }
  res.json(authorBooks);
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const title = req.params.title;
  if(!title){
    return res.status(400).json({error: "Title parameter is required"});
  }
  let booksObj = Object.values(books).filter(book=> book.title === title);
  if(booksObj.length === 0){
    return res.status(404).json({message: "No books found for the given title"});
  }
  res.json(booksObj);
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = parseInt(req.params.isbn);
  if(!isbn){
    return res.status(400).json({error: "ISBN parameter is required"});
  }
  const reviews = books[isbn].reviews;
  if(reviews.length===0){
    return res.status(404).json({message: "No reviews found for the given ISBN"});
  }
  res.json(reviews);
});

module.exports.general = public_users;
