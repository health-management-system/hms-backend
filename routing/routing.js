// Server endpoint , Creating a patient, doctor, creaeting multiple patients
const registerPatientInfo = '/registerpatientinfo'
const getPatientsInfo = '/fetchpatientsinfo'
const findPatient = '/findpatient'
const findDoctor = '/finddoctor'
const bulkRegisterPatients = '/bulkcreateusers'

// Doctor Info Registration 
const registerdoctorinfo = '/registerdoctorinfo'

// Record Registeration
const registerRecord = "/registerrecord"

// DynamoDB table names
const dynamoDBPatientInfoTable = "users"
const dynamoDBDoctorInfoTable = "doctor-info"
const dynamoDBRecord = "record"



class ServerEndpoints {

    // Create a user
    registerPatientInfo() { return registerPatientInfo;}
    // Get all the users
    getPatientsInfo() { return getPatientsInfo;}
    // Find a specific Patient
    findPatient() { return findPatient;}
    // Find a specific Doctor
    findDoctor() { return findDoctor; }
    // Create Multiple Users at once
    addMultiplePatientsToDatabase() { return bulkRegisterPatients;}

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