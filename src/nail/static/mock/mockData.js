//辅助生成随机员工数据数据
define(function (require, exports, module) {
    var database = require("mframework/static/package").database;
    var cache = require("mframework/static/package").utils.getCache();
    var dbInstance = database.getDBInstance();
    var mockTargets = require("./mockTargets").controlTargets;
    var account = require("./account.js");
    var service = require("./service.js");
    var serviceCate = require("./serviceCate.js");
    var memberCate = require("./memberCate.js");
    var member = require("./member.js");
    var store = require("./store.js");
    var job = require("./job.js");
    var employee = require("./employee.js");
    var checkout = require("./checkout.js");
    var showCate = require("./showCate.js");
    var show = require("./show.js");

    var delArray = [
        "delete from tb_member",
        "delete from tb_memberCard",
        "delete from tb_memberCardCategory",
        "delete from tb_rechargeMemberBill",
        "delete from tb_service_cate",
        "delete from tb_service",
        "delete from tb_job",
        "delete from tb_employee",
        "delete from tb_empBonus",
        "delete from tb_empSalary",
        "delete from tb_serviceBill",
        "delete from tb_billProject",
        "delete from tb_showitem_cate",
        "delete from tb_showitem"
    ];

    function init() {
        if (!mockTargets.enabled) {
            traggerTestDataLoadFinish();
            return;
        }
        needInit(function (error, isInit, action) {
            if (error) {
                traggerTestDataLoadFinish();
                console.log(error);
                return;
            }
            if (isInit) {
                var task = [];
                task.push(delOldData);
                task.push(serviceCate.init);
                task.push(service.init);
                task.push(showCate.init);
                task.push(show.init);
                task.push(memberCate.init);
                task.push(job.init);
                task.push(employee.init);
                task.push(member.init);
                task.push(checkout.init);
                task.push(account.init);
                task.push(store.init);
                showMsg("初始化测试数据开始");
                async.waterfall(task, function (error) {
                    traggerTestDataLoadFinish();
                    if (error) {
                        console.log(error);
                        showMsg("初始化数据失败!");
                        return;
                    }
                    global.eventEmitter.emitEvent("mockData.checkout.finish");
                    showMsg("初始化测试数据结束");
                    if (action) {
                        updateInitConfig(action);
                    }
                });
            }
            else {
                traggerTestDataLoadFinish();
            }
        });
    }

    function traggerTestDataLoadFinish() {
        if (window.LosNailActivity) {
            window.LosNailActivity.initTestDataFinish();
        }
    }

    function showMsg(msg) {
        if (window.LosNailActivity) {
            window.LosNailActivity.showMsg(msg);
        }
        else {
            console.log("window.LosNailActivity.showMsg()失败!");
        }
    }

    function updateInitConfig(action) {
        if (action === "insert") {
            insertConfigInitTest();
        }
        else if (action === "update") {
            updateConfigInitTest();
        }

        function insertConfigInitTest() {
            var insertSql = "insert into sys_config(name,value) values('initTest','0');";
            dbInstance.transaction(function (trans) {
                trans.executeSql(insertSql, [], function (trans, result) {

                }, function (trans, error) {
                    console.log(error);
                });
            });
        }

        function updateConfigInitTest() {
            var updateSql = "update sys_config set value = '0' where name = 'initTest';";
            dbInstance.transaction(function (trans) {
                trans.executeSql(updateSql, [], function (trans, result) {

                }, function (trans, error) {
                    console.log(error);
                });
            });
        }
    }

    function needInit(callback) {
        //已sys_config中initTest值决定是否初始化测试数据
        var selectInitTest = "select value from sys_config where name = 'initTest';";
        dbInstance.execQuery(selectInitTest, [], function (result) {
            if (result.rows.length === 0) {
                callback(null, true, "insert");
                return;
            }
            //1为true,0为false
            if (result.rows.item(0).value == "1") {
                callback(null, true, "update");
            }
            else {
                callback(null, false);
            }
        }, function (error) {
            callback(error);
        });
    }

    function delOldData(callback) {
        dbInstance.transaction(function (trans) {
            async.each(delArray, function (item, callback) {
                trans.executeSql(item, [], function (trans, result) {
                    callback(null);
                }, function (trans, error) {
                    callback(error);
                });
            }, function (error) {
                if (error) {
                    callback(error);
                    return;
                }
                callback(null);
            });
        });
    }

    exports.init = init;
});