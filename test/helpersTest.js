const { assert } = require("chai");

const {
  generateRandomURL,
  checkForEmail,
  urlsForUser
} = require("../helper.js");

const testUsers = {
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

describe("getUserByEmail", function() {
  it("should return a user with valid email", function() {
    const user = checkForEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.strictEqual(user.userID, expectedOutput);
  });

  it("should fail and return false for existsAlready property", function() {
    const user = checkForEmail("notInDB@example.com", testUsers);
    const expectedOutput = false;
    assert.isNotTrue(user.existsAlready, expectedOutput);
  });
});
