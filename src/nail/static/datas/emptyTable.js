define(function (require, exports, module) {
    var sqlArray = [];

    sqlArray.push("drop table IF EXISTS tb_employee;");
    sqlArray.push("drop table IF EXISTS tb_job;");
    sqlArray.push("drop table IF EXISTS tb_empBonus;");
    sqlArray.push("drop table IF EXISTS tb_empSalary;");

    sqlArray.push("drop table IF EXISTS tb_showitem_cate;");
    sqlArray.push("drop table IF EXISTS tb_showitem;");

    sqlArray.push("drop table IF EXISTS tb_service_cate;");
    sqlArray.push("drop table IF EXISTS tb_service;");

    sqlArray.push("drop table IF EXISTS tb_member;");
    sqlArray.push("drop table IF EXISTS tb_memberCardCategory;");
    sqlArray.push("drop table IF EXISTS tb_memberCard;");
    sqlArray.push("drop table IF EXISTS tb_recordCateServices;");
    sqlArray.push("drop table IF EXISTS tb_rechargeMemberBill;");

    sqlArray.push("drop table IF EXISTS tb_enterprise;");
    sqlArray.push("drop table IF EXISTS tb_users;");
    sqlArray.push("drop table IF EXISTS tb_operateItem;");
    sqlArray.push("drop table IF EXISTS tb_standOperateItem;");

    sqlArray.push("drop table IF EXISTS tb_serviceBill;");
    sqlArray.push("drop table IF EXISTS tb_rechargeMemberBill;");
    sqlArray.push("drop table IF EXISTS tb_serviceBill_temp;");
    sqlArray.push("drop table IF EXISTS tb_billProject;");
    sqlArray.push("drop table IF EXISTS tb_billProject_temp;");

    sqlArray.push("drop table tb_printer;");

    exports.initData = function (callback) {
        var dbInstance = require("mframework/static/package").database.getDBInstance();		//数据操作服务
        dbInstance.transaction(function (trans) {
                trans.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name='tb_member';", [], function (trans, result) {
                    if(result.rows.length==0){
                        async.each(sqlArray, function (item, sub_callback) {
                            trans.executeSql(item, [], function (trans, result) {
                                sub_callback(null);
                            }, function (trans, error) {
                                sub_callback(error);
                            });
                        }, function (error) {
                            callback(null);
                        });
                    }else{
                        callback(null);
                    }
                }, function (trans, error) {
                    callback(error);
                });
            }, function (error) {
                callback(error);
            });
    }
});