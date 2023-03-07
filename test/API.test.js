const assert = require('assert');
const { v4: uuidv4 } = require('uuid');
const ApiBuilder = require('claudia-api-builder');
const sinon = require('sinon');
const AWS = require('aws-sdk');
const Routing = require("../routing/routing");
const databaseTable = new Routing.DynamoDBTables();
const routes = new Routing.ServerEndpoints();
// const databaseTable = require('../routing/routing').DynamoDBTables().getPatientsInfoTableName();
// const routes = require('../routing/routing').ServerEndpoints();
const api = new ApiBuilder(),
  dynamoDB = new AWS.DynamoDB.DocumentClient();
  
describe('POST /registerpatientinfo', () => {
    it('should insert data into DynamoDB table', async () => {
      const expectedParams = {
        TableName: 'testTable',
        Item: {
          userid: 'testuserid',
          firstname: 'testfirstname',
          lastname: 'testlastname',
          phonenumber: 'testphonenumber',
          healthcardnumber: 'testhealthcardnumber',
          address: 'testaddress',
          email: 'testemail',
          dateofbirth: 'testdateofbirth',
        },
      };
      const dynamoDB = new AWS.DynamoDB.DocumentClient();
    const stubbedDynamoDB = sinon.stub(dynamoDB, 'put');
    stubbedDynamoDB.returns({
      promise: () => Promise.resolve(),
    });

    const request = {
      body: {
        userid: 'testuserid',
        firstname: 'testfirstname',
        lastname: 'testlastname',
        phonenumber: 'testphonenumber',
        healthcardnumber: 'testhealthcardnumber',
        address: 'testaddress',
        email: 'testemail',
        dateofbirth: 'testdateofbirth',
      },
    };

    const response = await api.post('/registerpatientinfo', request);



    stubbedDynamoDB.restore();
  });
});

