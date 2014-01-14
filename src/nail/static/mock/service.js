define(function (require, exports, module) {
    var mockTargets = require("./mockTargets").controlTargets;
    var database = require("mframework/static/package").database;
    var dbInstance = database.getDBInstance();
    var enterpriseId = YILOS.ENTERPRISEID;
    var createDate = mockTargets.startDate;
    var serviceInsert = "insert into tb_service(serviceCategory_id,name,prices_salesPrice,comment,baseInfo_image,id,baseInfo_code,create_date,enterprise_id) VALUES (?,?,?,?,?,?,?,'" + createDate + "','" + enterpriseId + "')";
    var cateList = [];
    var cateMap = {};

    //服务数据模版id code不用写
    var serviceData = [
        ["水晶指甲", "自然水晶指甲", "288", "", YILOS.DOCPATH + enterpriseId + "/images/service/001"],
        ["水晶指甲", "璀璨水晶指甲", "329", "", YILOS.DOCPATH + enterpriseId + "/images/service/002"],
        ["水晶指甲", "半甲法式水晶", "370", "", YILOS.DOCPATH + enterpriseId + "/images/service/003"],
        ["水晶指甲", "琉璃璀璨水晶", "453", "", YILOS.DOCPATH + enterpriseId + "/images/service/004"],
        ["水晶指甲", "夹心水晶指甲", "493", "", YILOS.DOCPATH + enterpriseId + "/images/service/005"],
        ["水晶指甲", "法式水晶指甲", "515", "", YILOS.DOCPATH + enterpriseId + "/images/service/006"],
        ["水晶指甲", "一般水晶修补", "206", "", YILOS.DOCPATH + enterpriseId + "/images/service/007"],
        ["水晶指甲", "水晶指甲卸除", "206", "", YILOS.DOCPATH + enterpriseId + "/images/service/008"],
        ["水晶指甲", "卸甲重作水晶", "82", "", YILOS.DOCPATH + enterpriseId + "/images/service/009"],
        ["水晶指甲", "光疗上层补强", "41", "", YILOS.DOCPATH + enterpriseId + "/images/service/010"],

        ["光疗指甲", "透明光疗", "185", "", YILOS.DOCPATH + enterpriseId + "/images/service/011"],
        ["光疗指甲", "单色光疗", "226", "", YILOS.DOCPATH + enterpriseId + "/images/service/012"],
        ["光疗指甲", "璀璨光疗", "247", "", YILOS.DOCPATH + enterpriseId + "/images/service/013"],
        ["光疗指甲", "法式光疗", "288", "", YILOS.DOCPATH + enterpriseId + "/images/service/014"],
        ["光疗指甲", "光疗修补", "206", "", YILOS.DOCPATH + enterpriseId + "/images/service/015"],
        ["光疗指甲", "光疗指甲卸除", "165", "", YILOS.DOCPATH + enterpriseId + "/images/service/016"],
        ["光疗指甲", "卸甲重做光疗", "82", "", YILOS.DOCPATH + enterpriseId + "/images/service/017"],

        ["指甲彩绘", "手绘彩绘(一双)", "82", "", YILOS.DOCPATH + enterpriseId + "/images/service/018"],
        ["指甲彩绘", "立体粉雕", "226", "", YILOS.DOCPATH + enterpriseId + "/images/service/019"],
        ["指甲彩绘", "手部单色上色(一双)", "30", "", YILOS.DOCPATH + enterpriseId + "/images/service/020"],
        ["指甲彩绘", "足部单色上色(一双)", "40", "", YILOS.DOCPATH + enterpriseId + "/images/service/021"],
        ["指甲彩绘", "手部法式·璀璨上色(一双)", "50", "", YILOS.DOCPATH + enterpriseId + "/images/service/022"],
        ["指甲彩绘", "足部法式·璀璨上色(一双)", "60", "", YILOS.DOCPATH + enterpriseId + "/images/service/023"],
        ["指甲彩绘", "施华洛世奇砖(单颗)", "3", "", YILOS.DOCPATH + enterpriseId + "/images/service/024"],

        ["手部保养", "手部基础护理(20分钟)", "60", "消毒、去色、修型、指面拋光、指缘保养、上色", YILOS.DOCPATH + enterpriseId + "/images/service/025"],
        ["手部保养", "手部基础保养(40分钟)", "133", "消毒、去色、修型、修磨两侧硬皮、手浴、甘皮处理、指面拋光、指缘保养、果酸去角质 、保湿乳液、上色", YILOS.DOCPATH + enterpriseId + "/images/service/026"],
        ["手部保养", "精致手部深层保养(60分钟)", "185", "消毒、去色、修型、芬香手浴、修磨两侧硬皮、甘皮处理、指面拋光、指缘保养、果酸去角质、按摩、美白淡斑保湿精华、美白敷膜或保湿蜜蜡、保湿乳霜、上色", YILOS.DOCPATH + enterpriseId + "/images/service/027"],

        ["足部保养", "足部基础护理(30分钟)", "93", "消毒、去色、修型、指面拋光、指缘保养、上色", YILOS.DOCPATH + enterpriseId + "/images/service/028"],
        ["足部保养", "足部基础保养(50分钟)", "206", "消毒、足浴、果酸去角质、修型、修磨两侧硬皮、甘皮处理、指面拋光、指缘保养、磨脚底硬皮、保湿乳霜 、上色", YILOS.DOCPATH + enterpriseId + "/images/service/029"],
        ["足部保养", "足部蜜蜡保养(60分钟)", "246", "消毒、足浴、果酸去角质、修型、修磨两侧硬皮、甘皮处理、指面拋光、指缘保养、磨脚底硬皮 、保湿蜜蜡 、保湿乳霜 、上色", YILOS.DOCPATH + enterpriseId + "/images/service/030"],
        ["足部保养", "精致足部深层保养(90分钟)", "330", "消毒、足浴、海盐去角质、修型、修磨两侧硬皮、甘皮处理、指面拋光、指缘保养、磨腳底硬皮、按摩、美白淡斑精华、美白敷膜或保湿蜜蜡、足底保湿、上色", YILOS.DOCPATH + enterpriseId + "/images/service/031"],

        ["美容", "修眉毛", "10", "", YILOS.DOCPATH + enterpriseId + "/images/service/032"],
        ["美容", "手臂脱毛", "50", "", YILOS.DOCPATH + enterpriseId + "/images/service/033"],
        ["美容", "小腿脱毛", "80", "", YILOS.DOCPATH + enterpriseId + "/images/service/034"],
        ["美容", "腋下脱毛", "50", "", YILOS.DOCPATH + enterpriseId + "/images/service/035"],
        ["美容", "嫁接睫毛单次", "88", "", YILOS.DOCPATH + enterpriseId + "/images/service/036"],
        ["美容", "嫁接睫毛一个月随时补", "138", "", YILOS.DOCPATH + enterpriseId + "/images/service/037"],
        ["美容", "嫁接睫毛三个月随时补", "380", "", YILOS.DOCPATH + enterpriseId + "/images/service/038"],
        ["美容", "日本娃娃卷翘术", "100", "", YILOS.DOCPATH + enterpriseId + "/images/service/039"],

        ["化妆", "生活妆", "40", "", YILOS.DOCPATH + enterpriseId + "/images/service/040"],
        ["化妆", "透明妆", "40", "", YILOS.DOCPATH + enterpriseId + "/images/service/041"],
        ["化妆", "晚宴妆", "80", "", YILOS.DOCPATH + enterpriseId + "/images/service/042"],
        ["化妆", "舞台妆", "80", "", YILOS.DOCPATH + enterpriseId + "/images/service/043"],
        ["化妆", "新娘妆(不跟妆)", "280", "", YILOS.DOCPATH + enterpriseId + "/images/service/044"],
        ["化妆", "新娘妆(跟妆)", "600", "", YILOS.DOCPATH + enterpriseId + "/images/service/045"],

        ["光疗甲油", "光疗甲油上色", "165", "", YILOS.DOCPATH + enterpriseId + "/images/service/046"],
        ["光疗甲油", "渐层光疗甲油", "185", "", YILOS.DOCPATH + enterpriseId + "/images/service/047"],
        ["光疗甲油", "法式光疗甲油", "247", "", YILOS.DOCPATH + enterpriseId + "/images/service/048"]
    ];

    //初始化服务类型
    function initServiceCate(callback) {
        var cateSelect = "select id,name from tb_service_cate;";
        dbInstance.execQuery(cateSelect, [], function (result) {
            for (var i = 0 , len = result.rows.length; i < len; i++) {
                cateList.push(result.rows.item(i));
            }
            _.each(cateList, function (item) {
                cateMap[item.name] = item.id;
            });
            callback(null);
        }, function (error) {
            callback(error);
        });
    }

    //将服务名字替换为id
    function replaceNameWithId(callback) {
        async.each(serviceData, function (item, callback) {
            item[0] = cateMap[item[0]];
            callback(null);
        }, function (error) {
            if (error) {
                callback(error);
                return;
            }
            callback(null);
        });
    }

    //生成id和code
    function productIdCode(callback) {
        async.each(serviceData, function (item, callback) {
            database.getUniqueId(enterpriseId, function (error, trans, id) {
                if (error) {
                    callback(error);
                    return;
                }
                item.push(id);
                database.getUniqueCode("tb_service", 4, function (error, trans, code) {
                    if (error) {
                        callback(error);
                        return;
                    }
                    item.push(code);
                    callback(null);
                })
            });
        }, function (error) {
            if (error) {
                callback(error);
                return;
            }
            callback(null);
        });
    }

    //保存服务
    function saveService(callback) {
        dbInstance.transaction(function (trans) {
            async.each(serviceData, function (item, callback) {
                trans.executeSql(serviceInsert, item, function (trans, result) {
                    callback(null);
                }, function (trans, error) {
                    callback(error);
                });
            }, function (error) {
                if (error) {
                    console.log(error);
                    return;
                }
                callback(null);
            });
        });
    }

    function init(callback) {
        async.waterfall([initServiceCate, replaceNameWithId, productIdCode, saveService], function (error) {
            if (error) {
                callback(error);
                return;
            }
            callback(null);
        });
    }

    exports.init = init;
});