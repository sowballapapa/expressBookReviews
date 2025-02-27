const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
  let userExist = users.filter((user) => user.username === username);
  if(userExist.length > 0){
    return false;
  }else {
    return true;
  }
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
  let validUsers = users.filter((user) => user.username === username && user.password === password);
  if(validUsers.length >0){
    return true;
  }else{
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if(!username || !password){
    return res.status(401).send("Username or password is required");
  }
  if(authenticatedUser(username,password)){
    let access_token = jwt.sign({
      data: password
    }, 'access', {expiresIn: 60*60});

    req.session.authorization = {
      access_token, username
    }
     res.status(200).json({"message": "User logged in successfully"});
  }else {
     res.status(401).json({message:'Invalid username or password.'});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn
  const review = req.body.review
  const username = req.session.authorization['username']
  if(books[isbn]){

      if (books[isbn]["reviews"]["username"] === username){
      books[isbn]["reviews"][username] = review

    }else {
      books[isbn]["reviews"] = {
        'username': username,
        'review': review
      }
    }
      res.status(200).json({"message": "Review added successfully!"});

  }else {
    res.status(404).json({message:'Book found.'});
  }

});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn
  const username = req.session.authorization['username'];

  if(books[isbn]){
    if (books[isbn]["reviews"]["username"] === username){
     delete books[isbn]["reviews"]["username"]
      res.status(200).json({"message": "Review deleted successfully"});
    }else{
      res.status(401).json({message:'Not able to delete this review.'});
    }
  }else {
    res.status(401).json({message:'Book found.'});
  }


})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
