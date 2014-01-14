var logger = require("./logger").getLogger(),
    flash = require('connect-flash'),
    timeout = require('./connect-timeout'),
    express = require('express'),
    expressext = require("./expressext"),
    MongoStore = require('connect-mongo')(express),
    passport = require('passport'),
    _ = require('underscore'),
    globalext = require('./globalext'),
    appmgr = require('./appmgr'),
    utils = require('./utils'),
    self = this;


var domain = require('domain');


function output(str) {
    console.log(str);
}

function main(fn) {
    fn();
}

var GRACE_EXIT_TIME = 1500;

var app = null;
var exitTimer = null;
var childReqCount = 0;

function allowCrossDomain(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization,Origin, Accept, Content-Type, X-HTTP-Method, X-HTTP-METHOD-OVERRIDE,XRequestedWith,X-Requested-With,xhr,custom-enterpriseId');
    res.setHeader('Access-Control-Max-Age', '10');
    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
        res.end("POST, GET, PUT, DELETE");
    }
    else {
        next();
    }
};

function statistics(req, res, next) {
    var beginTime = (new Date()).getTime();
    var requestId = nodeID + "-" + beginTime;
    res.setHeader("beginTime", beginTime);
    res.setHeader("requestId", requestId);

    if (req.url.indexOf("/svc") == 0) {
        logger.debug("[" + req.url + " " + req.method + "]" + "nodeId:" + nodeID + " request beigin!");
    }
    if (req.user) {
        res.writeHead(200, {'USERNAME': req.user.username});
    }
    next();
}

function setCommonHeader(req, res, next) {
    res.setHeader('Keep-Alive', 'timeout=1, max=100');
    next();

}

void main(function () {
    app = express();
    // 覆盖express的视图查找逻辑，使其支持多个视图文件
    // 用以支持每个应用可以指定自己的express视图目录
    expressext.enableMultipleViewFolders(app.settings);
    app.set('views', [__dirname + '/views']);
    app.set('view engine', 'ejs');

    function initExpress() {

        app.use(express.bodyParser({
                uploadDir: __dirname + '/../var/uploads',
                keepExtensions: true,
                limit: 10 * 1024 * 1024,// 10M limit
                defer: true//enable event
            }))
            .use('/svc/public', express.static(__dirname + '/../public'))
            .use(express.compress())
            .use(allowCrossDomain)
            .use(statistics)
            .use("/svc/oauth", express.cookieParser())
            .use(express.methodOverride())
            .use(flash())
            .use(timeout())
            .use("/svc/oauth", express.session({   //超时时间设置，设置为不超时
                store: new MongoStore({
                    url: 'mongodb://' + global['_g_topo'].dataServer.mongodb.connectionurl + '/yilos_session'
                }),
                maxAge: {
                    originalMaxAge: 1000 * 10
                },
                secret: '1234567890QWERTY'
            }))
            .use(passport.initialize())
            .use(passport.session());

        app.use(function (req, res, next) {
            var d = domain.create();
            //监听domain的错误事件
            d.on('error', function (err) {
                logger.error(err.stack);
                res.statusCode = 500;
                res.json({code: 1, error: {message: '服务器异常'}});
                res.end();
                d.dispose();
            });
            d.add(req);
            d.add(res);
            d.run(next);
        });

        app.get('/favicon.ico', function (req, res, next) {
            res.end("");
        });


    }

    process.on('message', function (m, handle) {
        if (handle) {
            global.nodeID = m.nodeId;
            self.clusterConfig = m.clusterConfig;
            //设置全局配置信息
            global["_g_topo"] = m.topoConfig;
            global["_g_clusterConfig"] = m.clusterConfig;
            //app.use("/", express.static(__dirname + "/../fontend"));
            initExpress();

            var uploadAction = require("./actions/fileUpload");
            uploadAction.initRouter(app);

            var mobileUploadAction = require("./actions/mobileFileUpload");
            mobileUploadAction.initRouter(app);

            var loggerUpload = require("./actions/loggerUpload");
            loggerUpload.initRouter(app);

            var appManager = new appmgr.ApplicationManager(self.clusterConfig.applications);
            appManager.start(app);
            app.use(function (err, req, res, next) {
                logger.error(err.stack);
                logger.error(err);
                var errHander = appManager.errorHanderMap[err.errorCode];
                if (errHander) {
                    if (!errHander.returnTo) {
                        errHander.returnTo = global["_g_clusterConfig"].baseurl + "/portal/index.html";
                        errHander.returnToMsg = "返回登录";
                    }
                    if (req.headers && (req.headers['XRequestedWith'] || req.headers['x-requested-with'] || req.headers["X-Requested-With"] || req.headers["xhr"])) {
                        var responseObject = {
                            code: 1,
                            error: _.extend(err, errHander)
                        }
                        res.end(JSON.stringify(responseObject));
                    } else {
                        if(errHander.templ){
                            res.render(errHander.templ, _.extend(err, errHander));
                        }else{
                            var responseObject = {
                                code: 1,
                                error: _.extend(err, errHander)
                            }
                            res.end(JSON.stringify(responseObject));
                        }

                    }
                } else {
                    if (req.headers && (req.headers['XRequestedWith'] || req.headers['x-requested-with'] || req.headers["X-Requested-With"] || req.headers["xhr"])) {
                        var responseObject = {
                            code: 1,
                            error: _.extend(err)
                        }
                        res.end(JSON.stringify(responseObject));
                    } else {
                        res.render("error", {error: err});
                    }

                }
            });

            app.listen(handle, function (err) {
                if (err) {
                    output('worker listen error');
                } else {
                    process.send({'listenOK': true});
                    output('worker listen ok');
                }
            });
        }
        if (m.status == 'update') {
            process.send({'status': process.memoryUsage()});
        }
    });

    output('worker is running...');
});

