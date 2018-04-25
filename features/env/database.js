const {Before, AfterAll, BeforeAll} = require('cucumber');
const mongoose = require('mongoose');
const sinon = require('sinon');

let db;

BeforeAll(function (callback) {
  mongoose.connect("mongodb://localhost/hc_api_test");
  db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function() {
    callback();
  });
});

// Asynchronous Promise
Before(function () {
  db.dropDatabase()
});

AfterAll(function() {
  return db.close();
});
