const axios = require('axios').default;
const axiosCookieJarSupport = require('@3846masa/axios-cookiejar-support')
  .default;
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
      service: 'https://connect.garmin.com/modern/',
      webhost: 'https://connect.garmin.com',
      source: 'https://connect.garmin.com/en-US/signin',
      clientId: 'GarminConnect',
      gauthHost: 'https://sso.garmin.com/sso',
      consumeServiceTicket: 'false'
    });

    const response = await axios.post(
      `https://sso.garmin.com/sso/login?${loginRequestQuery}`,
      loginQuery
    );
    if (response.data.includes('Login Successful')) {
      let ticketRegex = /ticket=([^\"]+)\"/;
      let ticket = response.data.match(ticketRegex)[1];
      this.username = await this.getUsername();
    } else {
      throw 'Login Failed';
    }
  }

  async getSteps(fromDate, untilDate) {
    const url = `https://connect.garmin.com/modern/proxy/userstats-service/wellness/daily/${
      this.username
    }?fromDate=${fromDate}&untilDate=${untilDate}&metricId=29&metricId=38&grpParentActType=false`;
    const response = await axios.get(url);
    return response.data;
  }

  async getUsername() {
    const url =
      'https://connect.garmin.com/modern/currentuser-service/user/info';
    let response = await axios.get(url);
    return response.data.displayName;
  }

  async getActivities(fromDate, untilDate) {
    const url = `https://connect.garmin.com/modern/proxy/userstats-service/activities/daily/${
      this.username
    }?fromDate=${fromDate}&untilDate=${untilDate}&metricId=17&grpParentActType=true`;
    const response = await axios.get(url);
    return response.data;
  }

  async getDailyHeartRate(date) {
    const url = `https://connect.garmin.com/modern/proxy/wellness-service/wellness/dailyHeartRate/${
      this.username
    }?date=${date}`;
    const response = await axios.get(url);
    return response.data;
  }

  async getDailySleep(date) {
    const url = `https://connect.garmin.com/modern/proxy/wellness-service/wellness/dailySleep/user/${
      this.username
    }?date=${date}`;
    const response = await axios.get(url);
    return response.data;
  }
};
