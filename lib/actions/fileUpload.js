// 移动文件需要使用fs模块
var fs = require('fs');
var utils = require("./../utils");

exports.initRouter = initRouter;
function initRouter(app){
    app.post('/svc/file-upload', function(req, res) {

        req.form.on('progress',function(bytesReceived, bytesExpected){
        });
        req.form.on('end',function(){
            // 获得文件的临时路径
            var tmp_path = req.files.file.path;

            // 指定文件上传后的目录 - 示例为"images"目录。
            var target_path = __dirname+'/../../public/images/' + tmp_path.substring(tmp_path.lastIndexOf("/"));
            // 移动文件
            fs.rename(tmp_path, target_path, function(err) {
                if (err) {
                    console.log(err);
                    throw err;
                }
                // 删除临时文件夹文件,
                fs.unlink(tmp_path, function() {
                    if (err) throw err;
                    doResponse(req,res,{
                        url:global["_g_topo"].clientAccess.staticurl+"/svc/public/images"+tmp_path.substring(tmp_path.lastIndexOf("/"))
                    });
                });
            });
        });
    })
}

