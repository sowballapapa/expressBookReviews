const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if(password && username){
    if(isValid(username)) {
      users.push({
        'username': username,
        'password': password
      })
      res.status(200).json({'message': 'User registered successfully!'});
    }else {
      res.status(400).json({"error":"Username already exists!"});
    }

  }else{
    res.status(400).json({"error":"Unable to register"});
  }




});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  // res.send(JSON.stringify(books, null, 2)).status(200)
  let getBooks = new Promise((resolve, reject) => {
    resolve(res.status(200).json(books));

  })

  getBooks.then(() => {
    console.log('Get books successfully');
  }).catch((err) => {
    console.log(err);
  })
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  let book = new Promise((resolve, reject) => {
    const isbn = req.params.isbn
    const bookDetails = books[isbn]
    if(bookDetails){
        resolve(res.status(200).json(bookDetails));
    }else{
      reject(res.status(404).json({'message':'There is no book for this isbn'}))
    }
  })

  book.then(()=>{
    console.log('Getting book by ISBN successfully');
  }).catch(() => {
    console.log("There is no book for this isbn");
  })

 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  let getBookByAuthor = new Promise((resolve, reject) => {
      const author = req.params.author
      let authorBooks = []
      Object.keys(books).forEach((key) => {
        if(books[key]['author'].toLowerCase() === author.toLowerCase()){
          authorBooks.push({
            "isbn":key,
            "title": books[key]["title"],
            "reviews": books[key]["reviews"]
          })
        }
      })
      if(authorBooks.length === 0){
        reject(res.json({'message':'No author found with this given author'}).status(404))
      }else {
        resolve(res.status(200).json({'message':'All books for the author '+author,'books':authorBooks}));
      }
  })

  getBookByAuthor.then(()=>{
    console.log('Get books by author successfully');
  }).catch(() => {
    console.log("There is no book for this author");
  })

});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  let book = new Promise((resolve, reject) => {
    const title = req.params.title
    let bookDetails = undefined;
    Object.keys(books).forEach((key) => {
      if(books[key]['title'].toLowerCase() === title.toLowerCase()){
        bookDetails = books[key]
        bookDetails.isbn = key
        bookDetails.title = books[key]['title']
        bookDetails.reviews = books[key]['reviews']
        bookDetails.author = books[key]['author']
      }
    })
    if(!bookDetails){
      reject(res.status(404).json({'message':'No book for this title'}))
    }else{
      resolve(res.status(200).json({'message': 'The book with this title', book: bookDetails}));
    }

    book.then(()=>{
      console.log('Get book by title successfully');
    }).catch(() => {
      console.log("There is no book for this title");
    })

  })




});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn
  let bookReviews = undefined;
  Object.keys(books).forEach((key) => {
    if(key === isbn){
      bookReviews = books[key]['reviews']
    }
  })
  if(!bookReviews){
    res.status(404).json({'message':'No book for this isbn'});
  }
  res.status(200).json({'message': 'The review for this book with the ISBN '+isbn, reviews: bookReviews});
});

module.exports.general = public_users;
