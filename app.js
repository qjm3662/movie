const Koa = require('koa');
const controller = require('./controllers');
const bodyParser = require('koa-bodyparser');
const combineMiddleWare = require('./middleware');
const cors = require('koa2-cors');
// const {
//     getRedisClient
// } = require('./tools/redis-client');
//
// getRedisClient(client => {
//    client.flushdb();
// });
const {
    beginScheduleCrawler
} = require('./crawler/crawler-engine');

const {
    beginScheduleDownload
} = require('./download_movie/download-engine');

const app = new Koa();

combineMiddleWare(app, __dirname);
app.use(bodyParser());
app.use(cors());
app.use(controller());

app.listen(4897);
console.log('app started at port 4897...');

// /**
//  * 开启定时爬虫的任务
//  */
// beginScheduleCrawler();


/**
 * 开启定时下载任务
 */
beginScheduleDownload();
