const { v4: uuidv4 } = require("uuid");
const { URLSearchParams } = require("url");
const ApiBuilder = require("claudia-api-builder"),
  AWS = require("aws-sdk");
 var api = new ApiBuilder(),
  dynamoDB = new AWS.DynamoDB.DocumentClient();
const Routing = require("./routing/routing");
const databaseTable = new Routing.DynamoDBTables();
const routes = new Routing.ServerEndpoints();

// SAVE PATIENT -> endpoint  => /registerpatientinfo
/* api.post(
  routes.registerPatientInfo(),
  (request) => {
    // This will be replaced by Cognito USERNAME
    var params = {
      TableName: databaseTable.getPatientsInfoTableName(), //table name -> users
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

// Register doctor info - /registerdoctorinfo DOCTOR
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
        clinic: request.body.clinic,
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

// Return list of all the patients 
api.get(routes.findaRecord(), (request) => { 
  
  const id = request.queryString && request.queryString.recordid;

  // GET a record by recordid
  return  dynamoDB
  .query({
    TableName: databaseTable.getRecordTableName(),
    KeyConditionExpression: "recordid = :recordid",
    ExpressionAttributeValues: {
      ":recordid": id,
    },
  })
  .promise()
  .then((response) => response.Items[0])
});


// Return list of all the patients
api.get(routes.getPatientsInfo(), (request) => {
  // GET all users
  return dynamoDB
    .scan({ TableName: databaseTable.getPatientsInfoTableName() })
    .promise()
    .then((response) => response.Items);
});

// Return a patient information by username - Pagination
api.get(routes.findPatient(), async (request) => {
  const username = request.queryString && request.queryString.username;

  if (!username) {
    return { error: 400 };
  }

  const pageSize = parseInt(request.queryString.pageSize) || 10; //(optional, defaults to 10 if not provided)
  const currentPage = parseInt(request.queryString.page) || 1; // (optional, defaults to 1 if not provided)
  const lastEvaluatedKey =
    request.queryString.lastEvaluatedKey ||
    null; 
    // the last evaluated key of the previous page ((recordid that is provided as part of the response of the first page and subsequent ones))
   //(optional, null if this is the first page) 

  const offset = (currentPage - 1) * pageSize;

  try {
    const [patientInfo, recordsCount, records] = await Promise.all([
      // Get patient info by username
      dynamoDB
        .query({
          TableName: databaseTable.getPatientsInfoTableName(),
          KeyConditionExpression: "userid = :userid",
          ExpressionAttributeValues: {
            ":userid": username,
          },
        })
        .promise()
        .then((response) => response.Items[0]),
      // Get the count of patient records by username
      dynamoDB
        .query({
          TableName: databaseTable.getRecordTableName(),
          IndexName: "patientUsernameIndex", // Use the secondary index on the patientUsername field
          KeyConditionExpression: "patientUsername = :username",
          ExpressionAttributeValues: {
            ":username": username,
          },
          Select: "COUNT",
        })
        .promise()
        .then((response) => response.Count),
      // Get patient records by username with pagination
      dynamoDB
        .query({
          TableName: databaseTable.getRecordTableName(),
          IndexName: "patientUsernameIndex", // Use the secondary index on the patientUsername field
          KeyConditionExpression: "patientUsername = :username",
          ExpressionAttributeValues: {
            ":username": username,
          },
          Limit: pageSize,
          ScanIndexForward: false,
          ExclusiveStartKey:
            currentPage > 1
              ? { patientUsername: username, recordid: lastEvaluatedKey }
              : undefined,
        })
        .promise()
        .then((response) => response.Items),
    ]);

    // return { patientInfoOBJECT : patientInfo, recordObject : records, recordsCountObject: recordsCount }
    // Extract the set of unique doctor usernames from the records
    const uniqueDoctorUsernames = [
      ...new Set(records.map((record) => record.doctorUsername)),
    ];

    // Fetch the doctor information for each unique doctor username
    const doctors = await Promise.all(
      uniqueDoctorUsernames.map((doctorUsername) =>
        dynamoDB
          .query({
            TableName: databaseTable.getDoctorInfoTableName(),
            KeyConditionExpression: "doctorid = :doctorid",
            ExpressionAttributeValues: {
              ":doctorid": doctorUsername,
            },
          })
          .promise()
          .then((response) => response.Items[0])
      )
    );

    let lastEKey;
    // Map each record to a new object that includes the doctor information
    const recordsWithDoctorInfo = records.map((record) => {
      const doctor = doctors.find((d) => d.doctorid === record.doctorUsername);
      lastEKey = record.recordid;
      return {
        dateTime: record.date,
        doctorName: `${doctor.firstname} ${doctor.lastname}`,
        clinic: doctor.clinic,
        subject: record.subject,
        recordid: record.recordid,
      };
    });

    return {
      patientInfo: {
        username: patientInfo.userid,
        firstname: patientInfo.firstname,
        lastname: patientInfo.lastname,
        dateofbirth: patientInfo.dateofbirth,
        email: patientInfo.email,
        phonenumber: patientInfo.phonenumber,
        address: patientInfo.address,
        postalcode: patientInfo.postalcode,
        healthcardnumber: patientInfo.healthcardnumber,
      },
      records: {
        total_items: recordsCount,
        items_per_page: pageSize,
        current_page: currentPage,
        lastEvaluatedKey: lastEKey,
        records: recordsWithDoctorInfo,
      },
    };
  } catch (error) {
    return {
      error: `Something went wrong. ${error.message}`,
      errorCode: error.errorCode,
    };
  }
});

// Return a doctor information by username
api.get(routes.findDoctor(), (request) => {
  // GET a user by username
  const username = request.queryString && request.queryString.username;

  // Error Handling : If the username is emptry it will return with a 400
  if (!username) {
    return { error: 400 };
  }

  return dynamoDB
    .query({
      TableName: databaseTable.getDoctorInfoTableName(),
      KeyConditionExpression: "doctorid = :doctorid",
      ExpressionAttributeValues: {
        ":doctorid": username,
      },
    })
    .promise()
    .then((response) => response.Items[0])
    .catch((error) => ({ error: error.message }));
}); */

