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

        var response = await axios.post('https://sso.garmin.com/sso/login?' + requestQuery, loginQuery);
        var loginResponse = response.data;
        if(loginResponse.includes('Login Successful')) {
            var ticketRegex = /ticket=([^\"]+)\"/;
            var ticket = loginResponse.match(ticketRegex)[1];
            console.log('Login OK. Ticket: ' + ticket)
            try {
                var url = 'https://connect.garmin.com/modern/?ticket=' + ticket
                response = await axios.post(url)
                var modernResponse = response.data;
                var displayNameRegex = /displayName\\\":\\\"([^\"]+)\\\",/;
                this.displayName = modernResponse.match(displayNameRegex)[1];
                console.log('Display name is ' + this.displayName)
            } catch (e)
            {
                console.log(e)
            }
        } else {
            console.log('Login Failed');
        }
    }

    async getSteps(fromDate, untilDate) {
        var url = 'https://connect.garmin.com/modern/proxy/userstats-service/wellness/daily/'+ this.displayName + '?fromDate=' + fromDate + '&untilDate=' + untilDate + '&metricId=29&metricId=38&grpParentActType=false';
        var response = await axios.get(url);
        return response.data;
    }

    async getUsername() {
        try {
            var url = 'https://connect.garmin.com/modern/'
            var response = await axios.get(url)
            var modernResponse = response.data;
            var displayNameRegex = /displayName\\\":\\\"([^\"]+)\\\",/;
            return modernResponse.match(displayNameRegex)[1];
        } catch (e)
        {
            console.log(e)
        }
        return null;
    }

    async getActivities(fromDate, untilDate)
    {
        var url = 'https://connect.garmin.com/modern/proxy/userstats-service/activities/daily/'+this.displayName+'?fromDate='+fromDate+'&untilDate='+untilDate+'&metricId=17&grpParentActType=true';
        var response = await axios.get(url)
        return response.data;
    }

    async getDailyHeartRate(date)
    {
        var url = 'https://connect.garmin.com/modern/proxy/wellness-service/wellness/dailyHeartRate/'+this.displayName+'?date='+date;
        var response = await axios.get(url)
        return response.data;
    }

    async getDailySleep(date)
    {
        var url = 'https://connect.garmin.com/modern/proxy/wellness-service/wellness/dailySleep/user/'+this.displayName+'?date='+date;
        var response = await axios.get(url)
        return response.data;
    }
}