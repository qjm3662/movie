const {
    createWebThumbnails
} = require('../tools/web-thumbnail-getter');
const {
    getThumbnails
} = require('../tools/image-magick');
const url = require('url');
const mkdir = require('make-dir');
const path = require('path');
const model = require('../model');

mkdir('static/thumbnails')
    .then(path => {
        console.log(`create path: ${path}`);
    });

const BASE_THUMBNAILS_PATH = 'static/thumbnails';
const BASE_PATH = 'thumbnails';
const ShareWebsite = model.ShareWebsite;

const pushWebsite = async ctx => {
    const {
        title,
        website,
        description,
        category,
    } = ctx.request.body;
    const urlObj = url.parse(website);
    console.log(website);
    const savePath = path.join(BASE_THUMBNAILS_PATH, urlObj.host);
    try{
        const sp = await createWebThumbnails(website, `${savePath}.png`);
        await getThumbnails(sp, `${savePath}-thumb.png`, 204, 120);
        const result = `${path.join(BASE_PATH, urlObj.hostname)}-thumb.png`;
        ctx.easyResponse.success(result);
        ShareWebsite.create({
            title: title,
            website: website,
            description: description,
            cover: result,
            category: category,
        });
    } catch (e) {
        console.log(e);
        ctx.easyResponse.error(e.message);
    }


};

const getWebsites = async ctx => {
    const page = +ctx.query.page,          //页数
        size = +ctx.query.size || 10,           //每页的数量
        orderProp = ctx.query.orderProp,        //排序的属性
        order = ctx.query.order || 'ASC',       //排序方式。 ASC=>升序，DESC=>降序
        category = ctx.query.category;
    let findParams = {
        where: {
            category: {
                $like: `%${category}%`
            }
        },
    };

    //如果需要分页，就添加分页功能
    if(page){
        findParams.offset = (page - 1) * size;
        findParams.limit = size;
    }

    //排序功能
    if (orderProp && (order === 'ASC' || order === 'DESC')) {
        findParams.order = [
            [orderProp, order]
        ];
    }
    let result = await ShareWebsite.findAll(findParams);
    ctx.easyResponse.success(result);
};


const queryShareWebsite = async ctx => {
    const page = +ctx.query.page,          //页数
        size = +ctx.query.size || 10,           //每页的数量
        orderProp = ctx.query.orderProp,        //排序的属性
        order = ctx.query.order || 'ASC',       //排序方式。 ASC=>升序，DESC=>降序
        keywords = ctx.query.keywords;
    let findParams = {
        where: {
            $or: {
                title: {
                    $like: `%${keywords}%`
                },
                description: {
                    $like: `%${keywords}%`
                }
            }
        },
    };

    //如果需要分页，就添加分页功能
    if(page){
        findParams.offset = (page - 1) * size;
        findParams.limit = size;
    }

    //排序功能
    if (orderProp && (order === 'ASC' || order === 'DESC')) {
        findParams.order = [
            [orderProp, order]
        ];
    }

    try {
        let result = await ShareWebsite.findAll(findParams);
        ctx.easyResponse.success(result);
    } catch (e) {
        ctx.easyResponse.error(e.message);
    }
};

module.exports = {
    'POST /pushWebsite': pushWebsite,
    'GET /getWebsite': getWebsites,
    'GET /queryShareWebsite': queryShareWebsite,
};