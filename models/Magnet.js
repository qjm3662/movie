const db = require('../db');

const Magnet = db.defineModel('magnets', {
    magnet: {
        type: db.STRING(500),
        defaultValue: '',
    },
    failedTime: {
        type: db.INTEGER,
        defaultValue: 0
    },
});

module.exports = Magnet;