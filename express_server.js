const express = require("express");
const app = express();
const PORT = process.env.port || 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(cookieParser());
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

const checkForEmail = email => {
  for (const userID in users) {
    const currentUser = users[userID];
    if (currentUser.email === email) {
      return { existsAlready: true, userID };
    }
  }
  return { existsAlready: false };
};

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

app.set("view engine", "ejs");

app.get("/urls/new", (req, res) => {
  const currUser_id = req.cookies["user_id"];

  let templateVars = {
    user: users[currUser_id]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const currUser_id = req.cookies["user_id"];

  let templateVars = {
    user: users[currUser_id],
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
  const currUser_id = req.cookies["user_id"];

  let templateVars = {
    user: users[currUser_id],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  const currUser_id = req.cookies["user_id"];

  const templateVars = {
    user: users[currUser_id],
    urls: urlDatabase
  };
  res.render("registration", templateVars);
});

app.get("/login", (req, res) => {
  const currUser_id = req.cookies["user_id"];

  const templateVars = {
    user: users[currUser_id],
    urls: urlDatabase
  };
  res.render("login", templateVars);
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

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    res.send("no email/password entered");
    console.log("email or password is falsey");
  }

  const Emailcheck = checkForEmail(email);

  if (Emailcheck.existsAlready) {
    res.status(400);
    res.send("email is already in use");
  }

  const id = generateRandomURL();
  users[id] = {
    id,
    email,
    password
  };

  res.cookie("user_id", id);

  //console.log(users);
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const Emailcheck = checkForEmail(email);

  if (!Emailcheck.existsAlready) {
    res.status(400);
    res.send("No account with that email. Please Register a new account!");
  }

  const currentUser = users[Emailcheck.userID];

  if (currentUser.password === password) {
    res.cookie("user_id", Emailcheck.userID);
    res.redirect("/urls");
  } else {
    res.status(400);
    res.send("Password incorrect.");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
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
