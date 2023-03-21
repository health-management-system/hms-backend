# HMS Backend
## Testing
### Steps:
**1.** First we need to install several npm packages globally by running both:
```bash
npm intall --global nyc
```
and
```bash
npm install --global claudia-local-api
```

**2.** Next make sure that you have an aws config file (if you have already done so skip this step). This file should not be pushed to the repo and shoudl remain on your local machine. This can be done by creating `./config.json` in the root directory. It should look something like this:
```json
{ 
    "accessKeyId": <AWS_Access_Key>,
    "secretAccessKey": <AWS_Secret_Access_Key>,
    "region": "us-east-1" 
}
```

**3.** Next we need to uncomment line 7 from `./index.js` to load our newly created local config (see below). This line should always be commented when actually deploying the backend.
```javascript
1   const { v4: uuidv4 } = require("uuid");
2   const { URLSearchParams } = require("url");
3   const ApiBuilder = require("claudia-api-builder"),
4   AWS = require("aws-sdk");
5   // This will fail if the config doesn't exist need to discuss this
6   // Uncomment the line below when testing locally
7   //AWS.config.loadFromPath('./config.json');        <=== THIS LINE
8   var api = new ApiBuilder(),
9   dynamoDB = new AWS.DynamoDB.DocumentClient();
10  const Routing = require("./routing/routing");
11  const databaseTable = new Routing.DynamoDBTables();
12  const routes = new Routing.ServerEndpoints();
``` 

**4.** Run the server locally using `npm run coverage`. This will instrument the code and start the server locally on [http://localhost:3000](http://localhost:3000).

**5.** Next the mocha tests can be run using `npm test`.

**6.** After these tests are run we can see the coverage report in the `./coverage` directory