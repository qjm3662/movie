const WebTorrent = require('webtorrent'),
    thunky = require('thunky');
// const {
//     getRedisClient
// } = require('../tools/redis-client');
const {
    getMd5
} = require('../tools/md5');

let getClient = thunky(cb => {
    cb(new WebTorrent());
});

getClient(client => {
    client.on('error', err => {
        console.log(err);
    });
});

let host;
const port = 8000;
if(process.env.NODE_ENV === 'test'){
    host = 'localhost'
} else {
    host = '210.30.100.171'
}

console.log(host);

function seedFiles(path) {
    return new Promise((resolve, reject) => {
        getMd5(path)
            .then(md5 => {
                getClient(client => {
                    client.seed(path, {
                        announce: [
                            `http://${host}:${port}/announce`,
                            'udp://0.0.0.0:8000',
                            `udp://${host}:${port}`,
                            `ws://${host}:${port}`,
                        ]
                    }, torrent => {
                        // getRedisClient(redisClient => {
                        //     redisClient.set(md5, torrent.magnetURI, () => {
                        //         console.log('set finish')
                        //     });
                        // });
                        if (resolve)
                            resolve(torrent, md5);
                    })
                });
            })
            .catch(reject);
    });
}

module.exports = seedFiles;
