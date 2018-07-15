const db = require('../db');

const ShareWebsite = db.defineModel("share_website", {
    title: {
        type: db.STRING(100),
        defaultValue: '',
    },
    website: {
        type: db.STRING(200),
        defaultValue: '',
        unique: true,
    },
    description: {
        type: db.STRING(1000),
        defaultValue: '',
    },
    cover: {
        type: db.STRING(200),
        defaultValue: '',
    },
    category: {
        type: db.STRING(50),
        defaultValue: '默认',
    }
});

// ShareWebsite.sync({alter: true});

module.exports = ShareWebsite;