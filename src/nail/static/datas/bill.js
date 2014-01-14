define(function (require, exports, module) {
    var tb_servicebill_sql = "CREATE TABLE tb_serviceBill("
        + "id varchar(64) NOT NULL,"
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
        + "def_int2 integer,"
        + "def_int3 integer,"
        + "def_text1 text);";

    var tb_rechargeMemberBill_sql = "CREATE TABLE tb_rechargeMemberBill("
        + "id varchar(64) NOT NULL,"
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
        + "def_int2 integer,"
        + "def_int3 integer,"
        + "def_text1 text);";

    var tb_servicebill_temp_sql = "CREATE TABLE tb_serviceBill_temp("
        + "id varchar(64) NOT NULL,"
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


    var tb_billproject_sql = "CREATE TABLE IF NOT EXISTS tb_billProject("
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

    var tb_billproject_temp_sql = "CREATE TABLE IF NOT EXISTS tb_billProject_temp("
        + "id varchar(64) NOT NULL,"
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

    //记次卡类型与服务项的对应关系
    var tb_recordCateServices = "CREATE TABLE IF NOT EXISTS tb_recordCateServices("
        + "id varchar(64) NOT NULL,"
        + "cardCateId varchar(64),"
        + "cardCateName varchar(64),"
        + "serviceId varchar(64),"
        + "serviceName varchar(64),"
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
        var dbInstance = require("mframework/package").database.getDBInstance();
        dbInstance.transaction(function (trans) {
            console.info("初始化流水表开始");
            var sqlArray = [tb_servicebill_sql, tb_rechargeMemberBill_sql, tb_servicebill_temp_sql, tb_billproject_sql, tb_billproject_temp_sql, tb_recordCateServices];
            async.eachSeries(sqlArray, function (sql, callback) {
                trans.executeSql(sql, [], function () {
                    callback(null);
                }, function (trans, error) {
                    console.error("初始化流水表失败");
                    console.error(error);
                    callback(null);
                });
            }, function (error) {
                if (error) {
                    callback(error);
                    return;
                }
                console.info("初始化流水表成功");
                callback(null);
            });
        });
    }
});