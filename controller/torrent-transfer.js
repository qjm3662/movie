const redis = require('redis');
const randomString = require('random-string');
const bluebird = require("bluebird");

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const REDIS_PORT = 6379;
const REDIS_HOST = '127.0.0.1';
const REDIS_OPTS = {};

let client = redis.createClient(REDIS_PORT, REDIS_HOST, REDIS_OPTS);

const pushTorrentId = async ctx => {
    let {torrentId} = ctx.request.body;
    let randCode = randomString({
        length: 4
    });
    client.set(randCode, torrentId, () => {
    });
    ctx.easyResponse.success(randCode);
};

const getTorrentIdByCode = async ctx => {
    let {code} = ctx.query;
    try {
        let reply = await client.getAsync(code);
        ctx.easyResponse.success(reply);
    } catch (e) {
        console.log(e);
        ctx.easyResponse.error('Not Found');
    }
};

module.exports = {
    'POST /pushId': pushTorrentId,
    'GET /getId': getTorrentIdByCode,
};