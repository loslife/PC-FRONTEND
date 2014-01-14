define(function (require,exports,module) {

    //展品类表表
    var tb_showitem_cate_sql = "CREATE TABLE IF NOT EXISTS tb_showitem_cate ( \
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

    var tb_showitem_cate_insert = "INSERT INTO tb_showitem_cate (id,name,img) VALUES (?,?,?)";

    //展品信息表
    var tb_showitem_sql = "CREATE TABLE IF NOT EXISTS tb_showitem ( \
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
	    def_text1 text \
		)";


    var  tb_showitem_drop_sql = "DROP TABLE tb_showitem";

    exports.initData = function(callback){
        var  database  = require("mframework/package").database;

        var db = database.getDBInstance();		//数据操作服务
        db.transaction(function(tx) {
            console.info("初始化展品信息开始");
            var sqls = [tb_showitem_cate_sql,tb_showitem_sql];
            async.eachSeries(sqls,function(sql,callback){
                tx.executeSql(sql,[],function(tx,result){
                    callback(null);
                },function(tx,error){
                    console.error("初始化展品信息失败");
                    console.error(error);
                    callback(null);
                })
            },function(error,result){
                if(error){
                    callback(error);
                    return;
                }
                console.info("开始查询展品信息");
                tx.executeSql("select * from tb_showitem_cate",[],function(tx, results){
                    var len = results.rows.length;
                    if(len<=0){
                    	tx.executeSql("DELETE FROM tb_showitem_cate",[],function(tx, results){
                        	insertData(callback);
                    	},function(tx, error){console.log(error);});	
                    }else{
                    	//insertData();
                    	console.info("展品信息数据量大于1，不进行初始化");
                        callback(null);
                    }
                },function(error){
                    console.log(error);
                });
            });
            


            function insertData(callback){
                var insertDatas = [
                    ["甜美风","../../../images/show/fashi"],
                    ["法式","../../../images/show/fashi"],
                    ["彩绘","../../../images/show/caihui"],
                    ["日式","../../../images/show/rishi"],
                    ["足部美甲","../../../images/show/zubu"],
                    ["甲片","../../../images/show/jiapian"],
                    ["新娘甲","../../../images/show/xinniang"],
                    ["纯色","../../../images/show/chunse"],
                    ["自然甲","../../../images/show/chunse"],
                    ["雕花","../../../images/show/chunse"],
                    ["糖果风","../../../images/show/jiapian"],
                    ["甲油胶","../../../images/show/chunse"],
                    ["光疗甲","../../../images/show/rishi"],
                    ["渐变","../../../images/show/chunse"]
                ];
                var initShowDatas =
                    {
                        "甜美风":[
                            ["基础真甲护理","../../../images/service/zhenjia_1",80],
                            ["全套真甲护理","../../../images/service/zhenjia_2",60],
                            ["经典真甲护理","../../../images/service/zhenjia_3",80],
                            ["经典真甲护理","../../../images/service/zhenjia_3",80],
                            ["经典真甲护理","../../../images/service/zhenjia_3",80],
                            ["经典真甲护理","../../../images/service/zhenjia_3",80],
                            ["经典真甲护理","../../../images/service/zhenjia_3",80],
                            ["经典真甲护理","../../../images/service/zhenjia_3",80],
                            ["经典真甲护理","../../../images/service/zhenjia_3",80],
                            ["经典真甲护理","../../../images/service/zhenjia_3",80],
                            ["经典真甲护理","../../../images/service/zhenjia_3",80],
                            ["经典真甲护理","../../../images/service/zhenjia_3",80],
                            ["经典真甲护理","../../../images/service/zhenjia_3",80],
                            ["经典真甲护理","../../../images/service/zhenjia_3",80],
                            ["经典真甲护理","../../../images/service/zhenjia_3",80],
                            ["经典真甲护理","../../../images/service/zhenjia_3",80],
                            ["经典真甲护理","../../../images/service/zhenjia_3",80],
                            ["甲油","../../../images/service/zhenjia_4",80],
                            ["甲油","../../../images/service/zhenjia_4",80],
                            ["甲油","../../../images/service/zhenjia_4",80],
                            ["甲油","../../../images/service/zhenjia_4",80],
                            ["甲油","../../../images/service/zhenjia_4",80],
                            ["甲油","../../../images/service/zhenjia_4",80],
                            ["甲油","../../../images/service/zhenjia_4",80],
                            ["OP A套餐","../../../images/service/zhenjia_5",80],
                            ["OP A套餐","../../../images/service/zhenjia_5",80],
                            ["OP A套餐","../../../images/service/zhenjia_5",80],
                            ["OP A套餐","../../../images/service/zhenjia_5",80],
                            ["OP A套餐","../../../images/service/zhenjia_5",80],
                            ["OP A套餐","../../../images/service/zhenjia_5",80],
                            ["OP A套餐","../../../images/service/zhenjia_5",80],
                            ["OP A套餐","../../../images/service/zhenjia_5",80],
                            ["OP A套餐","../../../images/service/zhenjia_5",80],
                            ["OP A套餐","../../../images/service/zhenjia_5",80],
                            ["OP B套餐","../../../images/service/zhenjia_6",100],
                            ["OP B套餐","../../../images/service/zhenjia_6",100],
                            ["OP B套餐","../../../images/service/zhenjia_6",100],
                            ["OP B套餐","../../../images/service/zhenjia_6",100],
                            ["OP B套餐","../../../images/service/zhenjia_6",100],
                            ["OP B套餐","../../../images/service/zhenjia_6",100],
                            ["OP B套餐","../../../images/service/zhenjia_6",100],
                            ["OP B套餐","../../../images/service/zhenjia_6",100],
                            ["OP B套餐","../../../images/service/zhenjia_6",100],
                            ["OP C套餐","../../../images/service/zhenjia_7",120],
                            ["OP C套餐","../../../images/service/zhenjia_7",120],
                            ["OP C套餐","../../../images/service/zhenjia_7",120],
                            ["OP C套餐","../../../images/service/zhenjia_7",120],
                            ["OP C套餐","../../../images/service/zhenjia_7",120],
                            ["OP C套餐","../../../images/service/zhenjia_7",120],
                            ["OP 套餐打蜡","../../../images/service/zhenjia_8",80],
                            ["OP 套餐打蜡","../../../images/service/zhenjia_8",80],
                            ["OP 套餐打蜡","../../../images/service/zhenjia_8",80],
                            ["OP 套餐打蜡","../../../images/service/zhenjia_8",80],
                            ["OP 套餐打蜡","../../../images/service/zhenjia_8",80],
                            ["OP 套餐打蜡","../../../images/service/zhenjia_8",80],
                            ["OP 套餐打蜡","../../../images/service/zhenjia_8",80],
                            ["涂指甲油","../../../images/service/zhenjia_9",40],
                            ["涂指甲油","../../../images/service/zhenjia_9",40],
                            ["涂指甲油","../../../images/service/zhenjia_9",40],
                            ["涂指甲油","../../../images/service/zhenjia_9",40],
                            ["涂指甲油","../../../images/service/zhenjia_9",40],
                            ["涂指甲油","../../../images/service/zhenjia_9",40],
                        ],
                    "法式":[
                            ["单手热疗","../../../images/service/pihu_1",80],
                            ["双手热疗","../../../images/service/pihu_2",80],
                            ["OPI香薰手护","../../../images/service/pihu_3",180],
                            ["OPI手部SPA","../../../images/service/pihu_4",280],
                            ["足部热疗","../../../images/service/pihu_5",380],
                            ["OPI香薰足护","../../../images/service/pihu_6",80],
                            ["OPI足部SPA","../../../images/service/pihu_7",88]
                        ],
                   "彩绘":[
                            ["全贴甲","../../../images/service/shourenzaojia_1",80],
                            ["单贴甲","../../../images/service/shourenzaojia_2",68],
                            ["法式贴片甲","../../../images/service/shourenzaojia_3",80],
                            ["QQ甲胶","../../../images/service/shourenzaojia_4",88],
                            ["国产水晶甲","../../../images/service/shourenzaojia_5",188],
                            ["真甲水晶加固","../../../images/service/shourenzaojia_6",80]
                        ]

                    };



                async.eachSeries(insertDatas,function(data,callback){
                    database.getUniqueCode("showitem_cate",3,function(error,txx,id){
                        data.push(id);
                        txx.executeSql("INSERT INTO tb_showitem_cate (name,img,id) VALUES (?,?,?)",data,
                            function(tx, results){
                                var showDatas = initShowDatas[data[0]];
                                if(showDatas){
                                    initShowData(id,showDatas)
                                }
                             	callback(null)
                             },
                            function(tx, error){
                            	console.log(error);callback(null)
                           });
                    });
                },function(error,result){
                	if(error){
                	}else{
                		console.info("展品数据插入成功");
                	}
                    callback(null);
                })


                function initShowData(categoryId,showDatas){
                    async.eachSeries(showDatas,function(dataItem,callback){
                        var datas = [];
                        datas.push(dataItem[0]);
                        datas.push(dataItem[1]);
                        datas.push((new Date().getTime()));
                        datas.push(categoryId);
                        database.getUniqueCode("tb_showitem",3,function(error,txx,code){
                            datas.push(code);
                            database.getUniqueId(YILOS.ENTERPRISEID,function(error,txx,id){
                                datas.push(id);
                                txx.executeSql("INSERT INTO tb_showitem (name,img,create_date,categoryId,code,id) VALUES (?,?,?,?,?,?)",
                                    datas,
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


                    },function(error,result){
                        if(error){
                        }else{
                            console.info("展品数据插入成功");
                        }
                        callback(null);
                    })
                }



            }

        });


    }
})