////////////////////////////////////////////////////////////////////////
/// DELETE THIS LATER

/**
 * {
  "patientInfo": {
    "username": "john smith",
    "firstName": "John",
    "lastName": "Smith",
    "dateOfBirth": "08-24-1990",
    "email": "sam@smith.com",
    "phoneNumber": "5182737523",
    "address": "123 Main St",
    "postalCode": "A2A 2A2",
    "healthCardNumber": "123124124142"
  },
  "records": {
    "records": [{
      "dateTime": "12the February, 2023 08:00 am",
      "doctorName": " Mr.Michale Simon",
      "clinic": "Happy Clinic",
      "subject": " Severe Migraine"
    }]
  },
  "pagination": {
        "total_items": 200,
        "items_per_page": 10,
        "current_page": 1
    }
}
 */

/// DELETE THIS LATER
// api.get("/patientI", (request) => { // GET all data
//   const getUsers = dynamoDB.scan({ TableName: databaseTable.getPatientsInfoTableName() }).promise();
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

// Can be uncommented if we decided to add multiple patients at once to our Table (For sake of populating the table only)
// api.post(routes.addMultiplePatientsToDatabase(), (request) => {
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
//       TableName: databaseTable.getPatientsInfoTableName(),
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
///////////////////////////////////////////////////////////////////////////////////////////

api.post(
  routes.registerPatientInfo(),
  (request) => {
    // This will be replaced by Cognito USERNAME
    var params = {
      TableName: databaseTable.getUserInfoTableName(), //table name -> users
      Item: {
        userid: request.body.userid,
        firstname: request.body.firstname,
        lastname: request.body.lastname,
        phonenumber: request.body.phonenumber,
        healthcardnumber: request.body.healthcardnumber,
        address: request.body.address,
        email: request.body.email,
        dateofbirth: request.body.dateofbirth,
        roleid: request.body.roleid,
      },
    };
    return dynamoDB.put(params).promise(); // returns dynamo result
  },
  { success: 201 }
); // returns HTTP status 201 - Created if successful

