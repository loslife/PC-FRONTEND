define(function (require, exports, module) {
    var dbInstance = require("mframework/package").database.getDBInstance();
    var tb_member_sql = "CREATE TABLE tb_member(" +
        "id varchar(64) NOT NULL primary key," +
        "enterprise_id varchar(64)," +
        "name varchar(32)," +
        "sex integer," +
        "birthday integer," +
        "image varchar(128)," +
        "loginAccount varchar(32)," +
        "password varchar(32)," +
        "lastLoginDate REAL," +
        "totalLoginNum integer," +
        "desc text," +
        "create_date REAL," +
        "modify_date REAL," +
        "phoneMobile varchar(16)," +
        "def_str1 varchar(32)," +
        "def_str2 varchar(64)," +
        "def_str3 varchar(128)," +
        "def_int1 integer," +
        "def_int2 integer," +
        "def_int3 integer," +
        "def_text1 text" +
        ");";

    var drop_tb_memberCard_sql = "DROP Table tb_memberCard";

    var tb_memberCardcate_sql = "CREATE TABLE tb_memberCardCategory(" +
        "id varchar(64) NOT NULL," +
        "name varchar(32)," +
        "baseInfo_image varchar(128)," +
        "baseInfo_minMoney REAL," +
        "baseInfo_type varchar(16)," +
        "cardValid integer," +
        "cardNoGenRule_cardNoPrefix varchar(32)," +
        "cardNoGenRule_cardNoLen integer," +
        "discounts_goodsDiscount REAL," +
        "discounts_serviceDiscount REAL," +
        "enterprise_id varchar(64)," +
        "create_date REAL," +
        "modify_date REAL," +
        "rechargeRule_rule varchar(16)," +
        "rechargeRule_presenterMoney REAL," +
        "rechargeRule_totalMoney REAL," +
        "scoreRule_rule varchar(16)," +
        "scoreRule_presenterScore REAL," +
        "scoreRule_totalMoney REAL," +
        "salesCount integer," +
        "def_str1 varchar(32)," +
        "def_str2 varchar(64)," +
        "def_str3 varchar(128)," +
        "def_int1 integer," +
        "def_int2 integer," +
        "def_int3 integer," +
        "def_text1 integer" +
        ");";

    var tb_memberCard_sql = "CREATE TABLE tb_memberCard(" +
        "id varchar(64) NOT NULL," +
        "cardNo varchar(32)," +
        "currentMoney REAL," +
        "memberCardCategoryId varchar(64)," +
        "memberCardCategoryName varchar(32)," +
        "currentScore integer," +
        "enterprise_id varchar(64)," +
        "discounts_goodsDiscount REAL," +
        "discounts_serviceDiscount REAL," +
        "employee_id varchar(64)," +
        "employee_name varchar(64)," +
        "exchangeMoney REAL," +
        "exchangeScore integer," +
        "introducerId varchar(64)," +
        "memberId varchar(64)," +
        "periodOfValidity integer," +
        "phoneMobile varchar(16)," +
        "presentMoney REAL," +
        "presentScore integer," +
        "rechargeRule_presenterMoney REAL," +
        "rechargeRule_rule varchar(16)," +
        "rechargeRule_totalMoney REAL," +
        "recharge_money REAL," +
        "scoreRule_rule varchar(16)," +
        "scoreRule_score integer," +
        "scoreRule_totalMoney REAL," +
        "serviceBill_id varchar(64)," +
        "create_date REAL," +
        "modify_date REAL," +
        "lastConsumption_date REAL," +
        "totalConsumption REAL," +
        "totalMoney REAL," +
        "totalScore integer," +
        "total_presentMoney REAL," +
        "total_recharge_money REAL," +
        "def_str1 varchar(32)," +
        "def_str2 varchar(64)," +
        "def_str3 varchar(128)," +
        "def_int1 integer," +
        "def_int2 integer," +
        "def_int3 integer," +
        "def_text1 text);";

    var member = [
        "insert into tb_member(id,enterprise_id,name,phoneMobile,sex,birthday,create_date) values('00000000000000002656100','100007103908000100','何诗筠','15299301803','1','543902400000','1365825600000');",
        "insert into tb_member(id,enterprise_id,name,phoneMobile,sex,birthday,create_date) values('00000000000000002657300','100007103908000100','朱雁凡','15152627589','0','609220800000','1360728000000');",
        "insert into tb_member(id,enterprise_id,name,phoneMobile,sex,birthday,create_date) values('00000000000000002658500','100007103908000100','王南霜','13497251791','1','612244800000','1360728000000');",
        "insert into tb_member(id,enterprise_id,name,phoneMobile,sex,birthday,create_date) values('00000000000000002659700','100007103908000100','刘诗双','13336550073','0','411278400000','1357358400000');",
        "insert into tb_member(id,enterprise_id,name,phoneMobile,sex,birthday,create_date) values('00000000000000002660900','100007103908000100','马乐儿','13417668410','1','620366400000','1369195200000');",
        "insert into tb_member(id,enterprise_id,name,phoneMobile,sex,birthday,create_date) values('00000000000000002661110','100007103908000100','王之槐','13880468882','0','519451200000','1365739200000');",
        "insert into tb_member(id,enterprise_id,name,phoneMobile,sex,birthday,create_date) values('00000000000000002662130','100007103908000100','胡初蝶','13818824593','0','426571200000','1368331200000');"
    ];

    var memberCard = ["insert into tb_memberCard(memberId,id,enterprise_id,currentMoney,memberCardCategoryId,cardNo) values('00000000000000002656100','00000000000000002656200','100007103908000100','800','0000000000000000312200','0001');",
        "insert into tb_memberCard(memberId,id,enterprise_id,currentMoney,memberCardCategoryId,cardNo) values('00000000000000002657300','00000000000000002657400','100007103908000100','300','0000000000000000312300','0002');",
        "insert into tb_memberCard(memberId,id,enterprise_id,currentMoney,memberCardCategoryId,cardNo) values('00000000000000002658500','00000000000000002658600','100007103908000100','500','0000000000000000312100','0003');",
        "insert into tb_memberCard(memberId,id,enterprise_id,currentMoney,memberCardCategoryId,cardNo) values('00000000000000002659700','00000000000000002659800','100007103908000100','100','0000000000000000312100','0004');",
        "insert into tb_memberCard(memberId,id,enterprise_id,currentMoney,memberCardCategoryId,cardNo) values('00000000000000002660900','00000000000000002660100','100007103908000100','900','0000000000000000312300','0005');",
        "insert into tb_memberCard(memberId,id,enterprise_id,currentMoney,memberCardCategoryId,cardNo) values('00000000000000002661110','00000000000000002661120','100007103908000100','1600','0000000000000000312100','0006');",
        "insert into tb_memberCard(memberId,id,enterprise_id,currentMoney,memberCardCategoryId,cardNo) values('00000000000000002662130','00000000000000002662140','100007103908000100','1000','0000000000000000312100','0007');"];

    var category = [
        "insert into tb_memberCardCategory(id,name,discounts_goodsDiscount,discounts_serviceDiscount) values('0000000000000000312100','普通','9','9');",
        "insert into tb_memberCardCategory(id,name,discounts_goodsDiscount,discounts_serviceDiscount) values('0000000000000000312200','中级','8','8');",
        "insert into tb_memberCardCategory(id,name,discounts_goodsDiscount,discounts_serviceDiscount) values('0000000000000000312300','高级','6','6');"
    ];

    function initMember(callback) {
        dbInstance.transaction(function (trans) {
            async.each(member, function (item, callback) {
                trans.executeSql(item, [], function (trans, result) {
                    callback(null);
                }, function (trans, error) {
                    console.log(error);
                    callback(null);
                });
            }, function (error, result) {
                if (error) {
                    callback(error);
                    return;
                }
                callback(null);
            });
        });
    }

    function initCard(callback) {
        dbInstance.transaction(function (trans) {
            async.each(memberCard, function (item, callback) {
                trans.executeSql(item, [], function (trans, result) {
                    callback(null);
                }, function (trans, error) {
                    console.log(error);
                    callback(null);
                });
            }, function (error, result) {
                if (error) {
                    callback(error);
                    return;
                }
                callback(null);
            });
        });
    }

    function initCate(callback) {
        dbInstance.transaction(function (trans) {
            async.each(category, function (item, callback) {
                trans.executeSql(item, [], function (trans, result) {
                    callback(null);
                }, function (trans, error) {
                    console.log(error);
                    callback(null);
                });
            }, function (error, result) {
                if (error) {
                    callback(error);
                    return;
                }
                callback(null);
            });
        });
    }

    function initTable(callback) {
        dbInstance.transaction(function (trans) {
            var sqlArray = [tb_member_sql, tb_memberCard_sql, tb_memberCardcate_sql];
            async.eachSeries(sqlArray, function (sql, callback) {
                trans.executeSql(sql, [], function (trans, result) {
                    callback(null);
                }, function (trans, error) {
                    console.error(error);
                    callback(null);
                })
            }, function (error, result) {
                if (error) {
                    callback(error);
                    return;
                }
                callback(null);
            });
        });
    }

    exports.initData = function (callback) {
//        async.waterfall([initTable, initCate, initMember, initCard], function (error, result) {
//            if (error) {
//                console.log("会员初始化失败");
//                callback(error);
//                return;
//            }
//            console.log("会员初始化成功");
//            callback(null);
//        });
        callback(null);
    }
});