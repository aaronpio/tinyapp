const { urlDatabase } = require("./database.js");

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

const checkForEmail = (email, users) => {
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

module.exports = { generateRandomURL, checkForEmail, urlsForUser };
