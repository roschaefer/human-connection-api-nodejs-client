/* eslint no-console: off */
import fetch from 'node-fetch';
import _ from 'lodash';

const hcBackendUrl = 'http://localhost:3030';
const bundestagGraphqlUrl = 'http://localhost:3000/graphql';
const query = `{
  procedures(type: PREPARATION) {
    title
    abstract
  }
}`;

class User {
  login(email, password) {
    const formData = {
      email,
      password,
      strategy: 'local',
    };
    return fetch(`${hcBackendUrl}/authentication`, {
      method: 'post',
      body: JSON.stringify(formData),
      headers: { 'Content-Type': 'application/json' },
    }).then(response => response.json()).then((json) => {
      this.accessToken = json.accessToken;
      return true;
    });
  }

  contribute(contribution) {
    return fetch(`${hcBackendUrl}/contributions`, {
      method: 'post',
      body: JSON.stringify(contribution),
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    }).then(response => response.json());
  }
}

async function bundestagProcedures() {
  return fetch(bundestagGraphqlUrl, {
    method: 'post',
    body: JSON.stringify({ query }),
    headers: { 'Content-Type': 'application/json' },
  }).then(response => response.json()).then(json => json.data.procedures);
}


async function main() {
  const user = new User();
  await user.login('test2@test2.de', '1234');
  let procedures = await bundestagProcedures();
  procedures = procedures.filter(p => !_.isNil(p.abstract));


  if (_.isEmpty(procedures)) {
    console.log('No procedures found!');
  } else {
    const contribution = {
      title: procedures[0].title,
      content: procedures[0].abstract,
      contentExcerpt: procedures[0].abstract,
      type: 'post',
      language: 'de',
      categoryIds: ['5ac7768f8d655d2ee6d48fe4'], // democracy-politics
    };
    const response = await user.contribute(contribution);
    console.log(response);
    process.exit(0);
  }
  process.exit(-1);
}

main().catch((err) => {
  console.log(err);
  if (err.code === 'ECONNREFUSED'){
    console.log('\nProbably a service is not running?\n');
  }
  process.exit(-100);
});
