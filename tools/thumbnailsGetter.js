//////////////////////////////////////////////////////////////////////////////////////////////////
////////  这是一个工具函数，用于从视屏中提取一帧作为缩略图
//////////////////////////////////////////////////////////////////////////////////////////////////


const FfmpegCommand = require('fluent-ffmpeg');


function getScreenShot(fileName, forder, thumbnailsForder) {
    return new Promise((resolve, reject) => {
        let ffmpeg = FfmpegCommand(forder + fileName);
        let fns = [];
        ffmpeg
            .on('filenames', function (filenames) {
                fns = filenames;
            })
            .on('end', function() {
                resolve(fns);
            })
            .on('error', reject)
            .screenshots({
                timestamps: ['1%'],
                filename: fileName + '-thumbnail.png',
                folder: thumbnailsForder,
                // size: '320x240'
            });
    });

}

module.exports = {
    getScreenShot,
};