const superagent = require('superagent'),
    cheerio = require('cheerio'),
    async = require('async'),
    model = require('../model'),
    {createIssue} = require('../tools/init-gittalk');

const Movie = model.Movie;
const Magnet = model.Magnet;

/**
 * 引入 superagent-charset 库扩展 superagent 对象，使其支持设置编码格式
 */
require('superagent-charset')(superagent);

/**
 * 引入代理库
 */
require('superagent-proxy')(superagent);


/**
 * String对象的扩展，使其支持 trim() 操作
 * @returns {string}
 */
String.prototype.trim = function () {
    return this.replace(/(^\s*)|(\s*$)/g, "");
};


const TRANSLATION_NAME = "译　　名";
const MOVIE_NAME = "片　　名";
const RELEASE_TIME = "上映日期";
const CATEGORY = "类　　别";
const SUBTITLE = "字　　幕";
const PRODUCE_PLACE = "产　　地";
const INTRODUCTION = "简　　介";
const DIVIDE_TAG = "◎";


/**
 * 根据爬虫得到的文字，构建一个Movie对象
 * @param initParam
 * @param textArr
 * @returns {Promise<any>}
 */
function buildMovie(initParam, textArr) {
    return new Promise((resolve, reject) => {
        let params = initParam;
        textArr.forEach(value => {
            if (value.startsWith(MOVIE_NAME)) {
                params.movieName = value.substring(MOVIE_NAME.length).trim();
            } else if (value.startsWith(TRANSLATION_NAME)) {
                params.translationName = value.substring(TRANSLATION_NAME.length).trim();
            } else if (value.startsWith(RELEASE_TIME)) {
                params.releaseTime = value.substring(RELEASE_TIME.length).trim();
            } else if (value.startsWith(PRODUCE_PLACE)) {
                params.producePlace = value.substring(PRODUCE_PLACE.length).trim();
            } else if (value.startsWith(SUBTITLE)) {
                params.subtitle = value.substring(SUBTITLE.length).trim();
            } else if (value.startsWith(CATEGORY)) {
                params.category = value.substring(CATEGORY.length).trim();
            } else if (value.startsWith(INTRODUCTION)) {
                params.introduction = value.substring(INTRODUCTION.length).trim();
            }
        });
        params.mime = 'video/';
        Movie.findOne({
            where: {
                movieName: params.movieName,
                releaseTime: params.releaseTime,
            }
        })
            .then(movie => {
                if (movie) {      //存在就不插入了
                    reject('已存在，不插入');
                } else {
                    Movie.create(params)
                        .then(movie => {
                            if(movie) {
                                Magnet.create({
                                    magnet: initParam.magnet,
                                }).then(magnet => {
                                    movie.addMagnet(magnet);
                                    resolve(movie);
                                }).catch(err => {
                                    console.log(err);
                                    reject(err);
                                });
                            }
                            else
                                reject("插入失败");
                        })
                        .catch(err => {
                            reject(err);
                        });
                }
            })
            .catch(err => {
                reject(err);
            })

    });
}


/**
 * 爬取电影天堂一个电影详情页的电影信息
 * @param url
 * @param charset
 */
function crawlerMovieAndSave(url, charset) {
    superagent
        .get(url)
        .charset(charset)
        .set('user-agent', 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.62 Safari/537.36')
        .end((err, res) => {
            if (!err) {
                let $ = cheerio.load(res.text);
                let zoom = $('#Zoom');
                let textArr = zoom.text().split(DIVIDE_TAG);
                let magnet = zoom
                    .find('table tbody tr td a')
                    .eq(1).prop('href');
                let cover = zoom.find('p img')
                    .first()
                    .prop('src');
                Movie.findOne({
                    where: {
                        originUrl: url
                    }
                }).then(result => {
                    if (!!result && result.length > 0) { //存在则忽略
                        console.log('重复不添加：' + url);
                    } else {
                        buildMovie({
                            magnet: magnet,
                            cover: cover,
                            originUrl: url,
                        }, textArr)
                            .then(movie => {
                                createIssue("即享", '', ['Gitalk', movie.id])
                            }).catch(err => {
                            console.log('failed: ' + err);
                        });
                    }
                });
            } else {
                console.log(err);
            }
        });
}

/**
 * 'https://www.dy2018.com/html/gndy/dyzz/index_2.html'
 * @param url
 * @param charset
 */
function crawlerAPage(url, charset) {
    superagent
        .get(url)
        .charset(charset)
        .set('user-agent', 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.62 Safari/537.36')
        .set('authority', 'www.dy2018.com')
        .set('accept-language', 'zh-CN,zh;q=0.9')
        .end((err, res) => {
            if (!err) {
                let $ = cheerio.load(res.text);
                let paths = [];
                $('.ulink').each((index, link) => {
                    paths.push('http://' + res.request.host + link.attribs.href)
                });

                async.mapLimit(paths, 5, async function f(url) {
                    crawlerMovieAndSave(url, charset);
                })
            } else {
                console.log(err);
            }
        });
}

/**
 * 现在每次是爬取电影天堂两页
 */
function doCrawler() {
    let BASE_URL = 'https://www.dy2018.com/html/gndy/dyzz/';
    let urls = [BASE_URL];
    urls.push(BASE_URL + 'index_2.html');

    /**
     * 用作并发，同时爬取5个页面
     */
    async.mapLimit(urls, 5, async function f(url) {
        crawlerAPage(url, 'gb2312');
    })
}

module.exports = {
    doCrawler
};