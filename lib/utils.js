var fs = require("fs");
var program = require('commander');
var _ = require('underscore');


module.exports = {
    readJsonFileSync: readJsonFileSync,
    readJsonFile: readJsonFile,
    md5: md5,
    parseCommand: parseCommand,
    endsWith: endsWith,
    cleanObject: _cleanObject,
    getDateString: _getDateString,
    uid: uid
}
function readJsonFileSync(cfgPath) {
    var data = fs.readFileSync(cfgPath, "UTF-8");
    return JSON.parse(data);
}
function readJsonFile(cfgPath, callback) {
    fs.readFile(cfgPath, "UTF-8", function (err, data) {
        callback(err, JSON.parse(data));
    });
}
function md5(str) {
    var hash = require('crypto').createHash('md5');
    return hash.update(str + "").digest('hex');
}

function uid(len) {
    var buf = []
        , chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        , charlen = chars.length;

    for (var i = 0; i < len; ++i) {
        buf.push(chars[getRandomInt(0, charlen - 1)]);
    }

    return buf.join('');
};

//删除提交数据中不需要提交的数据
function _cleanObject(object) {
    if ("$$hashKey" in object) {
        delete object.$$hashKey;
    }
    object.__proto__ = null;
    for (var p in object) {
        if (p.indexOf("_") == 0 || p.indexOf("$") == 0) {
            delete object[p];
        } else if (_.isObject(object[p])) {
            _cleanObject(object[p]);
        }
    }
}

/**
 * Return a random int, used by `utils.uid()`
 *
 * @param {Number} min
 * @param {Number} max
 * @return {Number}
 * @api private
 */

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function parseCommand() {
    program.version('0.0.1')
        .option('-m, --runMode', 'is production env or dev env?')
        .option('-n, --clusterName', 'started cluster Name')
        .parse(process.argv);
    var runMode = program.args[0];
    var clusterName = program.args[1];
    var topoConfig = loadConfiguration(runMode);
    var sysconfig = {};
    sysconfig.topoConfig = topoConfig;
    if (clusterName) {
        _.each(topoConfig.cluster, function (cluster) {
            if (cluster && cluster.name === clusterName) {
                sysconfig.clusterConfig = cluster;
                return false;
            }
        });
    }
    return sysconfig;

}

function loadConfiguration(runMode) {
    if (runMode == "production") {
        return readJsonFileSync("conf/topo-production.json");
    } else if (runMode == "image") {
        return readJsonFileSync("conf/topo-image.json");
    } else {
        return readJsonFileSync("conf/topo-dev.json");
    }
}

function endsWith(str, substring, position) {
    substring = String(substring);

    var subLen = substring.length | 0;

    if (!subLen)return true;//Empty string

    var strLen = str.length;

    if (position === void 0)position = strLen;
    else position = position | 0;

    if (position < 1)return false;

    var fromIndex = (strLen < position ? strLen : position) - subLen;

    return (fromIndex >= 0 || subLen === -fromIndex)
        && (
        position === 0
            // if position not at the and of the string, we can optimise search substring
            //  by checking first symbol of substring exists in search position in current string
            || str.charCodeAt(fromIndex) === substring.charCodeAt(0)//fast false
        )
        && str.indexOf(substring, fromIndex) === fromIndex
        ;
}

function _getDateString(millisecond) {
    var currentDate;
    if (millisecond) {
        if (typeof(millisecond) == "string") {
            millisecond = parseInt(millisecond);
        }
        currentDate = new Date(millisecond);
    } else {
        currentDate = new Date();
    }
    return currentDate.getFullYear() + "-" + (currentDate.getMonth() + 1) + "-" + currentDate.getDate();
}

function _getDateMillisecond(date) {
    var converted = Date.parse(date);
    var myDate = new Date(converted);
    if (isNaN(myDate)) {
        var arys = date.split('-');
        myDate = new Date(arys[0], arys[1], arys[2]);
    }
    return myDate.getTime();
}
