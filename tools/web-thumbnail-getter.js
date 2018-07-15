const phantom = require('phantom');


function createWebThumbnails(url, savePath) {
    return new Promise(async (resolve, reject) => {
        const client = await phantom.create();
        client.createPage()
            .then(async page => {
                try {
                    let width = 1024;
                    let height = 600;
                    await page.property('viewportSize', {width: width, height: height});
                    const status = await page.open(url);
                    page.evaluate(function (w, h) {
                        document.body.style.width = w + "px";
                        document.body.style.height = h + "px";
                    }, width, height);
                    await page.property('clipRect', {top: 0, left: 0, width: width, height: height});
                    if (status === 'success') {
                        setTimeout(async () => {
                            await page.render(savePath);
                            resolve(savePath);
                            client.exit();
                        }, 1000)
                    } else {
                        reject(status);
                        client.exit();
                    }
                } catch (e) {
                    console.log(e);
                    client.exit();
                    reject(e);
                }
            })
            .catch(reject);
    });
}

module.exports = {
    createWebThumbnails,
};
