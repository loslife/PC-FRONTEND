define(function (require, exports, module) {
    //operating店铺经营项目、用字符串存储、用"、"分隔与维护
    var tb_enterprise_sql = "CREATE TABLE IF NOT EXISTS tb_enterprise(" +
        "id varchar(64)," +
        "name varchar(32)," +
        "addr_area varchar(32)," +
        "addr_city varchar(32)," +
        "addr_state varchar(32)," +
        "addr_detail varchar(32)," +
        "addr_state_city_area varchar(128)," +
        "addr_zipCode varchar(32)," +
        "admin_account varchar(32)," +
        "business varchar(32)," +
        "brief_introduce text," +
        "comment text," +
        "contact_email varchar(64)," +
        "contact_phoneMobile varchar(32)," +
        "contact_weixin varchar(32)," +
        "contact_qq varchar(32)," +
        "contact_phoneHome varchar(32)," +
        "contact_office varchar(32)," +
        "corporation varchar(32)," +
        "hours_begin varchar(32)," +
        "hours_end varchar(32)," +
        "date_register REAL," +
        "history_software varchar(64)," +
        "logo varchar(128)," +
        "location varchar(128)," +
        "mainurl varchar(64)," +
        "sex tinyint," +
        "version_time REAL," +
        "version_type varchar(32)," +
        "operating text," +
        "modify_date REAL" +
        "def_str1 varchar(32)," +
        "def_str2 varchar(64)," +
        "def_str3 varchar(128)," +
        "def_int1 int," +
        "def_int2 int," +
        "def_int3 int, " +
        "def_text1 text)";

    var tb_users_sql = "CREATE TABLE IF NOT EXISTS tb_users("
        + "id varchar(64),"
        + "username varchar(64),"
        + "contact_email varchar(64),"
        + "contact_phoneMobile varchar(32),"
        + "contact_qq varchar(32),"
        + "contact_weixin varchar(32),"
        + "baseInfo_name varchar(32),"
        + "baseInfo_image varchar(128),"
        + "baseInfo_sex integer,"
        + "baseInfo_birthday REAL,"
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

    //经营项目
    var tb_operateItem_sql = "CREATE TABLE IF NOT EXISTS tb_operateItem("
        + "id varchar(64),"
        + "enterprise_id varchar(64),"
        + "name varchar(64),"
        + "code varchar(64),"
        + "comment text,"
        + "create_date REAL,"
        + "modify_date REAL,"
        + "def_str1 varchar(32),"
        + "def_str2 varchar(64),"
        + "def_str3 varchar(128),"
        + "def_int1 integer,"
        + "def_int2 integer,"
        + "def_int3 integer,"
        + "def_text1 text);";

    //标准经营项目
    var tb_standOperateItem = "CREATE TABLE IF NOT EXISTS tb_standOperateItem("
        + "id varchar(64),"
        + "enterprise_id varchar(64),"
        + "name varchar(64),"
        + "code varchar(64),"
        + "comment text,"
        + "def_str1 varchar(32),"
        + "def_str2 varchar(64),"
        + "def_str3 varchar(128),"
        + "def_int1 integer,"
        + "def_int2 integer,"
        + "def_int3 integer,"
        + "def_text1 text);";

    exports.initData = function (callback) {
        var db = require("mframework/package").database.getDBInstance();		//数据操作服务
        db.transaction(function (trans) {
            console.info("初始化店铺表开始");
            var sqlStr = [tb_enterprise_sql, tb_users_sql, tb_operateItem_sql];
            async.eachSeries(sqlStr, function (sql, callback) {
                trans.executeSql(sql, [], function (trans, result) {
                    callback(null);
                }, function (trans, error) {
                    console.error("初始化店铺表失败");
                    console.error(error);
                    callback(null);
                })
            }, function (error, result) {
                if (error) {
                    callback(error);
                    return;
                }
                console.info("初始化店铺表成功");
                callback(null);
            });
        });
    }
});


