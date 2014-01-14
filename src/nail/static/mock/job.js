define(function (require, exports, module) {
    var mockTargets = require("./mockTargets").controlTargets;
    var database = require("mframework/static/package").database;
    var dbInstance = database.getDBInstance();
    var enterpriseId = YILOS.ENTERPRISEID;
    var createDate = mockTargets.startDate;

    var jobInsert = "insert into tb_job(name,bonus_newCard,bonus_recharge,bonus_cash,bonus_memberCard,baseSalary,id,create_date,enterprise_id)"
        + " values(?,?,?,?,?,?,?,'" + createDate + "','" + enterpriseId + "');";

    var jobData = [
        ["学徒", 0, 0, 0, 0, 500],
        ["美甲师", 5, 5, 20, 15, 2500]
    ];

    function productJobId(callback) {
        async.each(jobData, function (item, callback) {
            database.getUniqueId(enterpriseId, function (error, trans, id) {
                if (error) {
                    callback(error);
                    return;
                }
                item.push(id);
                callback(null);
            });
        }, function (error) {
            if (error) {
                callback(error);
                return;
            }
            callback(null);
        });
    }

    function saveJob(callback) {
        dbInstance.transaction(function (trans) {
            async.each(jobData, function (item, callback) {
                trans.executeSql(jobInsert, item, function (trans, result) {
                    callback(null);
                }, function (trans, error) {
                    if (error) {
                        callback(error);
                        return;
                    }
                    callback(null);
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

    function init(callback) {
        async.waterfall([productJobId, saveJob], function (error) {
            if (error) {
                callback(error);
                return;
            }
            callback(null);
        })
    }

    exports.init = init;
});