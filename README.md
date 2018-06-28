# Requirements
This project uses `async`/`await`

`node v7.6.0+`

# Usage
`npm install --save garmin-node-api`

```javascript
const GarminNodeApi = require('garmin-node-api');

async function getStepData() {
    let api = new GarminNodeApi("YOUR_USERNAME", "YOUR_PASSWORD");
    await api.login();
    var stepData = await api.getSteps();
    console.log(stepData);
}
```

# Methods

#### login()
Uses the supplied user/pass to hit the login api. The cookies obtained from this
call are used in subsequent requests.

#### getSteps(fromDate, untilDate)
Returns step and goal count for each day within the specified range:

`getSteps('2017-01-01', '2017-05-01')`

#### getUsername()
Returns the logged in username. Can be used to check if the login cookies are valid

##### getActivities(fromDate, untilDate)
Returns activities

`getActivities('2017-01-01', '2017-05-01')`

#### getDailyHeartRate(date)
Returns daily heart rate

`getDailyHeartRate('2017-01-01')`

#### getDailySleep(date)
Returns daily sleep

`getDailySleep('2017-01-01')`