// Register doctor info - /registerdoctorinfo DOCTOR
api.post(
  routes.registerDoctorInfo(),
  (request) => {
    var params = {
      TableName: databaseTable.getUserInfoTableName(),
      Item: {
        userid: request.body.doctorid,
        doctorid: request.body.doctorid,
        firstname: request.body.firstname,
        lastname: request.body.lastname,
        dateofbirth: request.body.dateofbirth,
        staffID: request.body.staffID,
        clinic: request.body.clinic,
        specialization: request.body.specialization,
        email: request.body.email,
        phonenumber: request.body.phonenumber,
        roleid: request.body.roleid,
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

// Return list of all the patients
api.get(routes.findaRecord(), (request) => {
  const id = request.queryString && request.queryString.recordid;

  // GET a record by recordid
  return dynamoDB
    .query({
      TableName: databaseTable.getRecordTableName(),
      KeyConditionExpression: "recordid = :recordid",
      ExpressionAttributeValues: {
        ":recordid": id,
      },
    })
    .promise()
    .then((response) => response.Items[0]);
});

api.get(routes.findUser(), (request) => {
  // GET a user by username
  const username = request.queryString && request.queryString.username;

  // Error Handling : If the username is emptry it will return with a 400
  if (!username) {
    return { error: 400 };
  }

  return dynamoDB
    .query({
      TableName: databaseTable.getUserInfoTableName(),
      KeyConditionExpression: "userid = :userid",
      ExpressionAttributeValues: {
        ":userid": username,
      },
    })
    .promise()
    .then((response) => response.Items[0])
    .catch((error) => ({ error: error.message }));
});

// Return list of all the patients
api.get(routes.getPatientsInfo(), (request) => {
  // GET all users
  return dynamoDB
    .scan({ TableName: databaseTable.getUserInfoTableName() })
    .promise()
    .then((response) => response.Items);
});

// Return a patient information by username - Pagination
api.get(routes.findPatient(), async (request) => {
  const username = request.queryString && request.queryString.username;

  if (!username) {
    return { error: 400 };
  }

  const pageSize = parseInt(request.queryString.pageSize) || 10; //(optional, defaults to 10 if not provided)
  const currentPage = parseInt(request.queryString.page) || 1; // (optional, defaults to 1 if not provided)
  const lastEvaluatedKey = request.queryString.lastEvaluatedKey || null;
  // the last evaluated key of the previous page ((recordid that is provided as part of the response of the first page and subsequent ones))
  //(optional, null if this is the first page)

  const offset = (currentPage - 1) * pageSize;

  try {
    const [patientInfo, recordsCount, records] = await Promise.all([
      // Get patient info by username
      dynamoDB
        .query({
          TableName: databaseTable.getUserInfoTableName(),
          KeyConditionExpression: "userid = :userid",
          ExpressionAttributeValues: {
            ":userid": username,
          },
        })
        .promise()
        .then((response) => response.Items[0]),
      // Get the count of patient records by username
      dynamoDB
        .query({
          TableName: databaseTable.getRecordTableName(),
          IndexName: "patientUsernameIndex", // Use the secondary index on the patientUsername field
          KeyConditionExpression: "patientUsername = :username",
          ExpressionAttributeValues: {
            ":username": username,
          },
          Select: "COUNT",
        })
        .promise()
        .then((response) => response.Count),
      // Get patient records by username with pagination
      dynamoDB
        .query({
          TableName: databaseTable.getRecordTableName(),
          IndexName: "patientUsernameIndex", // Use the secondary index on the patientUsername field
          KeyConditionExpression: "patientUsername = :username",
          ExpressionAttributeValues: {
            ":username": username,
          },
          Limit: pageSize,
          ScanIndexForward: false,
          ExclusiveStartKey:
            currentPage > 1
              ? { patientUsername: username, recordid: lastEvaluatedKey }
              : undefined,
        })
        .promise()
        .then((response) => response.Items),
    ]);

    // return { patientInfoOBJECT : patientInfo, recordObject : records, recordsCountObject: recordsCount }
    // Extract the set of unique doctor usernames from the records
    const uniqueDoctorUsernames = [
      ...new Set(records.map((record) => record.doctorUsername)),
    ];

    // Fetch the doctor information for each unique doctor username
    const doctors = await Promise.all(
      uniqueDoctorUsernames.map((doctorUsername) =>
        dynamoDB
          .query({
            TableName: databaseTable.getUserInfoTableName(),
            KeyConditionExpression: "userid = :userid",
            ExpressionAttributeValues: {
              ":userid": doctorUsername,
            },
          })
          .promise()
          .then((response) => response.Items[0])
      )
    );

    let lastEKey;
    // Map each record to a new object that includes the doctor information
    const recordsWithDoctorInfo = records.map((record) => {
      const doctor = doctors.find((d) => d.doctorid === record.doctorUsername);
      lastEKey = record.recordid;
      return {
        dateTime: record.date,
        doctorName: `${doctor.firstname} ${doctor.lastname}`,
        clinic: doctor.clinic,
        subject: record.subject,
        recordid: record.recordid,
      };
    });

    return {
      patientInfo: {
        username: patientInfo.userid,
        firstname: patientInfo.firstname,
        lastname: patientInfo.lastname,
        dateofbirth: patientInfo.dateofbirth,
        email: patientInfo.email,
        phonenumber: patientInfo.phonenumber,
        address: patientInfo.address,
        postalcode: patientInfo.postalcode,
        healthcardnumber: patientInfo.healthcardnumber,
        roleid: patientInfo.roleid,
      },
      records: {
        total_items: recordsCount,
        items_per_page: pageSize,
        current_page: currentPage,
        lastEvaluatedKey: lastEKey,
        records: recordsWithDoctorInfo,
      },
    };
  } catch (error) {
    return {
      error: `Something went wrong. ${error.message}`,
      errorCode: error.errorCode,
    };
  }
});

// Return a doctor information by username
api.get(routes.findDoctor(), (request) => {
  // GET a user by username and roleid
  const username = request.queryString && request.queryString.username;
  const roleid = "doctor";

  // Error Handling : If the username is empty it will return with a 400
  if (!username) {
    return { error: 400 };
  }

  return dynamoDB
    .query({
      TableName: databaseTable.getUserInfoTableName(),
      KeyConditionExpression: "userid = :userid",
      FilterExpression: "roleid = :roleid",
      ExpressionAttributeValues: {
        ":userid": username,
        ":roleid": roleid,
      },
    })
    .promise()
    .then((response) => {
      const items = response.Items;
      const doctor = items.find((item) => item.userid === username);
      return doctor || { error: "Doctor not found" };
    })
    .catch((error) => ({ error: error.message }));
});


module.exports = api;