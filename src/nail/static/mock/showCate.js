define(function (require, exports, module) {
    var mockTargets = require("./mockTargets").controlTargets;
    var database = require("mframework/static/package").database;
    var dbInstance = database.getDBInstance();
    var enterpriseId = YILOS.ENTERPRISEID;
    var createDate = mockTargets.startDate;

    var cateInsert = "insert into tb_showitem_cate (name,id,create_date,enterprise_id) VALUES (?,?,'" + createDate + "','" + enterpriseId + "')";

    var cateData = [
        ["日式"],
        ["甲片"],
        ["创意"],
        ["雕花"],
        ["甲油胶"],
        ["光疗甲"],
        ["自然甲"],
        ["新娘甲"]
    ];

    function getCateId(callback) {
        async.each(cateData, function (item, callback) {
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

    function saveCate(callback) {
        dbInstance.transaction(function (trans) {
            async.each(cateData, function (item, callback) {
                trans.executeSql(cateInsert, item, function (trans, result) {
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
        async.waterfall([getCateId, saveCate], function (error) {
            if (error) {
                callback(error);
                return;
            }
            callback(null);
        })
    }

    exports.init = init;
});