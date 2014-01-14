define(function (require, exports, module) {
    var employee = "CREATE TABLE IF NOT EXISTS tb_employee("
        + "id varchar(64) NOT NULL primary key," + "name varchar(32),"
        + "nickname varchar(32)," + "baseInfo_sex integer,"
        + "baseInfo_code varchar(32)," + "baseInfo_jobId varchar(64),"
        + "baseInfo_image varchar(128)," + "baseInfo_birthday REAL,"
        + "baseInfo_beginDate REAL," + "create_date REAL,"
        + "modify_date REAL," + "baseInfo_terminateDate NUMERIC,"
        + "baseInfo_idcard varchar(32)," + "salary_regularPay NUMERIC,"
        + "salary_bankNo varchar(32)," + "salary_bankName varchar(32),"
        + "contact_phoneMobile varchar(16),"
        + "contact_weixin varchar(32)," + "contact_email varchar(64),"
        + "enterprise_id varchar(64)," + "comment text,"
        + "bonus_newCard REAL," + "bonus_recharge REAL,"
        + "bonus_cash REAL," + "bonus_memberCard REAL,"
        + "def_str1 varchar(32)," + "def_str2 varchar(64),"
        + "def_str3 varchar(128)," + "def_int1 integer,"
        + "def_int2 integer," + "def_int3 integer," + "def_text1 text);";

    var job = "CREATE TABLE IF NOT EXISTS tb_job("
        + "id varchar(64) NOT NULL primary key," + "name varchar(32),"
        + "enterprise_id varchar(64)," + "create_date REAL,"
        + "modify_date REAL," + "describe text," + "baseSalary REAL,"
        + "bonus_newCard REAL," + "bonus_recharge REAL,"
        + "bonus_cash REAL," + "bonus_memberCard REAL,"
        + "bonus_newRecordCard REAL," + "bonus_recordCardConsume REAL,"
        + "def_str1 varchar(32)," + "def_str2 varchar(64),"
        + "def_str3 varchar(128)," + "def_int1 integer,"
        + "def_int2 integer," + "def_int3 integer," + "def_text1 text);";

    var bonus = "CREATE TABLE IF NOT EXISTS tb_empBonus("
        + "id varchar(64) NOT NULL primary key,"
        + "employee_id varchar(64)," + "project_id varchar(64),"
        + "serviceBill_id varchar(64)," + "type integer,"
        + "isAppoint integer," + "totalMoney REAL," + "bonusMoney REAL,"
        + "dateTime REAL," + "create_date REAL," + "modify_date REAL,"
        + "enterprise_id varchar(64)," + "member_name varchar(64),"
        + "cardNo varchar(64)," + "cardCate varchar(64),"
        + "billDetail text," + "befDisMoney REAL," + "discount REAL,"
        + "comment text" + "def_str1 varchar(32),"
        + "def_str2 varchar(64)," + "def_str3 varchar(128),"
        + "def_int1 integer," + "def_int2 integer," + "def_int3 integer,"
        + "def_text1 text);";

    var empSalary = "CREATE TABLE IF NOT EXISTS tb_empSalary("
        + "id varchar(64) NOT NULL primary key,"
        + "employee_id varchar(64)," + "baseSalary REAL,"
        + "bonusMoney REAL," + "totalMoney REAL," + "appendMoney REAL,"
        + "dateTime REAL," + "create_date REAL," + "modify_date REAL,"
        + "enterprise_id varchar(64)," + "def_str1 varchar(32),"
        + "def_str2 varchar(64)," + "def_str3 varchar(128),"
        + "def_int1 integer," + "def_int2 integer," + "def_int3 integer,"
        + "def_text1 text);";

    exports.initData = function (callback) {
        var dbInstance = require("mframework/static/package").database.getDBInstance();
        dbInstance.transaction(function (trans) {
            var sqlArray = [employee, job, bonus, empSalary];
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