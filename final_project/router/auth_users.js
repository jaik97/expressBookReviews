const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
let validUsername = users.filter((user)=>{
  return user.username === username
});
  if(validUsername.length>0){
    return true;
  }else{
    return false;
  }
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
  let validuser = users.filter((user)=> {
    return(user.username === username && user.password === password)
  });
  if(validuser.length>0){
    return true;
  } else{
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if(!username || !password){
    return res.status(404).json({message: "Error logging in"});
  }

  if(authenticatedUser(username, password)){
    let accessToken = jwt.sign({
      data: password
    }, 'access', {expiresIn: 60*60});

    req.session.authorization = {
      accessToken,username
    }
    return res.status(200).send("User successfully logged in");
  } else{
    return res.status(200).json({message: "Invalid Login. Check username and password"});
  }
  // return res.status(300).json({message: "Yet to be implemented"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const user = req.session.username;
  
  const isbn = parseInt(req.params.isbn);
  if(!isbn){
    return res.status(400).json({error: "ISBN parameter is required"});
  }
  
  const review = req.body.review;
  if (!review) {
    return res.status(400).json({ error: 'Review parameter is required.' });
  }
  
  //accessing the books database to get the book having the isbn provided in the parameter
  let book = books[isbn];
  if (!book) {
    return res.status(404).json({ error: 'Book not found.' });
  }

  // Check if the user has already reviewed this book
  if (book.reviews[username]) {
    // If the user has already reviewed the book, modify the existing review
    book.reviews[username] = review;
    return res.json({ message: 'Review updated successfully.' });
  } else {
    // If the user has not reviewed the book, add a new review
    book.reviews[username] = review;
    return res.json({ message: 'Review added successfully.' });
  }
});

//deleting a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = parseInt(req.params.isbn);
  const username = req.session.username;

  if (!username) {
    return res.status(401).json({ error: 'Unauthorized. Please login to delete a review.' });
  }

  // Check if the book exists
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ error: 'Book not found.' });
  }

  // Check if the user has reviewed the book
  if (!book.reviews[username]) {
    return res.status(404).json({ error: 'Review not found for the given book and user.' });
  }

  // Filter out the review associated with the current user's session
  book.reviews = Object.fromEntries(Object.entries(book.reviews).filter(([key, value]) => key !== username));

  return res.json({ message: 'Review deleted successfully.' });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
