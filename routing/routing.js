// Server endpoint , Creating a user, creaeting multiple users
const createUser = '/createuser'
const getAllUsers = '/fetchusers'
const findUser = '/finduser'
const bulkCreateUsers = '/bulkcreateusers'

// Doctor Info Registration 
const registerdoctorinfo = '/registerdoctorinfo'

// Record Registeration
const registerRecord = "/registerrecord"

// DynamoDB table names
const dynamoDBUsersTable = "users"
const dynamoDBDoctorInfoTable = "doctor-info"
const dynamoDBRecord = "record"



class ServerEndpoints {

    // Create a user
    createUser() { return createUser;}
    // Get all the users
    getAllUsers() { return getAllUsers;}
    // Find a specific user
    findUser() { return findUser;}
    // Create Multiple Users at once
    addMultipleUsersToDatabase() { return bulkCreateUsers;}

    // Register doctor info
    registerDoctorInfo() { return registerdoctorinfo;}

    // Register a record
    registerRecord() { return registerRecord; }

    // User management endpoints
    signupUser() { return signupUser;}
    loginUser() { return loginUser;}
    userProfile(){ return userProfile;}
    forgotPassword() { return forgotPassword;}

}

class DynamoDBTables {
    getUsersTableName() { return dynamoDBUsersTable;}
    getDoctorInfoTableName() { return dynamoDBDoctorInfoTable; }
    getRecordTableName() { return dynamoDBRecord;}
}

module.exports = { ServerEndpoints: ServerEndpoints, DynamoDBTables: DynamoDBTables};