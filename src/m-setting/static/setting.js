define(function (require, exports, module) {
    //暴露全局初始化方法
    exports.init = init;
    //一级菜单切换回调
    exports.switchMenu = switchMenu;
    //URL参数变更回调
    exports.paramsChange = paramsChange;
    //模块页面完全加载完成后回调
    exports.afterPageLoaded = afterPageLoaded;
    //模块模型初始化接口
    exports.loadModelAsync = loadModelAsync;
    //模块控制器初始化接口
    exports.initContoller = initContoller;
    exports.checktimeout = true;
    require("./setting.css");

    //基础服务
    var utils = require("mframework/static/package").utils, 			        //全局公共函数
        framework = require("mframework/static/package").framework,
        database = require("mframework/static/package").database,		//数据操作服务
        db = null,		//数据操作服务
        moduleScope;

    framework.registeFilters("versionNameFilter", function () {
        return function (input) {
            if ('trial' == input) {
                return "试用版"
            } else if ('mini' == input) {
                return "迷你版"
            } else if ('sail' == input) {
                return "启航版"
            } else if ('standard' == input) {
                return "标准版"
            } else if ('trial' == input) {
                return "pro"
            } else if ('chain' == input) {
                return "连锁版"
            } else {
                return "试用版"
            }
        }
    });

    function loadModelAsync(params, callback) {
        var model = {};
        db = database.getDBInstance();
        model.memberList = [];
        model.condition = "";
        model.shearch = {
            keyWord: ""
        };
        callback(model);

        setTimeout(function () {
            global.eventEmitter.emitEvent('setting.performance.total.refresh');
            getExpireDay();
        }, 1000);


        global.eventEmitter.addListener("setting.performance.total.refresh", function () {
            //获取统计数据
            getTotalPerformance();
            getTotalMember();
            getTotalEmployee();
            getTotalServiceCount();
        });


        var currentDate = new Date();
        var begin = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()).getTime();
        var end = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1).getTime();


        function getExpireDay() {

            if (window.LosNailActivity) {
                licenseInfo = window.LosNailActivity.getLicenseInfo();
                if (licenseInfo) {
                    licenseInfo = JSON.parse(licenseInfo);
                }
                var day = licenseInfo.expire_day;
                $("#my-account .lisence-msg").hide();
                if (licenseInfo.version_tyle == "trial") {
                    $("#my-account .lisence-msg").show();
                    $("#my-account .lisence-msg .lisence-msg-char>cite").html("试用版还可以使用" + day + "天");

                } else {
                    if (day < 30) {
                        //提示还有多少天
                        $("#my-account .lisence-msg").show();
                        $("#my-account .lisence-msg .lisence-msg-char>cite").html("还可以使用" + day + "天");
                    }
                }
            }
        }

        function getTotalPerformance() {
            var sql = "select sum(amount) from tb_serviceBill where dateTime<" + end + " and dateTime>" + begin;
            db.transaction(function (tx) {
                tx.executeSql(sql, [], function (tx, result) {
                    var sum = result.rows.item(0)["sum(amount)"];
                    if (!sum) {
                        sum = 0;
                    }
                    getTotalCardPerformance(function (error, num) {
                        if (error) {
                            utils.log("m-setting setting.js getTotalPerformance.getTotalCardPerformance", error);
                        } else {
                            sum = sum + num;
                            $("#m-setting-performance-total").html("￥" + sum.toFixed(0));
                        }
                    });

                }, function (tx, error) {
                    utils.log("m-setting setting.js getTotalPerformance.getTotalCardPerformance", error);
                })
            });

            function getTotalCardPerformance(callback) {
                var sql = "select sum(amount) from tb_rechargeMemberBill where dateTime<" + end + " and dateTime>" + begin;
                db.transaction(function (tx) {
                    tx.executeSql(sql, [], function (tx, result) {
                        var sum = result.rows.item(0)["sum(amount)"];
                        if (!sum) {
                            sum = 0;
                        }
                        callback(null, sum);
                    }, function (tx, error) {
                        callback(error);
                    });
                });
            }


        }

        function getTotalMember() {
            var sql = "select count(id) from tb_member";
            db.transaction(function (tx) {
                tx.executeSql(sql, [], function (tx, result) {
                    var sum = result.rows.item(0)["count(id)"];
                    $("#m-setting-member-total").html(sum);

                }, function (tx, error) {
                    utils.log("m-setting setting.js getTotalMember", error);
                });
            });
        }

        function getTotalEmployee() {
            var sql = "select count(id) from tb_employee";
            db.transaction(function (tx) {
                tx.executeSql(sql, [], function (tx, result) {
                    var sum = result.rows.item(0)["count(id)"];
                    $("#m-setting-employee-total").html(sum);

                }, function (tx, error) {
                    utils.log("m-setting setting.js getTotalEmployee", error);
                });
            });
        }

        function getTotalServiceCount() {
            var sql = "select count(id) from tb_service";
            db.transaction(function (tx) {
                tx.executeSql(sql, [], function (tx, result) {
                    var sum = result.rows.item(0)["count(id)"];
                    $("#m-setting-service-total").html(sum);

                }, function (tx, error) {
                    utils.log("m-setting setting.js getTotalServiceCount", error);
                });
            });
        }

        updateBackupTips();
    }

    function updateBackupTips() {
        $.ajax({
            type: "get",
            url: global["_g_server"].serviceurl + "/backup/getEnterpriseBackupRecord?enterpriseId=" + YILOS.ENTERPRISEID,
            dataType: "json",
            success: function (data) {
                if (data && data.code == "0") {
                    if (data.result && data.result.lastBackup_date) {
                        var befDayStr = getBefCurrentDate(data.result.lastBackup_date);
                        if ("" != befDayStr) {
                            $("#system-backup .lisence-msg").show();
                            $("#system-backup .lisence-msg .lisence-msg-char>cite").html("已经" + befDayStr + "未备份了");
                        } else {
                            $("#system-backup .lisence-msg").hide();
                        }
                    } else {
                        $("#system-backup .lisence-msg").show();
                        $("#system-backup .lisence-msg .lisence-msg-char>cite").html("尚未备份");
                    }
                } else {
                    $("#system-backup .lisence-msg").hide();
                }
            },
            error: function (error) {
                $("#system-backup .lisence-msg").hide();
            }
        });
    }

    function getBefCurrentDate(milli) {
        var befDayStr, nowDate = new Date();
        if (milli) {
            var befDay = Math.floor((nowDate.getTime() - milli) / 86400000);
            if (befDay < 1) {
                befDayStr = "";
            }
            else if (befDay <= 7) {
                befDayStr = befDay + "天";
            }
            else if (befDay <= 28) {
                befDayStr = Math.ceil(befDay / 7) + "周";
            }
            else if (befDay <= 365) {
                befDayStr = Math.ceil(befDay / 30) + "个月"
            }
            else {
                befDayStr = Math.ceil(befDay / 365) + "年"
            }
        }
        else {
            befDayStr = "";
        }
        return befDayStr;
    }

    function initContoller($scope, $parse, $q, $http, $location) {
        moduleScope = $scope;
        $scope.clickSettingMenu = function (action) {
            $location.path("/m-setting/" + action);
            if (action === "newGuide") {
                $("#setting-content-area .cover-box-rows").hide();
                $("#setting-content-newbie").removeClass("z-index-2");
            }
        };

        $scope.clickSuggestion = function () {
            if (window.LosNailActivity && 0 == window.LosNailActivity.getNetworkState()) {
                utils.showGlobalMsg("无法连接到网络，请在网络环境下反馈");
                return;
            }
            $location.path("/m-setting/aboutlos?action=suggestion");
        };

        $scope.clickMessage = function () {
            utils.showGlobalMsg("即将提供");
        }
    }

    function init() {

    }


    function afterPageLoaded() {
        /*$("#m-setting-setting-area").height($(document).height()-$("#header-container").outerHeight()-$(document).height()*0.0234375*2);*/
        var permanentMenuKeyHeight = 0;
        /*if (!window.LosNailActivity.hasPermanentMenuKey()) {
         permanentMenuKeyHeight = 60
         }*/
        if ($(window).width() <= 800) {
            $("#setting-content-area").height($("#main-container").outerHeight() - 10 - permanentMenuKeyHeight);
        } else {
            $("#m-setting-setting-area #setting-content-area").height($("#main-container").outerHeight() - 10 - permanentMenuKeyHeight);
        }
    }


    function switchMenu(params) {
        setTimeout(function () {
            global.eventEmitter.emitEvent('setting.performance.total.refresh');
        }, 1000);
        updateBackupTips();
    }

    function paramsChange(params) {

    }
})
;