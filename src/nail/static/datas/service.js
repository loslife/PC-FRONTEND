define(function (require,exports,module) {
    //展品类表表
    var tb_service_cate_sql = "CREATE TABLE IF NOT EXISTS tb_service_cate ( \
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
	    def_text1 text \
		)";

    var tb_service_cate_insert = "INSERT INTO tb_service_cate (name,id,create_date,enterprise_id) VALUES (?,?," + new Date().getTime() + ",'100004104984000200')";

    var tb_service_insert = "INSERT INTO tb_service (" +
        "name,baseInfo_image,prices_salesPrice,serviceCategory_id,baseInfo_code,id,create_date,enterprise_id) VALUES (?,?,?,?,?,?," + new Date().getTime() + ",'100004104984000200')";

    var tb_service_drop_sql = "DROP TABLE IF EXISTS tb_service";

    //展品信息表
    var tb_service_sql = "CREATE TABLE IF NOT EXISTS tb_service ( "
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

    exports.initData = function(callback){
        var  database  = require("mframework/package").database;

        var db = database.getDBInstance();		//数据操作服务
        db.transaction(function(tx) {
            var sqls = [tb_service_cate_sql,tb_service_sql];
            async.eachSeries(sqls,function(sql,callback){
                tx.executeSql(sql,[],function(tx,result){
                    callback(null);
                },function(tx,error){
                    callback(null);
                })
            },function(error,result){
                callback(null);
//                tx.executeSql("select * from tb_service_cate",[],function(tx, results){
//                    var len = results.rows.length;
//                    if(len<=0){
//                        tx.executeSql("DELETE FROM tb_service_cate",[],function(tx, results){
//                            tx.executeSql("DELETE FROM tb_service",[],function(tx, results){
//                                console.info("清空数据成功");
//                                insertCateData(callback);
//                                },
//                                function(tx, error){console.log(error);}
//                            )
//                        },
//                        function(tx, error){console.log(error);});
//                    }else{
//                    	console.info("展品信息数据量大于1，不进行初始化");
//                        callback(null);
//                    }
//                },function(error){
//                    console.log(error);
//                });
            });
            var initDatas = [
                {
                    name:"真甲护理",
                    services:[
                        ["基础真甲护理","../../../images/service/zhenjia_1",80],
                        ["全套真甲护理","../../../images/service/zhenjia_2",60],
                        ["经典真甲护理","../../../images/service/zhenjia_3",80],
                        ["甲油","../../../images/service/zhenjia_4",80],
                        ["OP A套餐","../../../images/service/zhenjia_5",80],
                        ["OP B套餐","../../../images/service/zhenjia_6",100],
                        ["OP C套餐","../../../images/service/zhenjia_7",120],
                        ["OP 套餐打蜡","../../../images/service/zhenjia_8",80],
                        ["涂指甲油","../../../images/service/zhenjia_9",40],
                    ]
                },
                {
                    name:"皮肤护理",
                    services:[
                        ["单手热疗","../../../images/service/pihu_1",80],
                        ["双手热疗","../../../images/service/pihu_2",80],
                        ["OPI香薰手护","../../../images/service/pihu_3",180],
                        ["OPI手部SPA","../../../images/service/pihu_4",280],
                        ["足部热疗","../../../images/service/pihu_5",380],
                        ["OPI香薰足护","../../../images/service/pihu_6",80],
                        ["OPI足部SPA","../../../images/service/pihu_7",88]
                    ]
                },
                {
                    name:"手人造甲",
                    services:[
                        ["全贴甲","../../../images/service/shourenzaojia_1",80],
                        ["单贴甲","../../../images/service/shourenzaojia_2",68],
                        ["法式贴片甲","../../../images/service/shourenzaojia_3",80],
                        ["QQ甲胶","../../../images/service/shourenzaojia_4",88],
                        ["国产水晶甲","../../../images/service/shourenzaojia_5",188],
                        ["真甲水晶加固","../../../images/service/shourenzaojia_6",80]
                    ]
                } ,
                {
                    name:"足人造甲",
                    services:[
                        ["全贴甲","../../../images/service/zuburenzaojia_1",80],
                        ["单贴甲","../../../images/service/zuburenzaojia_2",88],
                        ["法式贴片甲","../../../images/service/zuburenzaojia_3",128],
                        ["QQ甲胶","../../../images/service/zuburenzaojia_4",80],
                        ["国产水晶甲","../../../images/service/zuburenzaojia_5",88],
                        ["真甲水晶加固","../../../images/service/zuburenzaojia_6",80]
                    ]
                } ,
                {
                    name:"彩绘镶嵌",
                    services:[
                        ["手绘法式","../../../images/service/caihui_1",98],
                        ["魔幻渐变","../../../images/service/caihui_2",80],
                        ["镭射片镶边","../../../images/service/caihui_3",80],
                        ["彩绘钩花","../../../images/service/caihui_4",80],
                        ["雕花","../../../images/service/caihui_5",180],
                        ["双色花","../../../images/service/caihui_6",80],
                        ["镶钻","../../../images/service/caihui_7",280],
                        ["异性钻","../../../images/service/caihui_8",380]
                    ]
                },
                {
                    name:"自带产品",
                    services:[
                        ["OPI手部SPA","../../../images/service/zisai_1",180],
                        ["OPI三部曲","../../../images/service/zidai_2",88],
                        ["OPI香薰手护","../../../images/service/zisai_3",98],
                        ["OPI香薰足护","../../../images/service/zisai_4",80],
                        ["OPI足部SPA","../../../images/service/zidai_5",88]
                    ]
                }];


            function insertCateData(callback){
                var serviceTasks = [];
                async.eachSeries(initDatas,function(data,callback){
                    database.getUniqueId(YILOS.ENTERPRISEID,function(error,txx,id){
                        var cate = [data.name,id]
                        txx.executeSql(tb_service_cate_insert,cate,
                            function(tx, results){
                                _.each(data.services,function(service){
                                    serviceTasks.push(function(callback){
                                        service.push(id);
                                        insertServiceData(service,callback)
                                    });
                                });
                                callback(null);
                            },
                            function(tx, error){
                                console.log(error);callback(null)}
                        );
                    });
                },function(error,result){
                	if(error){
                		console.error("开始初始化服务信息失败");
                		console.error(error);
                	}
                    async.series(serviceTasks,function(error,result){
                        if(error){
                            console.log("init Service Fail!");

                        }else{
                            console.log("init Service success");
                        }
                        callback(null);
                    })
                })

                function insertServiceData(service,callback){
                    database.getUniqueCode("tb_service",3,function(error,txx,id){
                        service.push(id);
                        database.getUniqueId(YILOS.ENTERPRISEID,function(error,txx,id){
                            service.push(id);
                            txx.executeSql(tb_service_insert,service,
                                function(tx, results){
                                    callback(null);
                                },
                                function(tx, error){
                                    console.log(error);
                                    callback(null)
                                }
                            );
                        });
                    });
                }
            }
        });
    }
})