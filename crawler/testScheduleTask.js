let schedule = require('node-schedule');

function scheduleCronStyle() {
    schedule.scheduleJob('1-10 * * * * *', () => {
        console.log('scheduleCronStyle:' + new Date());
    });
}

scheduleCronStyle();