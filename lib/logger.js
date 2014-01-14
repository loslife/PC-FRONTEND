/**
 * Created with JetBrains WebStorm.
 * User: huangzhi
 * Date: 13-6-1
 * Time: 下午3:02
 * To change this template use File | Settings | File Templates.
 */

var log4js = require('log4js');

log4js.configure({
    appenders: [
        {
            type: 'file', //文件输出
            filename: 'logs/access.log',
            maxLogSize: 2*1024*1024,
            backups:3,
            category: 'access'
        }
    ]
});


var logger = log4js.getLogger('access');
logger.setLevel('DEBUG');

module.exports = {
    getLogger: function () {
       return logger;
    }
}