//////////////////////////////////////////////////////////////////
/////// 这个脚本用于初始化，将已经下载的文件信息插入到数据库当中
////////////////////////////////////////////////////////////////////

const model = require('../model');
const fs = require('fs');
const path = require('path');
const {
    getScreenShot
} = require('./thumbnailsGetter');
const {
    getMd5
} = require('./md5');
const seedFiles = require('../seed/seed-engine');

let Movie = model.Movie;
let MOVIE_ROOT = 'static/uploads/';
let SCREEN_SHOT_ROOT = 'static/thumbnails/';

let MOVIE_ROOT_CUR = '../static/uploads/';
let SCREEN_SHOT_ROOT_CUR = '../static/thumbnails/';


(async () => {
    let files = fs.readdirSync(MOVIE_ROOT_CUR);

    files.forEach(ele => {
        let stat = fs.statSync(path.join(MOVIE_ROOT_CUR, ele));
        console.log(stat);
        console.log(ele);
        getMd5(path.join(MOVIE_ROOT_CUR, ele))
            .then(md5 => {
                console.log(md5);
                getScreenShot(ele, path.join(__dirname, MOVIE_ROOT_CUR), path.join(__dirname, SCREEN_SHOT_ROOT_CUR))
                    .then(fns => {
                        seedFiles(path.join(MOVIE_ROOT_CUR, ele), torrent => {
                            if(fns.length > 0)
                                Movie.create({
                                    movieName: ele,
                                    cover: SCREEN_SHOT_ROOT + fns[0],
                                    md5: md5,
                                    size: stat.size,
                                    isDownload: 1,
                                    downloadPath: MOVIE_ROOT + ele,
                                    magnet: torrent.magnetURI,
                                });
                        })
                    })
                    .catch(err => {
                        console.log(err);
                    });
            })
            .catch(err => {
                console.log(err);
            });
    })
})();
