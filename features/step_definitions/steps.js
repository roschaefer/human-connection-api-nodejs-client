const { Given, When, Then } = require('cucumber');

Given('the Human Connection API is up and running', function () {
  // Write code here that turns the phrase above into concrete actions
  console.log('skipping over starting the Human Connection API');
});

Given("there is a 3rd party application running, e.g. 'Democracy'", function () {
  // Write code here that turns the phrase above into concrete actions
  console.log('skipping over starting the 3rd party API');
  // return 'pending';
});

Given('there is an organization in Human Connection with these credentials:', function (dataTable) {
  // Write code here that turns the phrase above into concrete actions
  return 'pending';
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
