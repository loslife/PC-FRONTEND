define(function (require, exports, module) {

    //展品类表表
    var showCate = "CREATE TABLE IF NOT EXISTS tb_showitem_cate ( \
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
	    def_text1 text )";

    //展品信息表
    var showItem = "CREATE TABLE IF NOT EXISTS tb_showitem ( \
	    id varchar(64) primary key, \
	    categoryId varchar(384), \
	    name varchar(64), \
	    code varchar(32), \
	    img text, \
	    like integer,  \
	    sale integer, \
	    share integer, \
	    comment integer, \
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


    exports.initData = function (callback) {
        var dbInstance = require("mframework/static/package").database.getDBInstance();		//数据操作服务
        var sqlArray = [showCate, showItem];

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