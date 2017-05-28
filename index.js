const axios = require('axios');
const axiosCookieJarSupport = require('@3846masa/axios-cookiejar-support');
const tough = require('tough-cookie');
const querystring = require('querystring');

module.exports = class GarminNodeApi {

    constructor(username, password) {
        this.username = username;
        this.password = password;
        axiosCookieJarSupport(axios);
        const cookieJar = new tough.CookieJar();

        axios.defaults.jar = cookieJar;
        axios.defaults.withCredentials = true;
    }

    async login() {
        var loginQuery = querystring.stringify({
          embed: 'false',
          password: this.password,
          username: this.username
        })

        var requestQuery = querystring.stringify({
            'service' : 'https://connect.garmin.com/post-auth/login',
            'clientId' : 'GarminConnect',
            'gauthHost' : 'https://sso.garmin.com/sso',
            'consumeServiceTicket' : 'false'
        });

        var response = await axios.post("https://sso.garmin.com/sso/login?" + requestQuery, loginQuery);
        var loginResponse = response.data;
        if(loginResponse.includes('Login Successful')) {
            var ticketRegex = /ticket=([^\"]+)\"/;
            var ticket = loginResponse.match(ticketRegex)[1];
            try {
                await axios.post('https://connect.garmin.com/post-auth/login?ticket=' + ticket);
            } catch(e)  {
                await axios.get(e.response.headers.location);
            };
        } else {
            console.log('Login Failed');
        }
    }

    async getSteps(fromDate, untilDate) {
        var username = await this.getUsername();
        var response = await axios.get('https://connect.garmin.com/modern/proxy/userstats-service/wellness/daily/'+ username + '?fromDate=' + fromDate + '&untilDate=' + untilDate + '&metricId=29&metricId=38&grpParentActType=false');
        return response.data;
    }

    async getUsername() {
        var response = await  axios.get('https://connect.garmin.com/user/username');
        return response.data.username;
    }
}