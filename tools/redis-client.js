const redis = require('redis');
const thunky = require('thunky');

const REDIS_PORT = 6379;
const REDIS_HOST = '127.0.0.10';
const REDIS_OPTS = {};

const getRedisClient = thunky(cb => {
   cb(redis.createClient(REDIS_PORT, REDIS_HOST, REDIS_OPTS));
});

getRedisClient(client => {
   client.on('error', err => {
       console.log(new Date() + ": " + err);
   })
});
module.exports = {
    getRedisClient
};