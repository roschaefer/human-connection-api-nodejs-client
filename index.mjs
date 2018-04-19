import fetch from 'node-fetch';

const hcBackendUrl = 'http://localhost:3030'
const bundestagGraphqlUrl = 'http://localhost:3000/graphql'
const query = '{"query": "{procedures(type: PREPARATION) { title abstract }}"}';

class User {
  login(email, password) {
    const formData = {
      email: email,
      password: password,
      strategy: 'local',
    }
    return fetch(`${hcBackendUrl}/authentication`, {
      method: 'post',
      body: JSON.stringify(formData),
      headers: { 'Content-Type': 'application/json' }
    }).then((response) => {
      return response.json()
    }).then((json) => {
      this.accessToken = json.accessToken;
      return true;
    });
  }

  contribute(contribution){
    return fetch(`${hcBackendUrl}/contributions`, {
      method: 'post',
        body: JSON.stringify(contribution),
        headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    }).then((response) => {
      return response.json();
    })
  }
}

async function bundestagProcedures(){
  return await fetch(bundestagGraphqlUrl, {
  method: 'post',
    body: query,
    headers: { 'Content-Type': 'application/json' }
  }).then((response) => {
    return response.json()
  }).then((json) => {
    return json.data.procedures;
  });
}




async function main() {
  let user = new User();
  await user.login('test2@test2.de', '1234');
  const procedures = await bundestagProcedures();
  if (procedures.length > 0){
    const contribution = {
      title: procedures[0].title,
      content: procedures[0].abstract,
      contentExcerpt: procedures[0].abstract,
      type: "post",
      language: "de",
      categoryIds: ["5ac7768f8d655d2ee6d48fe4"] // democracy-politics
    }
    const response = await user.contribute(contribution);
    console.log(response);
  } else {
    console.log("No procedures found!");
  }
}

main();
