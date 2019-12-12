const express = require("express");
const PORT = process.env.port || 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");

const { urlDatabase, users } = require("./database.js");
const {
  generateRandomURL,
  checkForEmail,
  urlsForUser
} = require("./helper.js");

const app = express();

app.use(
  cookieSession({
    name: "session",
    keys: ["cold", "outside"]
  })
);

app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

//Loads 'Create URL Page'
app.get("/urls/new", (req, res) => {
  const currUser_id = req.session.user_id;

  let templateVars = {
    user: users[currUser_id]
  };
  res.render("urls_new", templateVars);
});

//Loads 'Edit URL Page' for a specific shortURL
app.get("/urls/:shortURL", (req, res) => {
  const currUser_id = req.session.user_id;

  let templateVars = {
    user: users[currUser_id],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  res.render("urls_show", templateVars);
});

//Endpoint that sends shortURL links to go to their associated webpage (wired to clickable link on the shortURL)
app.get("/u/:shortURL", (req, res) => {
  const currlongURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(currlongURL);
});

//Loads the main Urls index page; finds all URLs for current user and displays
app.get("/urls", (req, res) => {
  const currUser_id = req.session.user_id;

  const currentUsersURLs = urlsForUser(currUser_id);

  let templateVars = {
    user: users[currUser_id],
    urls: currentUsersURLs
  };
  res.render("urls_index", templateVars);
});

//Loads Register Page for account creation
app.get("/register", (req, res) => {
  const currUser_id = req.session.user_id;

  const templateVars = {
    user: users[currUser_id],
    urls: urlDatabase
  };
  res.render("registration", templateVars);
});

//Loads Login Page
app.get("/login", (req, res) => {
  const currUser_id = req.session.user_id;

  const templateVars = {
    user: users[currUser_id],
    urls: urlDatabase
  };
  res.render("login", templateVars);
});

//Reroutes the home path to /urls
app.get("/", (req, res) => {
  res.redirect("/urls");
});

//Wired to delete button to delete specific URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const currUser_id = req.session.user_id;

  const urlToDelete = req.params.shortURL;

  if (currUser_id === urlDatabase[urlToDelete].userID) {
    delete urlDatabase[urlToDelete];
    res.redirect("/urls");
  } else {
    res.send("Can't delete if not logged into user.");
  }
});

//Wired to Url Edit form to update a specific LongURL
app.post("/urls/:shortURL", (req, res) => {
  const currUser_id = req.session.user_id;

  const urlToEdit = req.params.shortURL;
  const newLongURL = req.body.newLongURL;

  if (currUser_id === urlDatabase[urlToEdit].userID) {
    urlDatabase[urlToEdit].longURL = newLongURL;
    res.redirect("/urls");
  } else {
    res.send("Can't edit if not logged into user.");
  }
});

//Wired to register page form; checks that entered email is available, creates that accounts cookie
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !password) {
    res.status(400);
    res.send("no email/password entered");
    console.log("email or password is falsey");
  } else {
    const Emailcheck = checkForEmail(email, users);

    if (Emailcheck.existsAlready) {
      res.status(400);
      res.send("email is already in use");
    } else {
      const id = generateRandomURL();
      users[id] = {
        id,
        email,
        password: hashedPassword
      };

      req.session.user_id = id;

      res.redirect("/urls");
    }
  }
});

//Wired to login form; Checks that email exists in database, checks that password is correct for user, sets cookie
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const Emailcheck = checkForEmail(email, users);

  if (!Emailcheck.existsAlready) {
    res.status(400);
    res.send("No account with that email. Please Register a new account!");
  } else {
    const currentUser = users[Emailcheck.userID];

    if (bcrypt.compareSync(password, currentUser.password)) {
      req.session.user_id = Emailcheck.userID;
      res.redirect("/urls");
    } else {
      res.status(400);
      res.send("Email or Password is incorrect.");
    }
  }
});

//Wired to logout button, deletes current account cookie
app.post("/logout", (req, res) => {
  delete req.session.user_id;
  res.redirect("/login");
});

//Wired to create URL form; Creates the new URL object with a new ShortURL, LongURL and userID property. Send back to URl index page.
app.post("/urls", (req, res) => {
  const currUser_id = req.session.user_id;

  let newShortURL = generateRandomURL();

  urlDatabase[newShortURL] = {};
  urlDatabase[newShortURL]["longURL"] = req.body.longURL;
  urlDatabase[newShortURL]["userID"] = currUser_id;

  res.redirect(`/urls/${newShortURL}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
