const { Given, When, Then } = require('cucumber');
const userSchema = require('../../human-connection-api/server/models/users.model.js');
const getModel = require('../env/getModel.js');
const User = getModel(userSchema);

Given('the Human Connection API is up and running', function () {
  // Just documentation
});

Given("there is a 3rd party application running, e.g. 'Democracy'", function () {
  // Just documentation
});

Given('there is an organization in Human Connection with these credentials:', function (dataTable) {
  // Write code here that turns the phrase above into concrete actions
  const table = dataTable.hashes()
  dataTable.hashes().forEach((row) => {
    const aUser = new User(row);
    aUser.save(function (err, user) {
      if(err) throw(err);
    });
  });
});

Given('I am authenticated', function () {
  // Write code here that turns the phrase above into concrete actions
  return 'pending';
});

When('I send a POST request to {string} with:', function (string, docString) {
  // Write code here that turns the phrase above into concrete actions
  return 'pending';
});

Then('there is an access token in the response:', function (docString) {
  // Write code here that turns the phrase above into concrete actions
  return 'pending';
});

Then('a new post should be created', function () {
  // Write code here that turns the phrase above into concrete actions
  return 'pending';
});
