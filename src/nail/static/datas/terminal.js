define(function (require, exports, module) {
    //打印机设置信息记录表
    var tb_printer_sql = "CREATE TABLE IF NOT EXISTS tb_printer ( \
	    id varchar(64) primary key, \
	    printer_name text, \
	    printer_address text, \
	    bluetooth_name text, \
	    bluetooth_pwd text,\
	    print_density text,\
	    print_number text,\
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
	    def_text1 text \
		)";

    var insert_tb_printer_sql = "insert into tb_printer(id,printer_name,printer_address,bluetooth_name,bluetooth_pwd,print_density,print_number,create_date,modify_date,enterprise_id) " +
        "values(1,'','','','','','','','','');";

    //小票设置信息记录表
    var tb_smallTicket_sql = "CREATE TABLE IF NOT EXISTS tb_smallTicket ( \
	    id varchar(64) primary key, \
	    discount_amount integer, \
	    balance integer, \
	    cashier integer, \
	    open_card integer, \
	    recharge integer,  \
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
	    def_text1 text \
		)";

    var insert_tb_smallTicket_sql = "insert into tb_smallTicket(id,discount_amount,balance,cashier,open_card,recharge,create_date,modify_date,enterprise_id) " +
        "values(1,'','','','','','','','');";

    exports.initData = function (callback) {
        var database = require("mframework/package").database;
        var db = database.getDBInstance();		//数据操作服务
        db.transaction(function (tx) {
            console.info("初始化表");
            var sqls = [tb_printer_sql, tb_smallTicket_sql];
            async.eachSeries(sqls, function (sql, callback) {
                tx.executeSql(sql, [], function (tx, result) {
                    console.log("建表成功,sql:" + sql);
                    callback(null);
                }, function (tx, error) {
                    console.log("建表失败,sql:" + sql + ",error:" + error);
                    callback(null);
                })
            }, function (error, result) {
                console.log("执行最后的回调");
                callback(error);
            });
        });
    }
})