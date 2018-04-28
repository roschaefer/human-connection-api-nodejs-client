/* eslint no-console: off */
const { Before, AfterAll } = require('cucumber');
const mongoose = require('mongoose');
const sinon = require('sinon');

const userSchema = require('../../human-connection-api/server/models/users.model.js');
const contributionSchema = require('../../human-connection-api/server/models/contributions.model.js');

mongoose.connect('mongodb://localhost/hc_api_test');
const db = mongoose.connection;

const app = sinon.stub();
sinon.stub(app, 'get').callsFake(() => mongoose);

let User;
let Contribution;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  // initialize models needed in step definitions
  User = userSchema(app);
  Contribution = contributionSchema(app);
});

// Asynchronous Promise
Before((_, callback) => {
  const promises = [User, Contribution].map(model => model.remove());
  Promise.all(promises).then(() => {
    callback();
  });
});

AfterAll((callback) => {
  db.close();
  callback();
});
