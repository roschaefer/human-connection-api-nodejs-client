const { Given, When, Then } = require('cucumber');
const fetch = require('node-fetch');
const mongoose = require('mongoose');
const expect = require('chai').expect;
// Hack: Directly accessing the default password hashing function
const encrypt = require('../../node_modules/feathers-authentication-local/lib/utils/hash');

let currentUser, currentUserPassword, httpResponse, currentUserAccessToken;
const hcBackendUrl = 'http://localhost:3030';


function authenticate(email, plainTextPassword){
  const formData = {
    email: email,
    password: plainTextPassword,
    strategy: 'local',
  };
  return fetch(`${hcBackendUrl}/authentication`, {
    method: 'post',
    body: JSON.stringify(formData),
    headers: { 'Content-Type': 'application/json' },
  }).then(response => response.json()).then((json) => {
    return json.accessToken;
  });
}

Given('the Human Connection API is up and running', function () {
  // Just documentation
});

Given("there is a 3rd party application running, e.g. 'Democracy'", function () {
  // Just documentation
});

Given('there is an organization in Human Connection with these credentials:', function (dataTable, callback) {
  const User = mongoose.model('users');
  params = dataTable.hashes()[0];
  encrypt(params.password).then((hashedPassword) => {
    currentUserPassword = params.password; // remember plain text password
    params.password = hashedPassword; // hashed password goes into db
    currentUser = new User(params);
    currentUser.save(function (err, user) {
      if(err) callback(err);
      callback();
    });
  });
});

Given('I am authenticated', function () {
  return authenticate(currentUser.email, currentUserPassword).then((accessToken) => {
    currentUserAccessToken = accessToken;
  });
});

Given('my user account is verified', function (callback) {
  // Write code here that turns the phrase above into concrete actions
  currentUser.isVerified = true;
  currentUser.save(function(err, user) {
    if(err) throw(err);
    callback();
  });
});

When('I send a POST request to {string} with:', function (route, body, callback) {
  let params = {
    method: 'post',
    body: body,
    headers: { 'Content-Type': 'application/json' },
  };
  if (currentUserAccessToken) {
    params.headers.Authorization = `Bearer ${currentUserAccessToken}`;
  }
  fetch(`${hcBackendUrl}${route}`, params).then(response => response.json()).then((json) => {
    httpResponse = json;
    callback();
  });
});

Then('there is an access token in the response:', function (docString) {
  expect(httpResponse.accessToken).to.be.a('string');
  expect(httpResponse.accessToken.length).to.eq(342);
});

Then('a new post should be created', function (callback) {
  const Contribution = mongoose.model('contributions');
  Contribution.find({}, function(err, contributions){
    if(err) throw(err);
    expect(contributions).to.have.lengthOf(1);
    expect(contributions[0].type).to.eq('post');
    callback();
  });
});
