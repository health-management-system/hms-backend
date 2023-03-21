const axios = require('axios')
const assert = require('assert');

const baseURL = 'http://localhost:3000'

describe('Tests: \'/finddoctor\'', () => {
    it('Find existing patient', async() => {
        // Declare query string params
        const params = new URLSearchParams([['username', 'axios_patient_read']])
        
        // Make a GET request to the server
        try {
            // Store the response from the server
            var response = await axios.get(baseURL + '/findpatient', {params})
        } catch (err) {
            // If try block fails assert(false)
            assert(false, "Failure: Failed to recieve a response")
        }

        // Read the patient info from the response
        const username = response.data.patientInfo.username
        const firstname = response.data.patientInfo.firstname
        const lastname = response.data.patientInfo.lastname
        const dateofbirth = response.data.patientInfo.dateofbirth
        const email = response.data.patientInfo.email
        const phonenumber = response.data.patientInfo.phonenumber
        const address = response.data.patientInfo.address
        const postalcode = response.data.patientInfo.postalcode
        const healthcardnumber =response.data.patientInfo.healthcardnumber

        // Assert response is correct
        assert(username == 'axios_patient_read')
        assert(firstname == 'Daniel')
        assert(lastname == 'Jones')
        assert(dateofbirth == '10/17/1991')
        assert(email == 'Danielj@gmail.com')
        assert(phonenumber == '517-458-7544')
        assert(address == '30 Sunview St, Waterloo ON')
        assert(postalcode == 'N2L 0N2')
        assert(healthcardnumber == '123333333')
    })
    it('Find non-existent patient', async() => {
        // Declare query string params
        const params = new URLSearchParams([['username', 'nonexistent']])

        // Make a GET request to the server
        try {
            // Store the response from the server
            var response = await axios.get(baseURL + '/findpatient', {params})
        } catch (err) {
            // If try block fails assert(false)
            assert(false, "Failure: Failed to recieve a response")
        }

        // Read the error from the response
        const error = response.data.error

        // Assert response is correct
        assert(error == 'Something went wrong. Cannot read properties of undefined (reading \'userid\')')
    })
})

describe('Tests: \'/finddoctor\'', () => {
    it('Find existing doctor', async() => {
        // Declare query string params
        const params = new URLSearchParams([['username', 'axios_doctor_read']])
        
        // Make a GET request to the server
        try {
            // Store the response from the server
            var response = await axios.get(baseURL + '/finddoctor', {params})
        } catch (err) {
            // If try block fails assert(false)
            assert(false, "Failure: Failed to recieve a response")
        }

        // Read the patient info from the response
        const username = response.data.doctorid
        const firstname = response.data.firstname
        const lastname = response.data.lastname
        const specialization = response.data.specialization
        const email = response.data.email
        const phonenumber = response.data.phonenumber
        const staffID = response.data.staffID
        const clinic = response.data.clinic

        // Assert response is correct
        assert(username == 'axios_doctor_read')
        assert(firstname == 'John')
        assert(lastname == 'Doe')
        assert(specialization == 'Eye Doctor')
        assert(email == 'johnd@gmail.com')
        assert(phonenumber == '517-456-7458')
        assert(staffID == '423423')
        assert(clinic == 'Waterloo Central')
    })
    it('Find non-existent doctor', async() => {
        // Declare query string params
        const params = new URLSearchParams([['username', 'nonexistent']])

        // Make a GET request to the server
        try {
            // Store the response from the server
            var response = await axios.get(baseURL + '/finddoctor', {params})
        } catch (err) {
            // If try block fails assert(false)
            assert(false, "Failure: Failed to recieve a response")
        }

        // Assert response is correct
        assert(Object.keys(response.data).length == 0)
    })
})

describe('Tests: \'/findarecord\'', async() => {
    it('Find existing record', async() => {
        // Declare query string params
        const params = new URLSearchParams([['recordid', '559d912c-b153-4a94-ac5d-9d8215ea9e29']])

        // Make a GET request to the server
        try {
            // Store the response from the server
            var response = await axios.get(baseURL + '/findarecord', {params})
        } catch (err) {
            // If try block fails assert(false)
            assert(false, "Failure: Failed to recieve a response")
        }

        // Read the record fields from the response
        const doctorName = response.data.doctorName
        const doctorUsername = response.data.doctorUsername
        const patientUsername = response.data.patientUsername
        const clinic = response.data.clinic
        const subject = response.data.subject
        const date = response.data.dateTime
        const log = response.data.log
        const recordid = response.data.recordid

        // Assert response is correct
        assert(doctorName == 'mQRT6cPy1y TFAHKCPAMM')
        assert(doctorUsername == 'e2e_doctor')
        assert(patientUsername == 'test_record_patient')
        assert(clinic == 'OHGgr0C7Fe')
        assert(subject == 'Cypress E2E Tests')
        assert(date == '10/04/2023')
        assert(log == 'This is a cypress E2E test log')
        assert(recordid == '559d912c-b153-4a94-ac5d-9d8215ea9e29')
    })
    it('Find non-existent record', async() => {
        // Declare query string params
        const params = new URLSearchParams([['recordid', 'non-existent']])

        // Make a GET request to the server
        try {
            // Store the response from the server
            var response = await axios.get(baseURL + '/findarecord', {params})
        } catch (err) {
            // If try block fails assert(false)
            assert(false, "Failure: Failed to recieve a response")
        }

        // Read the record fields from the response
        const error = response.data.error

        // Assert response is correct
        assert(error == 'Something went wrong. Cannot read properties of undefined (reading \'doctorUsername\')')
    })
})

describe('Tests: \'/registerpatientinfo\'', async() => {
    it('Update the info of an existing patient', async() => {
        // Declare the body of the request
        const body = {
            userid: 'axios_patient_write',
            email: 'Danielj@gmail.com',
            firstname: 'Daniel',
            lastname: 'Jones',
            dateofbirth: '10/17/1991',
            healthcardnumber: '123333333',
            phonenumber: '517-458-7544',
            address: '30 Sunview St, Waterloo ON',
            postalcode: 'N2L 0N2'
        }

        // Send the POST request to the server
        const response = await axios.post(baseURL + '/registerpatientinfo', body)

        // Assert we get a 200 status code
        assert(response.status == 201 || response.status == 200)
    })
})

describe('Tests: \'/registerdoctor\'', async() => {
    it('Update the info of an existing doctor', async() => {
        // Declare the body of the request
        const body = {
            doctorid: 'axios_doctor_write',
            clinic: 'Waterloo Central',
            email: 'johnd@gmail.com',
            firstname: 'John',
            lastname: 'Doe',
            phonenumber: '517-456-7458',
            specialization: 'Eye Doctor',
            staffID: '423423'
        }

        // Send the POST request to the server
        const response = await axios.post(baseURL + '/registerdoctorinfo', body)

        // Assert we get a 200 status code
        assert(response.status == 201 || response.status == 200)
    })
})

describe('Tests: \'/registerrecord\'', async() => {
    it('Can successfully post a valid record', async() => {
        // Declare the body of the request
        const body = {
            date: '10/10/2023',
            doctorUsername: 'e2e_doctor',
            log: 'Test log from the axios tests',
            patientUsername: 'e2e_patient',
            subject: 'Axios Test Record',
        }

        // Send the POST request to the server
        const response = await axios.post(baseURL + '/registerrecord', body)

        // Assert we get a 200 status code
        assert(response.status == 201)
    })
})