const {Before, AfterAll, BeforeAll} = require('cucumber');
const mongoose = require('mongoose');
const sinon = require('sinon');

const userSchema = require('../../human-connection-api/server/models/users.model.js');
const contributionSchema = require('../../human-connection-api/server/models/contributions.model.js');

mongoose.connect("mongodb://localhost/hc_api_test");
const db = mongoose.connection;

let app = sinon.stub();
sinon.stub(app, 'get').callsFake(function() {
  return mongoose;
});

let User, Contribution;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // initialize models needed in step definitions
  User = userSchema(app);
  Contribution = contributionSchema(app);
});

// Asynchronous Promise
Before(function(_, callback) {
  let promises = [User, Contribution].map((model) => {
    return model.remove();
  });
  Promise.all(promises).then(() => {
    callback();
  });
});

AfterAll(function(callback) {
  db.close();
  callback();
});
