const WebTorrent = require('webtorrent');
const path = require('path');
const model = require('../model');
const schedule = require('node-schedule');        //用户开启定时任务
const seedFiles = require('../seed/seed-engine');
const mkdir = require('make-dir');
const mv = require('mv');
const uuid = require('node-uuid');

String.prototype.trim = function () {
    return this.replace(/(^\s*)|(\s*$)/g, "");
};

let {
    Movie,
    Magnet,
} = model;

let client = new WebTorrent();
let movies = [];

let tempPath = path.join('static/download');
let savePath = path.join('static/uploads');


//提前创建好文件夹保存下载的电影
mkdir('static/download')
    .then(path => {
        console.log(`create path: ${path}`);
    });


/**
 * 下载movie对象中的磁力链接，并且在下载完成后将isDownload标志位置1，并写回数据库
 * @param movie
 * @param client
 */
function download(movie, client) {
    movie.getMagnets({
        order: [['failedTime', 'ASC']]
    })
        .then(magnets => {
            if(magnets.length === 0)
                return;
            let magnet = magnets[0].magnet;
            if (magnet.trim() === '' || !magnet.startsWith('magnet'))
                return;
            console.log(new Date() + ': add download ==> ' + magnet);
            client.add(magnet, {
                path: tempPath,       //设置下载文件的路径
            }, torrent => {      //called when this torrent is ready to be used.   ==> equal to    client.on('torrent', callback);
                movie.my_torrent = torrent;
                torrent.on('download', bytes => { //Emitted whenever data is downloaded. Useful for reporting the current torrent status, for instance:
                });

                torrent.on('error', err => {
                    console.log('download error: ' + err);
                });
                torrent.on('done', function () {
                    console.log('torrent finished downloading');
                    let file = torrent.files.find(file => {
                        return file.name.endsWith('.mp4') || file.name.endsWith('.rmvb');
                    });
                    if(!file)
                        return;
                    /**
                     * 将下载完成的电影移到uploads文件夹当中
                     */
                    let targetSavePath = path.join(savePath, uuid() + file.name);
                    mv(path.join(tempPath, file.name), targetSavePath, {
                        mkdirp: true,       //是否递归创建目录
                    }, err => {
                        console.log(err);
                        if (!err || err.code !== 'EEXIST') {
                            Movie.update({
                                isDownload: 1,
                                size: file.length,
                                downloadPath: path.join(savePath, file.name),
                                md5: md5,
                            }, {
                                where: {
                                    id: movie.id
                                }
                            });
                            // seedFiles(targetSavePath)
                            //     .then(torrent, md5 => {
                            //         //下载完成则将其标识为已下载
                            //         Movie.update({
                            //             isDownload: 1,
                            //             size: file.length,
                            //             downloadPath: path.join(savePath, file.name),
                            //             md5: md5,
                            //         }, {
                            //             where: {
                            //                 id: movie.id
                            //             }
                            //         });
                            //         Magnet.create({
                            //             magnet: torrent.magnetURI,
                            //         })
                            //             .then(magnet => {
                            //                 movie.addMagnet(magnet);
                            //             })
                            //             .catch(err => {
                            //                 console.log(err);
                            //             });
                            //     })
                            //     .catch(err => {
                            //         console.log(err);
                            //     });
                        }
                    });

                })
            });
        });

}


/**
 * Emitted when the client encounters a fatal error. The client is automatically destroyed and all torrents are removed and cleaned up when this occurs.
 * Always listen for the 'error' event.
 */
client.on('error', err => {
    console.log(err);
});


function findMovieAndDownload(client) {
    Movie.findAndCountAll({
        where: {
            isDownload: 0,
        },
        order: [
            ['failedTime', 'ASC']
        ],       //按失败次数排序，失败次数越多，得到执行的可能性越小
        limit: 50,
    })
        .then(result => {
            result.rows.forEach(movie => {
                movies.push(movie);
                download(movie, client);
            });
        });
}


function beginScheduleDownload() {
    console.log('begin a schedule task to download movie. (crawler per twice hour).....');
    findMovieAndDownload(client);
    let rule = new schedule.RecurrenceRule();
    rule.second = 1;
    rule.minute = 1;
    rule.hour = [0, 4, 8, 12, 16, 20];
    schedule.scheduleJob(rule, () => {
        movies.forEach(movie => {
            if (!movie.my_torrent) {      //如果没有获取到种子文件，下载失败次数+1
                Movie.update({
                    failedTime: movie.failedTime + 1,
                }, {
                    where: {
                        id: movie.id
                    }
                });
            }
        });
        movies = [];    //清空Movie列表
        client.destroy(() => {
            client = new WebTorrent();
            findMovieAndDownload(client);
        })
    })
}

module.exports = {
    beginScheduleDownload,
    findMovieAndDownload,
};

