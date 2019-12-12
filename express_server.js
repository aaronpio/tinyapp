const express = require("express");
const app = express();
const PORT = process.env.port || 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");

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

const urlsForUser = currentUserID => {
  let currentUserURLs = {};
  for (const urlID in urlDatabase) {
    if (urlDatabase[urlID].userID === currentUserID) {
      currentUserURLs[urlID] = urlDatabase[urlID].longURL;
    }
  }
  return currentUserURLs;
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

const users = {};

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
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const currlongURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(currlongURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const currUser_id = req.cookies["user_id"];

  const currentUsersURLs = urlsForUser(currUser_id);

  let templateVars = {
    user: users[currUser_id],
    urls: currentUsersURLs
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
  const currUser_id = req.cookies["user_id"];

  const urlToDelete = req.params.shortURL;

  if (currUser_id === urlDatabase[urlToDelete].userID) {
    delete urlDatabase[urlToDelete];
    res.redirect("/urls");
  }
  res.send("Can't delete if not logged into user.");
});

app.post("/urls/:shortURL", (req, res) => {
  const currUser_id = req.cookies["user_id"];

  const urlToEdit = req.params.shortURL;
  const newLongURL = req.body.newLongURL;

  if (currUser_id === urlDatabase[urlToEdit].userID) {
    urlDatabase[urlToEdit].longURL = newLongURL;
    res.redirect("/urls");
  }
  res.send("Can't edit if not logged into user.");
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

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
    password: hashedPassword
  };

  res.cookie("user_id", id);

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

  if (bcrypt.compareSync(password, currentUser.password)) {
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
  const currUser_id = req.cookies["user_id"];

  let newShortURL = generateRandomURL();

  urlDatabase[newShortURL] = {};

  urlDatabase[newShortURL] = {};
  urlDatabase[newShortURL]["longURL"] = req.body.longURL;
  urlDatabase[newShortURL]["userID"] = currUser_id;

  res.redirect(`/urls/${newShortURL}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
