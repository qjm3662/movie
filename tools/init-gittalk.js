const superagent = require('superagent');
/**
 * 引入 superagent-charset 库扩展 superagent 对象，使其支持设置编码格式
 */
require('superagent-charset')(superagent);


function createIssue(title, body, labels) {
    superagent
        .post("https://api.github.com/repos/SunnyQjm/movie_web/issues")
        .auth("SunnyQjm", "360f77b9f3dd9ed3fd5f025d99cfe93129cb5350")
        .set('Content-Type', 'application/json')
        .send({
            "title": title,
            "body": body,
            "labels": labels
        })
        .end((err, response) => {
            if(err){
                console.log(err);
            } else {
                console.log(response)
            }
        });
}

module.exports = {
    createIssue
};
