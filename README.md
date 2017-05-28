# Requirements
This project uses `async`/`await`

`node v7.6.0+`

# Usage
```javascript
const GarminNodeApi = require('./index.js');

async function getUsername() {
    let api = new GarminNodeApi("YOUR_USERNAME", "YOUR_PASSWORD");
    await api.login();
    var stepData = await api.getSteps();
    console.log(stepData);
}

getUsername();
```