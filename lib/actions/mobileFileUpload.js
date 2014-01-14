// 移动文件需要使用fs模块
var fs = require('fs');
var utils = require("./../utils");
var request = require("request");
var logger = require("../logger").getLogger();
var serverInfo = {
    host: global["_g_clusterConfig"].baseurl
};

exports.initRouter = initRouter;
function initRouter(app) {
    app.post('/svc/mobileFile-upload', function (req, res) {
            req.form.on('progress', function (bytesReceived, bytesExpected) {
            });
            req.form.on('end', function () {
                // 获得文件的临时路径
                var tmp_path = req.files.file.path;
                var enterprise_id = "";
                var array = req.files.file.name.split("_");
                if (array.length == 3) {
                    enterprise_id = array[1];
                }
                // 指定文件上传后的目录 - 示例为"mobile"目录。
                var target_path = "" == enterprise_id ? "public/mobile/backup/" : "public/mobile/backup/" + enterprise_id + "/";

                fs.exists(target_path, function (existsFlag) {
                    if (!existsFlag) {
                        fs.mkdir(target_path, function (error, result) {
                            rename(tmp_path, target_path + req.files.file.name, target_path, enterprise_id, function (error, result) {
                                doResponse(req, res, result);
                            });
                        });
                    } else {
                        rename(tmp_path, target_path + req.files.file.name, target_path, enterprise_id, function (error, result) {
                            doResponse(req, res, result);
                        });
                    }
                });
            });
        }
    )
}
function rename(tmp_path, target_path, path, enterpriseId, callback) {
    // 移动文件
    fs.rename(tmp_path, target_path, function (err) {
        if (err) {
            logger.error("将临时文件：" + tmp_path + "移动到：" + target_path + "失败，错误信息：" + err);
            callback(assembleResultObject(err, null), null);
            return;
        }
        // 删除临时文件夹文件,
        fs.unlink(tmp_path, function () {
            if (err) {
                logger.error("删除临时文件：" + tmp_path + "失败，错误信息：" + err);
            }
            // 调用backup逻辑
            var backupRequest = {
                method: "get",
                uri: serverInfo.host + "/backup/backupHelper",
                body: {filePath: target_path, path: path, enterpriseId: enterpriseId},
                headers: {Authorization: "Bearer SUPERTOKEN"},
                json: true
            };
            request(backupRequest,
                function (error, response, body) {
                    if (error) {
                        callback(error, null)
                    }
                    else {
                        callback(null, body)
                    }
                });
        });
    });
}