// Server endpoint , Creating a patient, doctor, creaeting multiple patients
const registerPatientInfo = '/registerpatientinfo'
const getPatientsInfo = '/fetchpatientsinfo'
const findPatient = '/findpatient'
const findDoctor = '/finddoctor'
const bulkRegisterPatients = '/bulkcreateusers'

// Doctor Info Registration 
const registerdoctorinfo = '/registerdoctorinfo'

//Find a Record
const findarecord = '/findarecord'

// Record Registeration
const registerRecord = "/registerrecord"

// DynamoDB table names
const dynamoDBPatientInfoTable = "users"
const dynamoDBDoctorInfoTable = "doctor-info"
const dynamoDBRecord = "record"

// TEST 

const findPatientPagination = '/findpatientPagination'

//

class ServerEndpoints {

    // Create a user
    registerPatientInfo() { return registerPatientInfo;}
    // Get all the users
    getPatientsInfo() { return getPatientsInfo;}
    // Find a specific Patient
    findPatient() { return findPatient;}
    // Find a speciic Patient with Pagination 
    findPatientPagination() { return findPatientPagination; }
    // Find a specific Doctor
    findDoctor() { return findDoctor; }
    // Create Multiple Users at once
    addMultiplePatientsToDatabase() { return bulkRegisterPatients;}

    // Find a record

    findaRecord() {return findarecord; }

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
    getPatientsInfoTableName() { return dynamoDBPatientInfoTable;}
    getDoctorInfoTableName() { return dynamoDBDoctorInfoTable; }
    getRecordTableName() { return dynamoDBRecord;}
}

module.exports = { ServerEndpoints: ServerEndpoints, DynamoDBTables: DynamoDBTables};