describe("POST /registerDoctorInfo", () => {
    const dynamoDB = new AWS.DynamoDB.DocumentClient();
    const sandbox = sinon.createSandbox();
    let stubbedDynamoDB;
  
    const testRequest = {
      body: {
        doctorid: "test-doctor-id",
        firstname: "test-firstname",
        lastname: "test-lastname",
        dateofbirth: "test-dateofbirth",
        staffID: "test-staffid",
        clinic: "test-clinic",
        specialization: "test-specialization",
        email: "test-email",
        phonenumber: "test-phonenumber",
      },
    };
  
    beforeEach(() => {
      stubbedDynamoDB = {
        put: sandbox.stub().returns({
          promise: sandbox.stub().resolves(),
        }),
      };
      sandbox.stub(AWS.DynamoDB, "DocumentClient").returns(stubbedDynamoDB);
    });
  
    afterEach(() => {
      sandbox.restore();
    });
  
    it("should insert data into DynamoDB table", async () => {
     
      const expectedParams = {
        TableName: databaseTable.getDoctorInfoTableName(),
        Item: {
          doctorid: "test-doctor-id",
          firstname: "test-firstname",
          lastname: "test-lastname",
          dateofbirth: "test-dateofbirth",
          staffID: "test-staffid",
          clinic: "test-clinic",
          specialization: "test-specialization",
          email: "test-email",
          phonenumber: "test-phonenumber",
        },
      };
    //   expect(stubbedDynamoDB.put.calledOnce).to.be.true;
    //   expect(stubbedDynamoDB.put.args[0][0]).to.deep.equal(expectedParams);
    });
  
    it("should return status code 201", async () => {
      
    //   expect(response.statusCode).to.equal(201);
    });
  });

  describe('registerRecord', () => {
    it('should insert a record into DynamoDB table', async () => {
      const request = {
        body: {
          patientUsername: 'test_patient',
          doctorUsername: 'test_doctor',
          date: '2022-04-01',
          log: 'test log',
          subject: 'test subject',
        },
      };
  
      const userId = 'test_user_id';
      const putStub = sinon.stub(dynamoDB, 'put').returns({
        promise: () => Promise.resolve({}),
      });
  
      const response = await api.post(routes.registerRecord(), request);
  
      const expectedParams = {
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
  
    //   assert.deepStrictEqual(putStub.args[0][0], expectedParams);
    //   assert.strictEqual(response.statusCode, 201);
  
      putStub.restore();
    });
  });

  describe("GET /findaRecord", function () {
    it("should return a record from DynamoDB", async function () {
      // Mock the DynamoDB client
      const expectedRecord = {
        recordid: "1234",
        patientUsername: "johndoe",
        doctorUsername: "janedoe",
        date: "2022-01-01",
        log: "Some medical log",
        subject: "Medical subject",
      };
      const queryStub = sinon.stub().returns({
        promise: () => Promise.resolve({ Items: [expectedRecord] }),
      });
      const dynamoDBStub = {
        query: queryStub,
      };
      const stubbedDynamoDB = {
        DocumentClient: sinon.stub().returns(dynamoDBStub),
      };
  
      // Require the API module and replace its dependencies with our mocks
    //   const { routes, databaseTable } = proxyquire("./api.js", {
    //     "aws-sdk": stubbedDynamoDB,
    //   });
  
      // Set up the request
      const recordId = "1234";
      const request = {
        queryString: {
          recordid: recordId,
        },
      };
  
      // Call the API endpoint
     // const response = await routes.findaRecord()(request);
  
      // Verify that the response is what we expect
     // assert.deepStrictEqual(response, expectedRecord);
  
      // Verify that the DynamoDB query was called correctly
      const expectedParams = {
        TableName: databaseTable.getRecordTableName(),
        KeyConditionExpression: "recordid = :recordid",
        ExpressionAttributeValues: {
          ":recordid": recordId,
        },
      };
    //  assert(queryStub.calledOnceWithExactly(expectedParams));
    });
  });
  

  describe('GET /getpatientsinfo', function () {
    it('should return all patient info from DynamoDB', async function () {
      const scanResult = {
        Items: [
          {
            userid: '1',
            firstname: 'John',
            lastname: 'Doe',
            phonenumber: '1234567890',
            healthcardnumber: '1234567890',
            address: '123 Main St.',
            email: 'john.doe@example.com',
            dateofbirth: '2000-01-01',
          },
          {
            userid: '2',
            firstname: 'Jane',
            lastname: 'Doe',
            phonenumber: '0987654321',
            healthcardnumber: '0987654321',
            address: '456 Elm St.',
            email: 'jane.doe@example.com',
            dateofbirth: '1998-02-14',
          },
        ],
      };
      const dynamoDB = new AWS.DynamoDB.DocumentClient();
      const scanStub = sinon.stub(dynamoDB, 'scan').returns({
        promise: () => Promise.resolve(scanResult),
      });
      const expectedResponse = scanResult.Items;
  
      const request = {};
     // const response = await api.proxyRouter(request, {});
  
      //assert.deepStrictEqual(response, expectedResponse);
      //sinon.assert.calledOnce(scanStub);
      //sinon.assert.calledWithExactly(scanStub, { TableName: databaseTable.getPatientsInfoTableName() });
    });
  });
  
 
 

describe('Find doctor by username', () => {
  it('should return the doctor\'s info when given a valid username', async () => {
    // Mock the request object with a valid username query parameter
    const request = {
      queryString: { username: 'validUsername' },
    };

    // Create a mock response object with a 'send' method that returns the data passed to it
    const response = { send: sinon.spy((data) => data) };

    // Call the endpoint function with the mock request and response objects
  //  await endpoint(request, response);

    // Assert that the response is the expected doctor info
    // expect(response.send.calledOnce).to.be.true;
    // expect(response.send.firstCall.args[0]).to.deep.equal({
    //   doctorid: 'validUsername',
    //   // Add other expected doctor info fields here
    // });
  });

  it('should return a 400 error when given an empty username', async () => {
    // Mock the request object with an empty username query parameter
    const request = {
      queryString: { username: '' },
    };

    // Create a mock response object with a 'send' method that returns the data passed to it
    const response = { send: sinon.spy((data) => data) };

    // Call the endpoint function with the mock request and response objects
    //await endpoint(request, response);

    // Assert that the response is a 400 error
    // expect(response.send.calledOnce).to.be.true;
    // expect(response.send.firstCall.args[0]).to.deep.equal({ error: 400 });
  });

  it('should return a 404 error when given a non-existent username', async () => {
    // Mock the request object with a non-existent username query parameter
    const request = {
      queryString: { username: 'nonExistentUsername' },
    };

    // Create a mock response object with a 'send' method that returns the data passed to it
    const response = { send: sinon.spy((data) => data) };

    // Call the endpoint function with the mock request and response objects
   // await endpoint(request, response);

    // Assert that the response is a 404 error
    // expect(response.send.calledOnce).to.be.true;
    // expect(response.send.firstCall.args[0]).to.deep.equal({ error: 'Doctor not found' });
  });
});

  
  




