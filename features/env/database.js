const {Before, AfterAll, BeforeAll} = require('cucumber');
const mongoose = require('mongoose');
const sinon = require('sinon');

const userSchema = require('../../human-connection-api/server/models/users.model.js');

mongoose.connect("mongodb://localhost/hc_api_test");
const db = mongoose.connection;

let app = sinon.stub();
sinon.stub(app, 'get').callsFake(function() {
  return mongoose;
});

let User;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  User = userSchema(app); // initialize User model
});

// Asynchronous Promise
Before(function(_, callback) {
  User.remove(function (err) {
    if(err) throw(err);
    callback();
  });
});

AfterAll(function(callback) {
  db.close();
  callback();
});
