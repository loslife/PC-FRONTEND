// 移动文件需要使用fs模块
var fs = require('fs');
var utils = require("./../utils");
var logger = require("../logger").getLogger();

exports.initRouter = initRouter;
function initRouter(app) {
    app.post('/svc/logger-upload', function (req, res) {
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
            var target_path = "" == enterprise_id ? "clientLog/" : "clientLog/" + enterprise_id + "/";
            fs.exists(target_path, function (existsFlag) {
                if (!existsFlag) {
                    fs.mkdir(target_path, function (error, result) {
                        rename(tmp_path, target_path + req.files.file.name, function (error, result) {
                            doResponse(req, res, result);
                        });
                    });
                } else {
                    rename(tmp_path, target_path + req.files.file.name, function (error, result) {
                        doResponse(req, res, result);
                    });
                }
            });
        });
    })
}

function rename(tmp_path, target_path, callback) {
    // 移动文件
    fs.rename(tmp_path, target_path, function (err) {
        if (err) {
            logger.error("上传日志文件失败，文件：" + target_path + "，错误信息" + JSON.stringify(err));
            callback(null, assembleResultObject(err, null));
            return;
        }
        // 删除临时文件夹文件,
        fs.unlink(tmp_path, function () {
            if (err) {
                logger.error("删除临时日志文件失败，文件名称：" + tmp_path + "，错误信息" + JSON.stringify(err));
            }
            callback(null, assembleResultObject(null, null));
        });
    });
}

