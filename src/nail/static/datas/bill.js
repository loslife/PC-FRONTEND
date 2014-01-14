define(function (require, exports, module) {
    var serviceBill = "CREATE TABLE IF NOT EXISTS tb_serviceBill("
        + "id varchar(64) NOT NULL primary key,"
        + "amount REAL,"
        + "score integer,"
        + "befDisMoney REAL,"
        + "discount REAL,"
        + "billNo varchar(64),"
        + "pay_prePaidCard REAL,"
        + "pay_cash REAL,"
        + "pay_coupon REAL,"
        + "pay_bankAccount_id varchar(32),"
        + "pay_bankAccount_money REAL,"
        + "pay_score integer,"
        + "member_id varchar(64),"
        + "member_name varchar(64),"
        + "member_currentBalance REAL,"
        + "memberCard_id varchar(64),"
        + "memberCard_name varchar(64),"
        + "employee_id varchar(64),"
        + "employee_name varchar(64),"
        + "comment text,"
        + "dateTime REAL,"
        + "create_date REAL,"
        + "modify_date REAL,"
        + "enterprise_id varchar(64),"
        + "def_str1 varchar(32),"
        + "def_str2 varchar(64),"
        + "def_str3 varchar(128),"
        + "def_int1 integer,"
        + "def_int2 integer," + "def_int3 integer," + "def_text1 text);";

    var rechargeBill = "CREATE TABLE IF NOT EXISTS tb_rechargeMemberBill("
        + "id varchar(64) NOT NULL primary key,"
        + "billNo varchar(64),"
        + "amount REAL,"
        + "pay_cash REAL,"
        + "pay_bankAccount_money REAL,"
        + "pay_bankAccount_id varchar(32),"
        + "memberCard_id varchar(64),"
        + "memberCardCate_id varchar(64),"
        + "memberCard_name varchar(64),"
        + "member_id varchar(64),"
        + "member_name varchar(64),"
        + "member_currentBalance REAL,"
        + "employee_id varchar(64),"
        + "employee_name varchar(64),"
        + "create_date REAL,"
        + "modify_date REAL,"
        + "enterprise_id varchar(64),"
        + "type integer,"
        + "dateTime REAL,"
        + "day integer,"
        + "weekDay integer,"
        + "month integer,"
        + "comment text,"
        + "def_str1 varchar(32),"
        + "def_str2 varchar(64),"
        + "def_str3 varchar(128),"
        + "def_int1 integer,"
        + "def_int2 integer," + "def_int3 integer," + "def_text1 text);";

    var serviceBillTemp = "CREATE TABLE IF NOT EXISTS tb_serviceBill_temp("
        + "id varchar(64) NOT NULL primary key,"
        + "amount REAL,"
        + "score integer,"
        + "befDisMoney REAL,"
        + "discount REAL,"
        + "billNo varchar(64),"
        + "pay_prePaidCard REAL,"
        + "pay_cash REAL,"
        + "pay_coupon REAL,"
        + "pay_bankAccount_id varchar(32),"
        + "pay_bankAccount_money REAL,"
        + "pay_score integer,"
        + "member_id varchar(64),"
        + "memberCard_id varchar(64),"
        + "employee_id varchar(64),"
        + "employee_name varchar(64),"
        + "comment text,"
        + "dateTime REAL,"
        + "create_date REAL,"
        + "modify_date REAL,"
        + "enterprise_id varchar(64),"
        + "def_str1 varchar(32),"
        + "def_str2 varchar(64),"
        + "def_str3 varchar(128),"
        + "def_int1 integer,"
        + "def_int2 integer,"
        + "def_int3 integer,"
        + "def_text1 text);";

    var billProject = "CREATE TABLE IF NOT EXISTS tb_billProject("
        + "id varchar(64) NOT NULL,"
        + "serviceBill_id varchar(64),"
        + "project_id varchar(64),"
        + "saleNum integer,"
        + "unitPrice REAL,"
        + "discounts REAL,"
        + "sumMoney REAL,"
        + "dateTime REAL,"
        + "month integer,"
        + "day integer,"
        + "weekDay integer,"
        + "project_name varchar(64),"
        + "project_cateName varchar(64),"
        + "project_cateId varchar(64),"
        + "create_date REAL,"
        + "modify_date REAL,"
        + "enterprise_id varchar(64),"
        + "def_str1 varchar(32),"
        + "def_str2 varchar(64),"
        + "def_str3 varchar(128),"
        + "def_int1 integer,"
        + "def_int2 integer,"
        + "def_int3 integer,"
        + "def_text1 text);";

    var billProjectTemp = "CREATE TABLE IF NOT EXISTS tb_billProject_temp("
        + "id varchar(64) NOT NULL primary key,"
        + "serviceBill_id varchar(64),"
        + "project_id varchar(64),"
        + "saleNum integer,"
        + "create_date REAL,"
        + "modify_date REAL,"
        + "enterprise_id varchar(64),"
        + "def_str1 varchar(32),"
        + "def_str2 varchar(64),"
        + "def_str3 varchar(128),"
        + "def_int1 integer,"
        + "def_int2 integer,"
        + "def_int3 integer,"
        + "def_text1 text);";

    exports.initData = function (callback) {
        var dbInstance = require("mframework/static/package").database.getDBInstance();
        var sqlArray = [serviceBill, serviceBillTemp, rechargeBill, billProject, billProjectTemp];

        dbInstance.transaction(function (trans) {
            async.each(sqlArray, function (item, callback) {
                trans.executeSql(item, [], function (trans, result) {
                    callback(null);
                }, function (trans, error) {
                    callback(error);
                });
            }, function (error) {
                callback(error);
            });
        });
    }
});