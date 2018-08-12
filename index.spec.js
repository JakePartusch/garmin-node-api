const GarminNodeApi = require('./index.js');

async function fetchLotsOfData() {
  let api = new GarminNodeApi('USERNAME', 'PASSWORD');
  try {
    await api.login();
    console.log(await api.getSteps('2018-08-01', '2018-08-02'));
    console.log(await api.getActivities('2018-08-01', '2018-08-02'));
    console.log(await api.getDailyHeartRate('2018-08-01'));
    console.log(await api.getDailySleep('2018-08-01'));
  } catch (e) {
    console.error(e);
  }
}

(() => {
  fetchLotsOfData();
})();
