const sinon = require('sinon');
const mongoose = require('mongoose');

let app = sinon.stub();
sinon.stub(app, 'get').callsFake(function() {
  return mongoose;
});

module.exports = function(schema) {
  return schema(app);
}
