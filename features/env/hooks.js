const {AfterAll, BeforeAll} = require('cucumber');
const { spawn } = require('child_process');
const waitOn = require('wait-on');

let hcApi;

// Asynchronous Callback
BeforeAll({timeout: 30*1000}, function (callback) {
  hcApi = spawn('node', ['server/'], {
    cwd: './human-connection-api/',
    env: {
      'NODE_ENV': 'test'
    }
  });

  hcApi.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  hcApi.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });

  waitOn({ resources: ['tcp:3030'], timeout: 30000 }, function (err) {
    if (err) { return handleError(err); }
    callback();
  });
});

// Asynchronous Promise
AfterAll(function () {
  // perform some shared teardown
  hcApi.kill();
  return Promise.resolve()
});
