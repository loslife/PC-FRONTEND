define(function (require, exports, module) {
    var moduleFactory = {
        "m-pos": require("m-pos/static/package"),
        "m-member": require("m-member/static/package"),
        "m-nail-show": require("m-nail-show/static/package"),
        "m-setting": require("m-setting/static/package")
    };
    var dbinit = require("./initdb"),
        database = require("mframework/static/package").database,		//数据操作服务
        utils = require("mframework/static/package").utils,		//数据操作服务
        db = null,
        self = this;		//数据操作服务

    exports.init = function (options) {

        _init(options);


        global.eventEmitter.addListener("client.password.lock", function (pwd) {
            isSettingPwd(function (error, setting) {
                if (error) {
                    utils.showGlobalMsg("系统错误，请重新打开");
                }
                if (setting.clientpwd) {
                    $("#client-lock-title").html("");
                    $("#client-lock-pwd>div>ul>li input").removeClass("error-pwd");
                    $("#main-container").hide();
                    $("#client-lock-pwd").show();
                    $("#client-lock-pwd-conform").show();
                    $("#client-lock-pwd-setting").hide();
                } else {
                    $("#main-container").hide();
                    $("#client-lock-pwd").show();
                    $("#client-lock-pwd-conform").hide();
                    $("#client-lock-pwd-setting").show();
                    $("#client-lock-title").html("第一次进入管理台，请设置屏幕锁定密码");
                }
            });
        });

        global.eventEmitter.addListener("client.password.resetlockpwd", function (pwd) {
            $("#main-container").hide();
            $("#client-lock-pwd").show();
            $("#client-lock-pwd-conform").hide();
            $("#client-lock-pwd-setting").show();
            $("#client-lock-pwd>div>ul>li input").val("");
            $("#client-lock-pwd>div>ul>li input").removeClass("error-pwd");
            $("#client-lock-title").html("请重新设置屏幕锁定密码");
        });


        global.eventEmitter.addListener("client.password.unlock", function (pwd) {
            checkPwd(pwd, function (error, ok) {
                if (ok) {
                    $("#client-lock-pwd>div>ul>li input").removeClass("error-pwd");
                    $("#main-container").show();
                    $("#client-lock-pwd").hide();
                    global.eventEmitter.emitEvent('client.password.unlock.success');
                } else {
                    if (YILOS.USERNAME && pwd && utils.endsWith(YILOS.USERNAME, pwd)) {
                        //进入密码设置界面
                        global.eventEmitter.emitEvent('client.password.resetlockpwd');
                        return;
                    }

                    $("#main-container").hide();
                    $("#client-lock-pwd").show();
                    var times = 5;
                    var direction = 1; // 1, -1
                    var state = 1; // 0,1,2
                    var oldClass = "";
                    //这段逻辑主要是为了让状态在0，1，2间反复的切换。
                    var timeer = setInterval(function () {
                        if (times == 0) {
                            clearInterval(timeer);
                        }
                        $("#pwd-input").removeClass(oldClass);
                        if (state + direction > 2 || state + direction < 0) {
                            direction = -direction;
                        }
                        state = state + direction;
                        var newClass = "input-transformed" + state;
                        $("#pwd-input").addClass(newClass);
                        $("#pwd-input").innerText = newClass;
                        oldClass = newClass;
                        times--;

                    }, 50);

                }
                $("#client-lock-pwd>div>ul>li input").val("");
                $("#client-lock-pwd>div>ul>li input").addClass("error-pwd");
            });
        });
        global.eventEmitter.addListener("client.password.disablelock", function (pwd) {
            $("#main-container").show();
            $("#client-lock-pwd").hide();
        });

        global.eventEmitter.addListener("client.password.setting", function (pwd) {
            settingClientPwd(pwd, function () {
                $("#main-container").show();
                $("#client-lock-pwd").hide();
                $("#client-lock-pwd>div>ul>li input").val("");
                newbieStart();
            });
        });

        //凸显新手上路
        function newbieStart() {
            $("#setting-content-area .cover-box-rows").show();
            $("#setting-content-newbie").addClass("z-index-2");
        }

        function _init(options) {
            var uirouter = require("mframework/static/package").uiRouter;
            uirouter.init(moduleFactory, options);
            if ((browser.versions.webKit || browser.versions.trident ) && !(browser.versions.android || browser.versions.iPhone || browser.versions.iPad )) {
                initData();
                YILOS.onDeviceReady = true;
            } else if (browser.versions.android
                || browser.versions.iPhone
                || browser.versions.iPad) {
                document.addEventListener("deviceready", onDeviceReady, false);
                function onDeviceReady() {
                    global.eventEmitter.emitEvent('data-init-success');
                    YILOS.onDeviceReady = true;
                }
            }

        }

        function initData() {
            dbinit.initTable(function () {
                var tasks = [];
                //判断数据是否需要重建
                tasks.push(require("./datas/emptyTable").initData);
                tasks.push(require("./datas/show").initData);
                tasks.push(require("./datas/service").initData);
                tasks.push(require("./datas/member").initData);
                tasks.push(require("./datas/employee").initData);
                tasks.push(require("./datas/enterprise").initData);
                tasks.push(require("./datas/bill").initData);
                tasks.push(require("./datas/terminal").initData);
//                tasks.push(require("./mock/mockData").init);
                async.series(tasks, function (error) {
                    if (error) {
                        console.error(error);
                    }
                    global.eventEmitter.emitEvent('data-init-success');
                })
            });
        }
    }

    function isSettingPwd(callback) {
        if (self.isSettingPwd) {
            return true;
        }
        db = database.getDBInstance();
        db.transaction(function (tx) {
            tx.executeSql("select name,value  from sys_config where name='client-pwd' or name='client-lockable'", [], function (tx, result) {
                var len = result.rows.length;
                if (len == 2) {
                    if (result.rows.item(0)["name"] == "client-pwd") {
                        self.clientpwd = result.rows.item(0)["value"];
                        global.setting.lockable = result.rows.item(1)["value"] == "true";
                    } else {
                        global.setting.lockable = result.rows.item(0)["value"] == "true";
                        self.clientpwd = result.rows.item(1)["value"];
                    }
                    callback(null, {clientpwd: self.clientpwd, lockable: global.setting.lockable});
                }
                if (len == 1) {
                    if (result.rows.item(0)["name"] == "client-pwd") {
                        self.clientpwd = result.rows.item(0)["value"];
                        global.setting.lockable = true;
                    } else {
                        global.setting.lockable = result.rows.item(0)["value"] == "true";
                        self.clientpwd = null;
                    }
                    callback(null, {clientpwd: self.clientpwd, lockable: global.setting.lockable});
                } else {
                    callback(null, {clientpwd: null, lockable: false});
                }
            }, function (tx, error) {
                console.log("error");
                console.log(error);
                callback(error);
            })
        });
    }

    function checkPwd(pwd, callback) {
        if (!db) {
            db = database.getDBInstance();
        }
        db.transaction(function (tx) {
            tx.executeSql("select value  from sys_config where name='client-pwd'", [], function (tx, result) {
                var len = result.rows.length;
                if (len > 0) {
                    self.clientpwd = result.rows.item(0)["value"];
                    callback(null, self.clientpwd == pwd);
                } else {
                    callback(null, false);
                }
            }, function (tx, error) {
                console.log("error");
                console.log(error);
                callback(error);
            })
        });
    }

    function settingClientPwd(pwd, callback) {
        if (!db) {
            db = database.getDBInstance();
        }
        isSettingPwd(function (error, setting) {
            if (!setting.clientpwd) {
                db.transaction(function (tx) {
                    tx.executeSql("insert into sys_config (name,value) values('client-pwd',?)", [pwd], function (tx, result) {
                        var len = result.rows.length;
                        if (len > 0) {
                            self.clientpwd = result.rows.item(0)["value"];
                            callback(null);
                        } else {
                            callback(null);

                        }
                    }, function (tx, error) {
                        console.log("error");
                        console.log(error);
                        callback(error);
                    })
                });
            } else {
                db.transaction(function (tx) {
                    tx.executeSql("update sys_config set value=? where name='client-pwd'", [pwd], function (tx, result) {
                        var len = result.rows.length;
                        if (len > 0) {
                            self.clientpwd = result.rows.item(0)["value"];
                            callback(null);
                        } else {
                            callback(null);

                        }
                    }, function (tx, error) {
                        console.log("error");
                        console.log(error);
                        callback(error);
                    })
                });
            }
        });

    }


    window.browser = {
        versions: function () {
            var u = navigator.userAgent, app = navigator.appVersion;
            return {
                //移动终端浏览器版本信息
                trident: u.indexOf('Trident') > -1,
                //IE内核
                presto: u.indexOf('Presto') > -1,
                //opera内核
                webKit: u.indexOf('AppleWebKit') > -1,
                //苹果、谷歌内核
                gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1,
                //火狐内核
                mobile: !!u.match(/AppleWebKit.*Mobile.*/),
                //是否为移动终端
                //ios: !!u.match(/(i[^;]+;( U;)? CPU.+Mac OS X/),
                //ios终端
                android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1,
                //android终端或者uc浏览器
                iPhone: u.indexOf('iPhone') > -1,
                //是否为iPhone或者QQHD浏览器
                iPad: u.indexOf('iPad') > -1,
                //是否iPad
                webApp: u.indexOf('Safari') == -1
                //是否web应该程序，没有头部与底部
            };
        }(),
        language: (navigator.browserLanguage || navigator.language).toLowerCase()
    }
})