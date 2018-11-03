'use strict'

jest.mock('axios')
const axios = require('axios')
const querystring = require('querystring')

const GarminNodeApi = require('../index')
const USERNAME = 'USERNAME'
const PASSWORD = 'PASSWORD'
const api = new GarminNodeApi(USERNAME, PASSWORD)

const MOCK_LOGIN_RESPONSE = {
  data: 'Login Successful,ticket=blabla"'
}
const MOCK_USER_INFO_RESPONSE = {
  data: {
    displayName: 'UserName'
  }
}

describe('GarminNodeApi', () => {
  test('login()', async () => {
    axios.post.mockReturnValue(MOCK_LOGIN_RESPONSE)
    axios.get.mockReturnValue(MOCK_USER_INFO_RESPONSE)
    await api.login()
    const loginQuery = querystring.stringify({
      embed: 'false',
      password: PASSWORD,
      username: USERNAME
    })

    const loginRequestQuery = querystring.stringify({
      service: 'https://connect.garmin.com/modern/',
      webhost: 'https://connect.garmin.com',
      source: 'https://connect.garmin.com/en-US/signin',
      clientId: 'GarminConnect',
      gauthHost: 'https://sso.garmin.com/sso',
      consumeServiceTicket: 'false'
    })
    const URL_LOGIN = 'https://sso.garmin.com/sso/login?'
    const URL_USER_INFO = 'https://connect.garmin.com/modern/currentuser-service/user/info'
    expect(axios.post).toHaveBeenCalledWith(`${URL_LOGIN}${loginRequestQuery}`, loginQuery)
    expect(axios.get).toHaveBeenCalledWith(URL_USER_INFO)
  })
})
