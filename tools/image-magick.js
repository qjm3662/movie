const gm = require('gm');

function getThumbnails(src, des, width, height) {
    return new Promise((resolve, reject) => {
        gm(src).options({
            imageMagick: true
        }).thumb(width, height, des, 100, (err, stdout, stderr, command) => {
            if(err)
                reject(err);
            else
                resolve();
        });
    });
}

module.exports = {
    getThumbnails,
};