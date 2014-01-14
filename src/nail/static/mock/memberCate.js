define(function (require, exports, module) {
    var mockTargets = require("./mockTargets").controlTargets;
    var database = require("mframework/static/package").database;
    var dbInstance = database.getDBInstance();
    var enterpriseId = YILOS.ENTERPRISEID;
    var createDate = mockTargets.startDate;

    var memberCateInsert = "insert into tb_memberCardCategory(cardNoGenRule_cardNoPrefix,cardNoGenRule_cardNoLen,cardValid,name,discounts_serviceDiscount,baseInfo_minMoney,id,create_date,enterprise_id)"
        + "values(?,?,?,?,?,?,?,'" + createDate + "','" + enterpriseId + "');";

    var memberCateData = [
        ["PT", 5, 365, "普通", 8, 200],
        ["ZJ", 5, 365, "中级", 7, 500],
        ["GJ", 5, 365, "高级", 6, 1000]
    ];

    function productId(callback) {
        async.each(memberCateData, function (item, callback) {
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

    function saveMemberCate(callback) {
        dbInstance.transaction(function (trans) {
            async.each(memberCateData, function (item, callback) {
                trans.executeSql(memberCateInsert, item, function (trans, result) {
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
        async.waterfall([productId, saveMemberCate], function (error) {
            if (error) {
                callback(error);
                return;
            }
            callback(null);
        })
    }

    exports.init = init;
});