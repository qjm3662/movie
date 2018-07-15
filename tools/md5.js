let fs = require('fs');
let crypto = require('crypto');

/**
 * 一个计算文件MD5的函数
 * @param path
 * @returns {Promise<any>}
 */
function getMd5(path) {
    return new Promise((resolve, reject) => {
        let start = new Date().getTime();
        let md5sum = crypto.createHash('md5');
        let stream = fs.createReadStream(path);
        stream.on('data', function(chunk) {
            md5sum.update(chunk);
        });
        stream.on('end', function() {
            str = md5sum.digest('hex');
            console.log('文件:'+path+',MD5签名为:'+str+'.耗时:'+(new Date().getTime()-start)/1000.00+"秒");
            resolve(str);
        });
        stream.on('error', reject);
    });
}

module.exports = {
    getMd5,
};