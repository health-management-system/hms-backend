const { v4: uuidv4 } = require("uuid");
const { URLSearchParams } = require("url");
const ApiBuilder = require("claudia-api-builder"),
  AWS = require("aws-sdk");
var api = new ApiBuilder(),
  dynamoDB = new AWS.DynamoDB.DocumentClient();
const Routing = require("./routing/routing");
const databaseTable = new Routing.DynamoDBTables();
const routes = new Routing.ServerEndpoints();

// SAVE user -> endpoint  => /createuser
api.post(
  routes.createUser(),
  (request) => {
    // This will be replaced by Cognito USERNAME
    var params = {
      TableName: databaseTable.getUsersTableName(), //table name -> users
      Item: {
        userid: request.body.userid,
        firstname: request.body.firstname,
        lastname: request.body.lastname,
        phonenumber: request.body.phonenumber,
        healthcardnumber: request.body.healthcardnumber,
        address: request.body.address,
        email: request.body.email,
        dateofbirth: request.body.dateofbirth,
      },
    };
    return dynamoDB.put(params).promise(); // returns dynamo result
  },
  { success: 201 }
); // returns HTTP status 201 - Created if successful

// Register doctor info - /registerdoctorinfo
api.post(
  routes.registerDoctorInfo(),
  (request) => {
    var params = {
      TableName: databaseTable.getDoctorInfoTableName(),
      Item: {
        doctorid: request.body.doctorid,
        firstname: request.body.firstname,
        lastname: request.body.lastname,
        dateofbirth: request.body.dateofbirth,
        staffID: request.body.staffID,
        specialization: request.body.specialization,
        email: request.body.email,
        phonenumber: request.body.phonenumber,
      },
    };
    return dynamoDB.put(params).promise();
  },
  { success: 201 }
);

// Register Record - /registerrecord
api.post(
  routes.registerRecord(),
  (request) => {
    var userId = uuidv4();
    var params = {
      TableName: databaseTable.getRecordTableName(),
      Item: {
        recordid: userId,
        patientUsername: request.body.patientUsername,
        doctorUsername: request.body.doctorUsername,
        date: request.body.date,
        log: request.body.log,
        subject: request.body.subject,
      },
    };
    return dynamoDB.put(params).promise();
  },
  { success: 201 }
);

//

// api.post(routes.addMultipleUsersToDatabase(), (request) => {
//   console.log(request);
//   var usersArray = JSON.parse(JSON.stringify(request.body));
//   console.log(usersArray);
//   var results = [];
//   var user;
//   var uuidUser;
//   for (var i = 0; i < usersArray.length; i++) {
//     uuidUser = uuidv4();
//     user = usersArray[i];
//     console.log(user);
//     var params = {
//       TableName: databaseTable.getUsersTableName(),
//       Item: {
//         userid: uuidUser,
//         firstname: user.firstname,
//         lastname: user.lastname,
//         gender: user.gender,
//         role: user.role,
//         age: user.age,
//         clinicname: user.clinicname
//       }
//     };
//     // push results to be resolved later
//     results.push(dynamoDB.put(params).promise());
//   }
//   console.log(results);
//   // return promise that resolves when all results resolve
//   return Promise.all(results);
// }, { success: 201 });// returns HTTP status 201 - Created if successful

api.get(routes.getAllUsers(), (request) => {
  // GET all users
  return dynamoDB
    .scan({ TableName: databaseTable.getUsersTableName() })
    .promise()
    .then((response) => response.Items);
});

api.get(routes.findUser(), (request) => {
  // GET a user by username
  const username = request.queryString && request.queryString.username;

  if (!username) {
    return { error: "Username parameter is missing." };
  }

  return dynamoDB
    .query({
      TableName: databaseTable.getUsersTableName(),
      KeyConditionExpression: "userid = :userid",
      ExpressionAttributeValues: {
        ":userid": username,
      },
    })
    .promise()
    .then((response) => response.Items[0])
    .catch((error) => ({ error: error.message }));
});

// api.get("/patientI", (request) => { // GET all data
//   const getUsers = dynamoDB.scan({ TableName: databaseTable.getUsersTableName() }).promise();
//   const getOrders = dynamoDB.query({
//   TableName: databaseTable.getOrdersTableName(),
//   KeyConditionExpression: "order_status = :status",
//   ExpressionAttributeValues: { ":status": "completed" },
//   ProjectionExpression: "user_id, order_total"
//   }).promise();

//   return Promise.all([getUsers, getOrders])
//   .then(([usersResponse, ordersResponse]) => {
//   const users = usersResponse.Items;
//   const orders = ordersResponse.Items;
//   const data = [];

//   // Combine and aggregate data from both tables
//   users.forEach(user => {
//     const userOrders = orders.filter(order => order.user_id === user.user_id);
//     const totalOrders = userOrders.reduce((acc, order) => acc + order.order_total, 0);
//     data.push({
//       user_id: user.user_id,
//       user_name: user.user_name,
//       total_orders: totalOrders
//     });
//   });

//   return data;
// });

// Commented out for now. Once we get to this point , will be uncommented and compeleted.
// api.get(routes.findUser(), (request) => { // GET a user by userid
//   const userid = request.queryStringParameters.userid;

//   return dynamoDB.query({
//     TableName: databaseTable.getUsersTableName(),
//     KeyConditionExpression: "userid = :userid",
//     ExpressionAttributeValues: {
//       ":userid": userid
//         }
//   }).promise().then(response => response.Items[0]);
// });

module.exports = api;
