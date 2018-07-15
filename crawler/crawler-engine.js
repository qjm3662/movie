let schedule = require('node-schedule');        //用户开启定时任务
let dytt = require('./dytt-crawler');

let crawlers = [];
crawlers.push(dytt);


function beginCrawler() {
    crawlers.forEach(engine => {
        engine.doCrawler();
    })
}

/**
 * 开始定期爬虫任务
 * 每隔两个小时爬虫一次
 */
function beginScheduleCrawler() {
    console.log('begin a schedule task to crawler movie. (crawler per twice hour).....');
    beginCrawler();
    let rule = new schedule.RecurrenceRule();
    rule.second = 1;
    rule.minute = 1;
    rule.hour = [];
    for (let i = 0; i <= 22; i += 2) {
        rule.hour.push(i);
    }
    schedule.scheduleJob(rule, () => {
        beginCrawler()
    });
}

module.exports = {
    beginScheduleCrawler,
};

