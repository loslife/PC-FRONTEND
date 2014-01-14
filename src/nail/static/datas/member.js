define(function (require, exports, module) {

    var member = "CREATE TABLE IF NOT EXISTS tb_member("
        + "id varchar(64) NOT NULL primary key,"
        + "enterprise_id varchar(64)," + "name varchar(32),"
        + "sex integer," + "birthday REAL," + "image varchar(128),"
        + "loginAccount varchar(32)," + "password varchar(32),"
        + "lastLoginDate REAL," + "totalLoginNum integer," + "desc text,"
        + "create_date REAL," + "modify_date REAL,"
        + "phoneMobile varchar(16)," + "def_str1 varchar(32),"
        + "def_str2 varchar(64)," + "def_str3 varchar(128),"
        + "def_int1 integer," + "def_int2 integer," + "def_int3 integer,"
        + "def_text1 text);";


    var cardCate = "CREATE TABLE IF NOT EXISTS tb_memberCardCategory("
        + "id varchar(64) NOT NULL primary key," + "name varchar(32),"
        + "baseInfo_image varchar(128)," + "baseInfo_minMoney REAL,"
        + "baseInfo_type varchar(16)," + "cardValid integer,"
        + "cardNoGenRule_cardNoPrefix varchar(32),"
        + "cardNoGenRule_cardNoLen integer,"
        + "discounts_goodsDiscount REAL,"
        + "discounts_serviceDiscount REAL," + "enterprise_id varchar(64),"
        + "create_date REAL," + "modify_date REAL,"
        + "rechargeRule_rule varchar(16),"
        + "rechargeRule_presenterMoney REAL,"
        + "rechargeRule_totalMoney REAL," + "scoreRule_rule varchar(16),"
        + "scoreRule_presenterScore REAL," + "scoreRule_totalMoney REAL,"
        + "salesCount integer," + "def_str1 varchar(32),"
        + "def_str2 varchar(64)," + "def_str3 varchar(128),"
        + "def_int1 integer," + "def_int2 integer," + "def_int3 integer,"
        + "def_text1 integer);";

    var card = "CREATE TABLE IF NOT EXISTS tb_memberCard("
        + "id varchar(64) NOT NULL primary key," + "cardNo varchar(32),"
        + "currentMoney REAL," + "memberCardCategoryId varchar(64),"
        + "memberCardCategoryName varchar(32)," + "currentScore integer,"
        + "enterprise_id varchar(64)," + "discounts_goodsDiscount REAL,"
        + "discounts_serviceDiscount REAL," + "employee_id varchar(64),"
        + "lastConsumption_date REAL," + "employee_name varchar(64),"
        + "exchangeMoney REAL," + "exchangeScore integer,"
        + "introducerId varchar(64)," + "memberId varchar(64),"
        + "periodOfValidity integer," + "phoneMobile varchar(16),"
        + "presentMoney REAL," + "presentScore integer,"
        + "rechargeRule_presenterMoney REAL,"
        + "rechargeRule_rule varchar(16),"
        + "rechargeRule_totalMoney REAL," + "recharge_money REAL,"
        + "scoreRule_rule varchar(16)," + "scoreRule_score integer,"
        + "scoreRule_totalMoney REAL," + "serviceBill_id varchar(64),"
        + "create_date REAL," + "modify_date REAL,"
        + "totalConsumption REAL," + "totalMoney REAL,"
        + "totalScore integer," + "total_presentMoney REAL,"
        + "total_recharge_money REAL," + "def_str1 varchar(32),"
        + "def_str2 varchar(64)," + "def_str3 varchar(128),"
        + "def_int1 integer," + "def_int2 integer," + "def_int3 integer,"
        + "def_text1 text);";

    var cateService = "CREATE TABLE IF NOT EXISTS tb_recordCateServices("
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
        + "def_int2 integer," + "def_int3 integer," + "def_text1 text);";

    exports.initData = function (callback) {
        var dbInstance = require("mframework/static/package").database.getDBInstance();
        var sqlArray = [member, cardCate, card, cateService];

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