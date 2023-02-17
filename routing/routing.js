// Server endpoint , Creating a user, creaeting multiple users
const createUser = '/createuser'
const getAllUsers = '/fetchusers'
const findUser = '/finduser'
const bulkCreateUsers = '/bulkcreateusers'

const registerdoctorinfo = '/registerdoctorinfo'


// Server endpoint user management 
const signupUser = '/signup'
const loginUser = '/login'
const userProfile = '/profile'
const forgotPassword = '/forgotPassword'


// DynamoDB table names
const dynamoDBUsersTable = "users"



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

    // User management endpoints
    signupUser() { return signupUser;}
    loginUser() { return loginUser;}
    userProfile(){ return userProfile;}
    forgotPassword() { return forgotPassword;}

}

class DynamoDBTables {
    getUsersTableName() { return dynamoDBUsersTable;}
}

module.exports = { ServerEndpoints: ServerEndpoints, DynamoDBTables: DynamoDBTables};