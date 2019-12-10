const express = require("express");
const app = express();
const PORT = process.env.port || 8080; // default port 8080
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));

const generateRandomURL = () => {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  let letterOrNumber;
  let newRandomURL = "";

  for (let i = 0; i < 6; i++) {
    letterOrNumber = Math.round(Math.random());
    if (letterOrNumber === 0) {
      newRandomURL += letters[Math.floor(Math.random() * 25)];
    } else {
      newRandomURL += numbers[Math.floor(Math.random() * 9)];
    }
  }
  return newRandomURL;
};

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.set("view engine", "ejs");

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const urlToDelete = req.params.shortURL;
  delete urlDatabase[urlToDelete];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  const urlToEdit = req.params.shortURL;
  const newLongURL = req.body.newLongURL;
  urlDatabase[urlToEdit] = newLongURL;
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  let newShortURL = generateRandomURL();
  urlDatabase[newShortURL] = req.body.longURL;

  console.log(urlDatabase);

  res.redirect(`/urls/${newShortURL}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
