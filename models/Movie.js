const db = require('../db');

const Movie = db.defineModel('movies', {
    movieName: {type: db.STRING(500), defaultValue: ''},
    translationName: {type: db.STRING(500), defaultValue: ''},
    releaseTime: {type: db.STRING(500), defaultValue: ''},
    producePlace: {type: db.STRING(500), defaultValue: ''},
    subtitle: {type: db.STRING(500), defaultValue: ''},
    category: {type: db.STRING(200), defaultValue: ''},
    introduction: {type: db.STRING(2000), defaultValue: ''},
    cover: {type: db.STRING(200), defaultValue: ''},
    // magnet: {type: db.STRING(500), defaultValue: ''},
    isDownload: {
        type: db.BOOLEAN,
        defaultValue: 0,
    },
    size: {
        type: db.BIGINT,
        defaultValue: 0
    },
    downloadPath: {type: db.STRING(200), defaultValue: ''},
    originUrl: {
        type: db.STRING(200),
        defaultValue: ''
    },
    md5: {
        type: db.STRING(64),
        defaultValue: ''
    },
    failedTime: {
        type: db.INTEGER,
        defaultValue: 0
    },
    mime: {
        type: db.STRING(100),
        default: ''
    }
});


// Movie.sync({alter: true});
module.exports = Movie;