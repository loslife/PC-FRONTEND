define(function (require, exports, module) {
    //打印机设置信息记录表
    var printer = "CREATE TABLE IF NOT EXISTS tb_printer ( "
        + "id varchar(64),"
        + "printer_name varchar(64),"
        + "printer_address varchar(64),"
        + "bluetooth_name varchar(64),"
        + "bluetooth_pwd varchar(32),"
        + "print_density varchar(64),"
        + "print_number varchar(32),"
        + "use_flag varchar(32),"
        + "create_date REAL,"
        + "modify_date REAL,"
        + "enterprise_id varchar(64),"
        + "desc text,"
        + "def_str1 varchar(32),"
        + "def_str2 varchar(64),"
        + "def_str3 varchar(128),"
        + "def_int1 integer,"
        + "def_int2 integer,"
        + "def_int3 integer,"
        + "def_text1 text,"
        + "primary key (id))";


    exports.initData = function (callback) {
        var dbInstance = require("mframework/static/package").database.getDBInstance();
        var sqlArray = [printer];

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