const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", async(req,res)=>{
  //Write your code here
  // return res.status(300).json({message: "Yet to be implemented"});
  const username = req.body.username;
  const password = req.body.password;

  if(username && password){
      if(!isValid(username)){ //if username does not exist
        const addUser = new Promise((resolve, reject)=>{
          try{
            const user = {
              username,
              password
            }
            users.push(user);
            return resolve(users);
          } catch(error){
            return reject(`adding user error:${error}`);
          }
        })
        const updatedUsers = await addUser;
        return res.status(200).json({message: "the user has been registered successfully"});
      } else{
          return res.status(404).json({message: "User already exists!"});
      }
  }
});


// Get the book list available in the shop
public_users.get('/', async(req, res)=> {
  //Write your code here
  // res.send(JSON.stringify({books}, null, 4));
  const getBooks = new Promise((resolve, reject)=>{
    try{
      //return list of all books
      return resolve(books);
    } catch(error){
      return reject(`getting books list error: ${error}`);
    }
  })
  const foundBooks = await getBooks;
  if(Object.keys(books).length>0){ //if books exist
    return res.status(200).json({message: "Below is the list of Books available:", books: foundBooks});
  } else{
    return res.status(404).json({message: "Books not found in the list"});
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async(req, res)=> {
  //Write your code here
  const isbn = parseInt(req.params.isbn);
  if(!isbn){
    return res.status(400).json({error: "A valid ISBN parameter is required"});
  }

  const searchByISBN = new Promise((resolve,reject)=>{
    try{
        const book = books[isbn];
        return resolve(book);
      } catch(error){
      return reject(`Searching by ISBN unsucessful. Error: ${error}`);
    }
  })
  const book = await searchByISBN;
  if(book){
    return res.status(200).json({book});
  } else{
    return res.status(404).json({message: "Book not found!"});
  }
});
  
// Get book details based on author
public_users.get('/author/:author', async(req, res)=> {
  //Write your code here
  const author = req.params.author;
  if(!author){
    return res.status(400).json({error: "Author parameter is required"});
  }
  const searchByAuthor = new Promise((resolve,reject)=>{
    try{
      const authorBooks = Object.values(books).filter(book=>{
        return book.author===author;
      })
      return resolve(authorBooks);
    } catch(error){
      return reject(`Searching by Author Name unsucessful. Error: ${error}`);
    }
  })
  const book = await searchByAuthor;
  if(book.length>0){
    return res.status(200).json({book});
  } else{
    return res.status(404).json({message: "Book not found!"});
  }
});

// Get all books based on title
public_users.get('/title/:title', async(req, res)=>{
  //Write your code here
  const title = req.params.title;
  if(!title){
    return res.status(400).json({error: "Title parameter is required"});
  }
  const searchByTitle = new Promise((resolve,reject)=>{
    try{
      const titleBooks = Object.values(books).filter(book=>{
        return book.title === title;
      })
      return resolve(titleBooks);
    } catch(error){
      return reject(`Searching by Title unsucessful!`);
    }
  })
  const book = await searchByTitle;
  if(book){
    return res.status(200).json({book});
  } else{
    return res.status(404).json({message: "Book not found!"});
  }
});

//  Get book review

// public_users.get('/review/:isbn', function (req, res) {
  
//   const isbn = parseInt(req.params.isbn);
//   // res.send(books);

//   // if(!isbn){
//   //   return res.status(400).json({message: "ISBN parameter is required"});
//   // }
//   const reviews = books[isbn].reviews;
//   if(reviews.length===0){
//     return res.status(404).json({message: "No reviews found for the given ISBN"});
//   }
//   res.send(reviews);
// });

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
