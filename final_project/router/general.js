const express = require('express');
let books = require("./booksdb.js");
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username)=>{
  let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }
}

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!doesExist(username)) { 
      users.push({"username" : username,"password" : password});
      return res.status(200).json({message: "SUCCESS: User successfully registered. Please login!"});
    } else {
      return res.status(404).json({message: "ERROR: User already exists!"});
    }
  } 
  return res.status(404).json({message: "ERROR: Unable to register."});
});

public_users.get('/',function (req, res) {
  res.send(JSON.stringify(books,null,4));
});

public_users.get('/async', async function (req, res) {
    try {
      const my_list = await getBookListAsync('https://##CENSOREDFORSUBMISSION##-5000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/');
      res.json(my_list);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "ERROR: Issue retrieving book list" });
    }
  });

public_users.get('/isbn/:isbn',function (req, res) {
  const ISBN = req.params.isbn;
  res.send(books[ISBN])
 });
  
public_users.get('/author/:author',function (req, res) {
  let ans = []
    for(const [key, values] of Object.entries(books)){
        const book = Object.entries(values);
        for(let i = 0; i < book.length ; i++){
            if(book[i][0] == 'author' && book[i][1] == req.params.author){
                ans.push(books[key]);
            }
        }
    }
    if(ans.length == 0){
        return res.status(300).json({message: "Author not found"});
    }
    res.send(ans);
});

public_users.get('/title/:title',function (req, res) {
  let ans = []
  for(const [key, values] of Object.entries(books)){
      const book = Object.entries(values);
      for(let i = 0; i < book.length ; i++){
          if(book[i][0] == 'title' && book[i][1] == req.params.title){
              ans.push(books[key]);
          }
      }
  }
  if(ans.length == 0){
      return res.status(300).json({message: "Title not found"});
  }
  res.send(ans);
});

public_users.get('/review/:isbn',function (req, res) {
  const ISBN = req.params.isbn;
  res.send(books[ISBN].reviews)
});

function getBookList(){
  return new Promise((resolve,reject)=>{
    resolve(books);
  })
}

public_users.get('/',function (req, res) {
  getBookList().then(
    (bk)=>res.send(JSON.stringify(bk, null, 4)),
    (error) => res.send("denied")
  );  
});

function isbn_get(isbn){
    let my_book = books[isbn]; 
    return new Promise((resolve,reject)=>{
        if (my_book) {
            resolve(my_book);
        }else{
            reject("Book cannot be found! Whoopsie! :(");
        } 
    })}  
    
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  isbn_get(isbn).then(
    (bk)=>res.send(JSON.stringify(bk, null, 4)),
    (error) => res.send(error)
  )
 });

function author_get(author){
  let output = [];
  return new Promise((resolve,reject)=>{
    for (var isbn in books) {
      let my_book = books[isbn];
      if (my_book.author === author){
        output.push(my_book);
      }
    }
    resolve(output);  
  })
}

public_users.get('/author/:author',function (req, res) {
  const my_author  = req.params.author;
  author_get(my_author)
  .then(
    result =>res.send(JSON.stringify(result, null, 4))
  );
});

function title_get(title){
  let output = [];
  return new Promise((resolve,reject)=>{
    for (var isbn in books) {
      let my_book = books[isbn];
      if (my_book.title === title){
        output.push(my_book);
      }
    }
    resolve(output);  
  })
}

public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  title_get(title)
  .then(
    result =>res.send(JSON.stringify(result, null, 4))
  );
});

module.exports.general = public_users;
