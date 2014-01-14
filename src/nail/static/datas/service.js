define(function (require, exports, module) {
    //展品类表表
    var serviceCate = "CREATE TABLE IF NOT EXISTS tb_service_cate ( \
	    id varchar(64) primary key, \
	    name varchar(64), \
	    img text, \
	    create_date integer, \
	    modify_date integer, \
	    enterprise_id varchar(64), \
	    desc text, \
	    def_str1 varchar(32), \
	    def_str2 varchar(64), \
	    def_str3 varchar(128), \
	    def_int1 integer, \
	    def_int2 integer, \
	    def_int3 integer, \
	    def_text1 text)";


    //展品信息表
    var serviceItem = "CREATE TABLE IF NOT EXISTS tb_service ( "
        + "id varchar(64) NOT NULL primary key, " + "name varchar(64) , "
        + "baseInfo_code integer, " + "baseInfo_image integer,  "
        + "prices_purchasePrice varchar(64), " + "prices_rebate integer, "
        + "prices_costPrice integer, " + "prices_salesPrice integer, "
        + "serviceCategory_id varchar(64), " + "workminute integer, "
        + "plusminute integer, " + "plusprice float, "
        + "salescount integer, " + "create_date REAL, "
        + "modify_date REAL, " + "enterprise_id varchar(64), "
        + "comment text, " + "def_str1 varchar(32), "
        + "def_str2 varchar(64), " + "def_str3 varchar(128), "
        + "def_int1 integer, " + "def_int2 integer, "
        + "def_int3 integer, " + "def_text1 text " + ")";

    exports.initData = function (callback) {
        var dbInstance = require("mframework/static/package").database.getDBInstance();		//数据操作服务
        var sqlArray = [serviceCate, serviceItem];

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