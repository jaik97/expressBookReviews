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
    } else{
      return false;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
  let validuser = users.filter((user)=> {
    return(user.username === username && user.password === password);
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
  
});

// Add a book review

// regd_users.put("/auth/review/:isbn", async (req, res) => {
//   try {
//     const user = req.user;
//     const isbn = req.params.isbn;
//     const review = req.body.reviews;

//     // Check if review exists in request body
//     if (!review) {
//       return res.status(400).json({ error: 'Review is required' });
//     }

//     const addReview = new Promise((resolve, reject) => {
//       try {
//         const bookExists = books[isbn];
//         if (bookExists) {
//           books[isbn].reviews[user] = review;
//           return resolve(true);
//         } else {
//           return resolve(false);
//         }
//       } catch (error) {
//         return reject(`Adding book review error: ${error}`);
//       }
//     });

//     const book = await addReview;
//     if (book) {
//       return res.status(200).json({ message: 'Your review has been added successfully', books });
//     } else {
//       return res.status(404).json({ message: 'Book not found' });
//     }
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// });
regd_users.put("/auth/review/:isbn", async (req, res) => {
  try {
    // const user = req.session.username; // Retrieving username from session
    // const isbn = req.params.isbn;
    // const review = req.query.review; // Retrieving review from request query

    const user = req.user;
    const isbn = req.params.isbn;
    const review = req.body.reviews;

    // Check if review exists in request query
    if (!review) {
      return res.status(400).json({ error: 'Review is required' });
    }

    const addReview = new Promise((resolve, reject) => {
      try {
        const bookExists = books[isbn];
        if (bookExists) {
          // Check if the user has already posted a review for this ISBN
          if (books[isbn].reviews.hasOwnProperty(user)) {
            // If the same user posts a different review, modify the existing review
            books[isbn].reviews[user] = review;
            return resolve('modified');
          } else {
            // If another user posts a review on the same ISBN, add it as a different review
            books[isbn].reviews[user] = review;
            return resolve('added');
          }
        } else {
          return resolve('notfound');
        }
      } catch (error) {
        return reject(`Adding book review error: ${error}`);
      }
    });

    const action = await addReview;
    if (action === 'modified') {
      return res.status(200).json({ message: 'Your review has been modified successfully', books });
    } else if (action === 'added') {
      return res.status(200).json({ message: 'Your review has been added successfully', message2: `${user}`, books });
    } else {
      return res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});


//delete reviews
regd_users.delete("/auth/review/:isbn", async(req, res) => {
  
  const user = req.user;
  const isbn = req.params.isbn
  const addReview = new Promise((resolve, reject) => {
      try {
          //search if review exist or not
          const searchReview = books[isbn].reviews[user];
          if (searchReview) {
              delete books[isbn].reviews[user];
              return resolve(true)
          } else {
              return resolve(false);
          }

      } catch (error) {
          return reject(`deleting books reviews error ${error}`);

      }
  })
  const book = await addReview;
  if (book) {
      return res.status(200).json({ message: 'your review has been deleted' });
  } else {
      return res.status(404).json({ message: 'your review was not present there' });
  }

});


//modify a user review
regd_users.patch("/auth/review/:isbn", async(req, res) => {
  
  const user = req.user;
  const isbn = req.params.isbn
  const modifyReview = new Promise((resolve, reject) => {
      try {
          const bookExists = books[isbn];
          if (bookExists && books[isbn].reviews[user]) {
              books[isbn].reviews[user] = req.body.review;
              return resolve(true);
          } else {
              return resolve(false);
          }

      } catch (error) {
          return reject(`modifying  books reviews  error ${error}`);

      }
  })
  const book = await modifyReview;
  if (book) {
      return res.status(200).json({ message: 'Your review has been modified successfully', books });
  } else {
      return res.status(404).json({ message: 'Reviews not found' });
  }

});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
