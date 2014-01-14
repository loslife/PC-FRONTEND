    define(function (require,exports,module) {

    var database = require("mframework/package").database.getDBInstance();		//数据操作服务

    exports.initTable =  function(callback){

        database.transaction(function(tx) {
            console.info("开始初始化客户端系统表");
            async.eachSeries(sqls,function(sql,callback){
                tx.executeSql(sql,[],function(tx,result){
                    callback(null);
                },function(tx,error){
                	console.error("开始初始化客户端失败"+sql);
                	console.error(error);
                    callback(error);
                })
            },function(error,result){
                if(error){
                    callback();
                    return;
                }
                callback();
                console.info("创建客户端系统表成功");
            });
	    });
    }


    var tbl_images_sql = " CREATE TABLE IF NOT EXISTS tb_images( "
        + "id varchar(64) PRIMARY KEY ," + "rel_id varchar(64) , "
        + "url text, " + "comment text " + ")";

    var tb_clientstage = "CREATE TABLE IF NOT EXISTS tb_clientstage (id integer primary key, "+
        "stage varchar(32), "+
        "tableno integer, "+
        "version varchar(32), "+
        "lastsync varchar(32), "+
        "create_date integer, "+
        "modify_date integer)";
        

    var tbl_ticket_mutex = "CREATE TABLE IF NOT EXISTS ticket_mutex ( \
        name varchar(64) PRIMARY KEY, \
        value varchar(32)  \
    )";

    var tbl_ticket_mutex_1 = "INSERT INTO ticket_mutex(name, value) values('ENTITY', 1)"

    var tbl_record_router = "CREATE TABLE IF NOT EXISTS record_router ( \
        id varchar(32)  NOT NULL PRIMARY KEY , \
        tableName varchar(32) NOT NULL  \
    )";

    var sys_config = "CREATE TABLE IF NOT EXISTS sys_config ( \
        name varchar(32) NOT NULL PRIMARY KEY , \
        value varchar(32) NOT NULL  \
    )";

    var sqls = [tbl_images_sql,tb_clientstage,tbl_ticket_mutex
        ,tbl_record_router,sys_config ,tbl_ticket_mutex_1
    ];

})