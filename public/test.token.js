const axios = require('axios');
const { URLSearchParams } = require('url');
// const token = require('./token');

const SERVER_URL = 'http://localhost:3000';

// Test valid credentials
const postData = {
    username: 'user1',
    password: 'password1',
};

const formData = new URLSearchParams(postData).toString();
axios
    .post(`${SERVER_URL}/login`, formData, {
        headers: {
            'Content-type': 'application/x-www-form-urlencoded',
        },
    })
    .then((response) => {
        const token = response.data.token;
        console.log('Valid credentials response:', response.data);

        // Test /secure endpoint with the obtained token
        axios
            .get(`${SERVER_URL}/secure`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((secureResponse) => {
                console.log('/secure endpoint response:', secureResponse.data);
            })
            .catch((error) => {
                console.error('/secure endpoint error:', error.response.data);
            });
    })
    .catch((error) => {
        console.error('Error with valid credentials:', error.response.data);
    });
