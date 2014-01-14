define(function (require, exports, module) {
    //operating店铺经营项目、用字符串存储、用"、"分隔与维护
    var enterprise = "CREATE TABLE IF NOT EXISTS tb_enterprise("
        + "id varchar(64) NOT NULL primary key," + "name varchar(32),"
        + "addr_area varchar(32)," + "addr_city varchar(32),"
        + "addr_detail varchar(32)," + "addr_state varchar(32),"
        + "addr_state_city_area varchar(128),"
        + "addr_zipCode varchar(32)," + "admin_account varchar(32),"
        + "business varchar(32)," + "brief_introduce text,"
        + "comment text," + "contact_email varchar(64),"
        + "contact_phoneMobile varchar(32),"
        + "contact_weixin varchar(32)," + "contact_qq varchar(32),"
        + "contact_phoneHome varchar(32)," + "contact_office varchar(32),"
        + "corporation varchar(32)," + "payment_id varchar(32),"
        + "hours_begin REAL," + "hours_end REAL," + "money REAL,"
        + "lastrecharge_time REAL," + "expires_time varchar(32),"
        + "register_time REAL," + "create_date REAL," + "modify_date REAL,"
        + "history_software varchar(64)," + "logo varchar(128),"
        + "location varchar(128)," + "mainurl varchar(64),"
        + "sex tinyint," + "version_time REAL,"
        + "version_type varchar(32)," + "def_str1 varchar(32),"
        + "def_str2 varchar(64)," + "def_str3 varchar(128),"
        + "def_int1 int," + "def_int2 int," + "def_int3 int, "
        + "def_text1 text);";

    var enterpriseInsert = "insert into tb_enterprise(id) values('undefined');";

    var user = "CREATE TABLE IF NOT EXISTS tb_users("
        + "id varchar(64)," + "username varchar(64),"
        + "contact_email varchar(64)," + "contact_phoneMobile varchar(32),"
        + "contact_qq varchar(32)," + "contact_weixin varchar(32),"
        + "baseInfo_name varchar(32)," + "baseInfo_image varchar(128),"
        + "baseInfo_sex integer," + "baseInfo_birthday REAL,"
        + "create_date REAL," + "modify_date REAL,"
        + "enterprise_id varchar(64)," + "def_str1 varchar(32),"
        + "def_str2 varchar(64)," + "def_str3 varchar(128),"
        + "def_int1 integer," + "def_int2 integer," + "def_int3 integer,"
        + "def_text1 text);";

    var userInsert = "insert into tb_users(id,username) values('000001','18770056966');";

    //经营项目
    var operateItem = "CREATE TABLE IF NOT EXISTS tb_operateItem("
        + "id varchar(64) NOT NULL primary key,"
        + "enterprise_id varchar(64)," + "name varchar(64),"
        + "code varchar(64)," + "comment text," + "create_date REAL,"
        + "modify_date REAL," + "def_str1 varchar(32),"
        + "def_str2 varchar(64)," + "def_str3 varchar(128),"
        + "def_int1 integer," + "def_int2 integer," + "def_int3 integer,"
        + "def_text1 text);";

    //标准经营项目
    var standOperateItem = "CREATE TABLE IF NOT EXISTS tb_standOperateItem("
        + "id varchar(64)," + "enterprise_id varchar(64),"
        + "name varchar(64)," + "code varchar(64)," + "comment text,"
        + "def_str1 varchar(32)," + "def_str2 varchar(64),"
        + "def_str3 varchar(128)," + "def_int1 integer,"
        + "def_int2 integer," + "def_int3 integer," + "def_text1 text);";

    exports.initData = function (callback) {
        var dbInstance = require("mframework/static/package").database.getDBInstance();
        var sqlArray = [enterprise, user, operateItem, standOperateItem, userInsert, enterpriseInsert];

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


