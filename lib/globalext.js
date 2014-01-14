global.FRAMEWORKPATH = __dirname;
global.doError = doError;
global.loggerFC = require("./logger");
global.doResponse = doResponse;
global.logRequest = logRequest;
global.assembleResultObject = assembleResultObject;
var logger = require("./logger").getLogger();

function doError(callback, err) {
    logger.error(err);
    callback(err);
}
function doResponse(req, res, jsonObj) {
    var executeTime = new Date().getTime() - res.getHeader("beginTime");
    var requestId = res.getHeader("requestId");
    var jsons = JSON.stringify(jsonObj);
    res.writeHead(200, {'executeTime': executeTime, 'Content-Type': "application/json;charset=UTF-8"});
    res.end(jsons);

}
function logRequest(req, res) {
    if (req) {
        logger.error("request body:" + JSON.stringify(req.body));
        logger.error("request header:" + JSON.stringify(req.headers));
        logger.error("request params:" + JSON.stringify(req.params));
        logger.error("request query:" + JSON.stringify(req.query));
    }
    if (res) {
        logger.error("response.statusCode:" + res.statusCode);
        logger.error("request body:" + JSON.stringify(res.body));
        logger.error("request header:" + JSON.stringify(res.headers));
        logger.error("request params:" + JSON.stringify(res.params));
        logger.error("request query:" + JSON.stringify(res.query));
    }
}


function assembleResultObject(err, result) {

    var response = {};
    if (err) {
        response.code = 1;
        response.error = err
    } else {
        response.code = 0;
        response.result = result;
    }
    return response;

}