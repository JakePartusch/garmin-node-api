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
    const loginQuery = querystring.stringify({
      embed: 'false',
      password: this.password,
      username: this.username
    });

    const loginRequestQuery = querystring.stringify({
      service: 'https://connect.garmin.com/post-auth/login',
      clientId: 'GarminConnect',
      gauthHost: 'https://sso.garmin.com/sso',
      consumeServiceTicket: 'false'
    });

    let response = await axios.post(
      `https://sso.garmin.com/sso/login?${loginRequestQuery}`,
      loginQuery
    );
    let loginResponse = response.data;
    if (loginResponse.includes('Login Successful')) {
      let ticketRegex = /ticket=([^\"]+)\"/;
      let ticket = loginResponse.match(ticketRegex)[1];
      console.log('Login OK. Ticket: ' + ticket);
      this.username = await this.getUsername();
      console.log('Using username ' + this.username);
    } else {
      console.log('Login Failed');
    }
  }

  async getSteps(fromDate, untilDate) {
    const url = `https://connect.garmin.com/modern/proxy/userstats-service/wellness/daily/${
      this.username
    }?fromDate=${fromDate}&untilDate=${untilDate}&metricId=29&metricId=38&grpParentActType=false`;
    let response = await axios.get(url);
    return response.data;
  }

  async getUsername() {
    try {
      const url =
        'https://connect.garmin.com/modern/currentuser-service/user/info';
      let response = await axios.get(url);
      return response.data.username;
    } catch (e) {
      console.log(e);
    }
    return null;
  }

  async getActivities(fromDate, untilDate) {
    const url = `https://connect.garmin.com/modern/proxy/userstats-service/activities/daily/${
      this.username
    }?fromDate=${fromDate}&untilDate=${untilDate}&metricId=17&grpParentActType=true`;
    let response = await axios.get(url);
    return response.data;
  }

  async getDailyHeartRate(date) {
    const url = `https://connect.garmin.com/modern/proxy/wellness-service/wellness/dailyHeartRate/${
      this.username
    }?date=${date}`;
    let response = await axios.get(url);
    return response.data;
  }

  async getDailySleep(date) {
    const url = `https://connect.garmin.com/modern/proxy/wellness-service/wellness/dailySleep/user/${
      this.username
    }?date=${date}`;
    let response = await axios.get(url);
    return response.data;
  }
};
