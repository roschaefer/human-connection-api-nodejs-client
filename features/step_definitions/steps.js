const { Given, When, Then } = require('cucumber');
const fetch = require('node-fetch');
const mongoose = require('mongoose');
const { expect } = require('chai');
// Hack: Directly accessing the default password hashing function
const encrypt = require('../../node_modules/feathers-authentication-local/lib/utils/hash');

let currentUser;
let currentUserPassword;
let httpResponse;
let currentUserAccessToken;
const hcBackendUrl = 'http://localhost:3030';


function authenticate(email, plainTextPassword) {
  const formData = {
    email,
    password: plainTextPassword,
    strategy: 'local',
  };
  return fetch(`${hcBackendUrl}/authentication`, {
    method: 'post',
    body: JSON.stringify(formData),
    headers: { 'Content-Type': 'application/json' },
  }).then(response => response.json())
    .catch((err) => {
      throw (err);
    })
    .then(json => json.accessToken);
}

Given('the Human Connection API is up and running', () => {
  // Just documentation
});

Given("there is a 3rd party application running, e.g. 'Democracy'", () => {
  // Just documentation
});

Given('there is an organization in Human Connection with these credentials:', (dataTable) => {
  const User = mongoose.model('users');
  const params = dataTable.hashes()[0];
  return encrypt(params.password).then((hashedPassword) => {
    currentUserPassword = params.password; // remember plain text password
    params.password = hashedPassword; // hashed password goes into db
    currentUser = new User(params);
    return currentUser.save();
  });
});

Given('I am authenticated', () => authenticate(currentUser.email, currentUserPassword).then((accessToken) => {
  currentUserAccessToken = accessToken;
}));

Given('my user account is verified', () => {
  // Write code here that turns the phrase above into concrete actions
  currentUser.isVerified = true;
  return currentUser.save();
});

When('I send a POST request to {string} with:', (route, body, callback) => {
  const params = {
    method: 'post',
    body,
    headers: { 'Content-Type': 'application/json' },
  };
  if (currentUserAccessToken) {
    params.headers.Authorization = `Bearer ${currentUserAccessToken}`;
  }
  fetch(`${hcBackendUrl}${route}`, params)
    .then(response => response.json())
    .catch((err) => {
      throw (err);
    })
    .then((json) => {
      httpResponse = json;
      callback();
    });
});

Then('there is an access token in the response:', (jsonResponse) => {
  expect(httpResponse.accessToken).to.be.a('string');
  expect(httpResponse.accessToken.length).to.eq(342);
  const expectedAccessToken = JSON.parse(jsonResponse).accessToken;
  const expectedFirstPartOfJwt = expectedAccessToken.split('.')[0];
  expect(httpResponse.accessToken.split('.')[0]).to.eq(expectedFirstPartOfJwt);
});

Then('a new post should be created', (callback) => {
  const Contribution = mongoose.model('contributions');
  Contribution.find({}, (err, contributions) => {
    if (err) throw (err);
    expect(contributions).to.have.lengthOf(1);
    expect(contributions[0].type).to.eq('post');
    callback();
  });
});
