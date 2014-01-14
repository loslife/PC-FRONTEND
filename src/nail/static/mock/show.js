define(function (require, exports, module) {
    var mockTargets = require("./mockTargets").controlTargets;
    var database = require("mframework/static/package").database;
    var dbInstance = database.getDBInstance();
    var enterpriseId = YILOS.ENTERPRISEID;
    var createDate = mockTargets.startDate;
    var showInsert = "insert into tb_showitem (categoryId,img,name,id,code,create_date,enterprise_id) VALUES (?,?,?,?,?,'" + createDate + "','" + enterpriseId + "')";
    var cateList = [];
    var cateMap = {};

    //服务数据模版id code不用写
    var showData = [
        ["日式", YILOS.DOCPATH + enterpriseId + "/images/show/001"],
        ["日式", YILOS.DOCPATH + enterpriseId + "/images/show/002"],
        ["日式", YILOS.DOCPATH + enterpriseId + "/images/show/003"],
        ["日式", YILOS.DOCPATH + enterpriseId + "/images/show/004"],
        ["日式", YILOS.DOCPATH + enterpriseId + "/images/show/005"],
        ["日式", YILOS.DOCPATH + enterpriseId + "/images/show/006"],
        ["日式", YILOS.DOCPATH + enterpriseId + "/images/show/007"],
        ["日式", YILOS.DOCPATH + enterpriseId + "/images/show/008"],
        ["日式", YILOS.DOCPATH + enterpriseId + "/images/show/009"],
        ["日式", YILOS.DOCPATH + enterpriseId + "/images/show/010"],
        ["日式", YILOS.DOCPATH + enterpriseId + "/images/show/011"],
        ["日式", YILOS.DOCPATH + enterpriseId + "/images/show/012"],
        ["日式", YILOS.DOCPATH + enterpriseId + "/images/show/013"],
        ["日式", YILOS.DOCPATH + enterpriseId + "/images/show/014"],
        ["日式", YILOS.DOCPATH + enterpriseId + "/images/show/015"],
        ["日式", YILOS.DOCPATH + enterpriseId + "/images/show/016"],
        ["日式", YILOS.DOCPATH + enterpriseId + "/images/show/017"],
        ["日式", YILOS.DOCPATH + enterpriseId + "/images/show/018"],
        ["日式", YILOS.DOCPATH + enterpriseId + "/images/show/019"],
        ["日式", YILOS.DOCPATH + enterpriseId + "/images/show/020"],
        ["日式", YILOS.DOCPATH + enterpriseId + "/images/show/021"],
        ["日式", YILOS.DOCPATH + enterpriseId + "/images/show/022"],
        ["日式", YILOS.DOCPATH + enterpriseId + "/images/show/023"],
        ["日式", YILOS.DOCPATH + enterpriseId + "/images/show/024"],
        ["日式", YILOS.DOCPATH + enterpriseId + "/images/show/025"],

        ["甲片", YILOS.DOCPATH + enterpriseId + "/images/show/026"],
        ["甲片", YILOS.DOCPATH + enterpriseId + "/images/show/027"],
        ["甲片", YILOS.DOCPATH + enterpriseId + "/images/show/028"],
        ["甲片", YILOS.DOCPATH + enterpriseId + "/images/show/029"],
        ["甲片", YILOS.DOCPATH + enterpriseId + "/images/show/030"],
        ["甲片", YILOS.DOCPATH + enterpriseId + "/images/show/031"],
        ["甲片", YILOS.DOCPATH + enterpriseId + "/images/show/032"],
        ["甲片", YILOS.DOCPATH + enterpriseId + "/images/show/033"],
        ["甲片", YILOS.DOCPATH + enterpriseId + "/images/show/034"],
        ["甲片", YILOS.DOCPATH + enterpriseId + "/images/show/035"],
        ["甲片", YILOS.DOCPATH + enterpriseId + "/images/show/036"],
        ["甲片", YILOS.DOCPATH + enterpriseId + "/images/show/037"],
        ["甲片", YILOS.DOCPATH + enterpriseId + "/images/show/038"],
        ["甲片", YILOS.DOCPATH + enterpriseId + "/images/show/039"],
        ["甲片", YILOS.DOCPATH + enterpriseId + "/images/show/040"],
        ["甲片", YILOS.DOCPATH + enterpriseId + "/images/show/041"],
        ["甲片", YILOS.DOCPATH + enterpriseId + "/images/show/042"],
        ["甲片", YILOS.DOCPATH + enterpriseId + "/images/show/043"],
        ["甲片", YILOS.DOCPATH + enterpriseId + "/images/show/044"],
        ["甲片", YILOS.DOCPATH + enterpriseId + "/images/show/045"],
        ["甲片", YILOS.DOCPATH + enterpriseId + "/images/show/046"],
        ["甲片", YILOS.DOCPATH + enterpriseId + "/images/show/047"],
        ["甲片", YILOS.DOCPATH + enterpriseId + "/images/show/048"],
        ["甲片", YILOS.DOCPATH + enterpriseId + "/images/show/049"],
        ["甲片", YILOS.DOCPATH + enterpriseId + "/images/show/050"],

        ["创意", YILOS.DOCPATH + enterpriseId + "/images/show/051"],
        ["创意", YILOS.DOCPATH + enterpriseId + "/images/show/052"],
        ["创意", YILOS.DOCPATH + enterpriseId + "/images/show/053"],
        ["创意", YILOS.DOCPATH + enterpriseId + "/images/show/054"],
        ["创意", YILOS.DOCPATH + enterpriseId + "/images/show/055"],
        ["创意", YILOS.DOCPATH + enterpriseId + "/images/show/056"],
        ["创意", YILOS.DOCPATH + enterpriseId + "/images/show/057"],
        ["创意", YILOS.DOCPATH + enterpriseId + "/images/show/058"],
        ["创意", YILOS.DOCPATH + enterpriseId + "/images/show/059"],
        ["创意", YILOS.DOCPATH + enterpriseId + "/images/show/060"],
        ["创意", YILOS.DOCPATH + enterpriseId + "/images/show/061"],
        ["创意", YILOS.DOCPATH + enterpriseId + "/images/show/062"],
        ["创意", YILOS.DOCPATH + enterpriseId + "/images/show/063"],
        ["创意", YILOS.DOCPATH + enterpriseId + "/images/show/064"],
        ["创意", YILOS.DOCPATH + enterpriseId + "/images/show/065"],
        ["创意", YILOS.DOCPATH + enterpriseId + "/images/show/066"],
        ["创意", YILOS.DOCPATH + enterpriseId + "/images/show/067"],
        ["创意", YILOS.DOCPATH + enterpriseId + "/images/show/068"],
        ["创意", YILOS.DOCPATH + enterpriseId + "/images/show/069"],
        ["创意", YILOS.DOCPATH + enterpriseId + "/images/show/070"],
        ["创意", YILOS.DOCPATH + enterpriseId + "/images/show/071"],
        ["创意", YILOS.DOCPATH + enterpriseId + "/images/show/072"],
        ["创意", YILOS.DOCPATH + enterpriseId + "/images/show/073"],
        ["创意", YILOS.DOCPATH + enterpriseId + "/images/show/074"],
        ["创意", YILOS.DOCPATH + enterpriseId + "/images/show/075"],

        ["雕花", YILOS.DOCPATH + enterpriseId + "/images/show/001"],
        ["雕花", YILOS.DOCPATH + enterpriseId + "/images/show/002"],
        ["雕花", YILOS.DOCPATH + enterpriseId + "/images/show/003"],
        ["雕花", YILOS.DOCPATH + enterpriseId + "/images/show/004"],
        ["雕花", YILOS.DOCPATH + enterpriseId + "/images/show/005"],
        ["雕花", YILOS.DOCPATH + enterpriseId + "/images/show/006"],
        ["雕花", YILOS.DOCPATH + enterpriseId + "/images/show/007"],
        ["雕花", YILOS.DOCPATH + enterpriseId + "/images/show/008"],
        ["雕花", YILOS.DOCPATH + enterpriseId + "/images/show/009"],
        ["雕花", YILOS.DOCPATH + enterpriseId + "/images/show/010"],
        ["雕花", YILOS.DOCPATH + enterpriseId + "/images/show/011"],
        ["雕花", YILOS.DOCPATH + enterpriseId + "/images/show/012"],
        ["雕花", YILOS.DOCPATH + enterpriseId + "/images/show/013"],
        ["雕花", YILOS.DOCPATH + enterpriseId + "/images/show/014"],
        ["雕花", YILOS.DOCPATH + enterpriseId + "/images/show/015"],
        ["雕花", YILOS.DOCPATH + enterpriseId + "/images/show/016"],
        ["雕花", YILOS.DOCPATH + enterpriseId + "/images/show/017"],
        ["雕花", YILOS.DOCPATH + enterpriseId + "/images/show/018"],
        ["雕花", YILOS.DOCPATH + enterpriseId + "/images/show/019"],
        ["雕花", YILOS.DOCPATH + enterpriseId + "/images/show/020"],
        ["雕花", YILOS.DOCPATH + enterpriseId + "/images/show/021"],
        ["雕花", YILOS.DOCPATH + enterpriseId + "/images/show/022"],
        ["雕花", YILOS.DOCPATH + enterpriseId + "/images/show/023"],
        ["雕花", YILOS.DOCPATH + enterpriseId + "/images/show/024"],
        ["雕花", YILOS.DOCPATH + enterpriseId + "/images/show/025"],

        ["甲油胶", YILOS.DOCPATH + enterpriseId + "/images/show/026"],
        ["甲油胶", YILOS.DOCPATH + enterpriseId + "/images/show/027"],
        ["甲油胶", YILOS.DOCPATH + enterpriseId + "/images/show/028"],
        ["甲油胶", YILOS.DOCPATH + enterpriseId + "/images/show/029"],
        ["甲油胶", YILOS.DOCPATH + enterpriseId + "/images/show/030"],
        ["甲油胶", YILOS.DOCPATH + enterpriseId + "/images/show/031"],
        ["甲油胶", YILOS.DOCPATH + enterpriseId + "/images/show/032"],
        ["甲油胶", YILOS.DOCPATH + enterpriseId + "/images/show/033"],
        ["甲油胶", YILOS.DOCPATH + enterpriseId + "/images/show/034"],
        ["甲油胶", YILOS.DOCPATH + enterpriseId + "/images/show/035"],
        ["甲油胶", YILOS.DOCPATH + enterpriseId + "/images/show/036"],
        ["甲油胶", YILOS.DOCPATH + enterpriseId + "/images/show/037"],
        ["甲油胶", YILOS.DOCPATH + enterpriseId + "/images/show/038"],
        ["甲油胶", YILOS.DOCPATH + enterpriseId + "/images/show/039"],
        ["甲油胶", YILOS.DOCPATH + enterpriseId + "/images/show/040"],
        ["甲油胶", YILOS.DOCPATH + enterpriseId + "/images/show/041"],
        ["甲油胶", YILOS.DOCPATH + enterpriseId + "/images/show/042"],
        ["甲油胶", YILOS.DOCPATH + enterpriseId + "/images/show/043"],
        ["甲油胶", YILOS.DOCPATH + enterpriseId + "/images/show/044"],
        ["甲油胶", YILOS.DOCPATH + enterpriseId + "/images/show/045"],
        ["甲油胶", YILOS.DOCPATH + enterpriseId + "/images/show/046"],
        ["甲油胶", YILOS.DOCPATH + enterpriseId + "/images/show/047"],
        ["甲油胶", YILOS.DOCPATH + enterpriseId + "/images/show/048"],
        ["甲油胶", YILOS.DOCPATH + enterpriseId + "/images/show/049"],
        ["甲油胶", YILOS.DOCPATH + enterpriseId + "/images/show/050"],

        ["光疗甲", YILOS.DOCPATH + enterpriseId + "/images/show/051"],
        ["光疗甲", YILOS.DOCPATH + enterpriseId + "/images/show/052"],
        ["光疗甲", YILOS.DOCPATH + enterpriseId + "/images/show/053"],
        ["光疗甲", YILOS.DOCPATH + enterpriseId + "/images/show/054"],
        ["光疗甲", YILOS.DOCPATH + enterpriseId + "/images/show/055"],
        ["光疗甲", YILOS.DOCPATH + enterpriseId + "/images/show/056"],
        ["光疗甲", YILOS.DOCPATH + enterpriseId + "/images/show/057"],
        ["光疗甲", YILOS.DOCPATH + enterpriseId + "/images/show/058"],
        ["光疗甲", YILOS.DOCPATH + enterpriseId + "/images/show/059"],
        ["光疗甲", YILOS.DOCPATH + enterpriseId + "/images/show/060"],
        ["光疗甲", YILOS.DOCPATH + enterpriseId + "/images/show/061"],
        ["光疗甲", YILOS.DOCPATH + enterpriseId + "/images/show/062"],
        ["光疗甲", YILOS.DOCPATH + enterpriseId + "/images/show/063"],
        ["光疗甲", YILOS.DOCPATH + enterpriseId + "/images/show/064"],
        ["光疗甲", YILOS.DOCPATH + enterpriseId + "/images/show/065"],
        ["光疗甲", YILOS.DOCPATH + enterpriseId + "/images/show/066"],
        ["光疗甲", YILOS.DOCPATH + enterpriseId + "/images/show/067"],
        ["光疗甲", YILOS.DOCPATH + enterpriseId + "/images/show/068"],
        ["光疗甲", YILOS.DOCPATH + enterpriseId + "/images/show/069"],
        ["光疗甲", YILOS.DOCPATH + enterpriseId + "/images/show/070"],
        ["光疗甲", YILOS.DOCPATH + enterpriseId + "/images/show/071"],
        ["光疗甲", YILOS.DOCPATH + enterpriseId + "/images/show/072"],
        ["光疗甲", YILOS.DOCPATH + enterpriseId + "/images/show/073"],
        ["光疗甲", YILOS.DOCPATH + enterpriseId + "/images/show/074"],
        ["光疗甲", YILOS.DOCPATH + enterpriseId + "/images/show/075"],

        ["自然甲", YILOS.DOCPATH + enterpriseId + "/images/show/001"],
        ["自然甲", YILOS.DOCPATH + enterpriseId + "/images/show/002"],
        ["自然甲", YILOS.DOCPATH + enterpriseId + "/images/show/003"],
        ["自然甲", YILOS.DOCPATH + enterpriseId + "/images/show/004"],
        ["自然甲", YILOS.DOCPATH + enterpriseId + "/images/show/005"],
        ["自然甲", YILOS.DOCPATH + enterpriseId + "/images/show/006"],
        ["自然甲", YILOS.DOCPATH + enterpriseId + "/images/show/007"],
        ["自然甲", YILOS.DOCPATH + enterpriseId + "/images/show/008"],
        ["自然甲", YILOS.DOCPATH + enterpriseId + "/images/show/009"],
        ["自然甲", YILOS.DOCPATH + enterpriseId + "/images/show/010"],
        ["自然甲", YILOS.DOCPATH + enterpriseId + "/images/show/011"],
        ["自然甲", YILOS.DOCPATH + enterpriseId + "/images/show/012"],
        ["自然甲", YILOS.DOCPATH + enterpriseId + "/images/show/013"],
        ["自然甲", YILOS.DOCPATH + enterpriseId + "/images/show/014"],
        ["自然甲", YILOS.DOCPATH + enterpriseId + "/images/show/015"],
        ["自然甲", YILOS.DOCPATH + enterpriseId + "/images/show/016"],
        ["自然甲", YILOS.DOCPATH + enterpriseId + "/images/show/017"],
        ["自然甲", YILOS.DOCPATH + enterpriseId + "/images/show/018"],
        ["自然甲", YILOS.DOCPATH + enterpriseId + "/images/show/019"],
        ["自然甲", YILOS.DOCPATH + enterpriseId + "/images/show/020"],
        ["自然甲", YILOS.DOCPATH + enterpriseId + "/images/show/021"],
        ["自然甲", YILOS.DOCPATH + enterpriseId + "/images/show/022"],
        ["自然甲", YILOS.DOCPATH + enterpriseId + "/images/show/023"],
        ["自然甲", YILOS.DOCPATH + enterpriseId + "/images/show/024"],
        ["自然甲", YILOS.DOCPATH + enterpriseId + "/images/show/025"],

        ["新娘甲", YILOS.DOCPATH + enterpriseId + "/images/show/026"],
        ["新娘甲", YILOS.DOCPATH + enterpriseId + "/images/show/027"],
        ["新娘甲", YILOS.DOCPATH + enterpriseId + "/images/show/028"],
        ["新娘甲", YILOS.DOCPATH + enterpriseId + "/images/show/029"],
        ["新娘甲", YILOS.DOCPATH + enterpriseId + "/images/show/030"],
        ["新娘甲", YILOS.DOCPATH + enterpriseId + "/images/show/031"],
        ["新娘甲", YILOS.DOCPATH + enterpriseId + "/images/show/032"],
        ["新娘甲", YILOS.DOCPATH + enterpriseId + "/images/show/033"],
        ["新娘甲", YILOS.DOCPATH + enterpriseId + "/images/show/034"],
        ["新娘甲", YILOS.DOCPATH + enterpriseId + "/images/show/035"],
        ["新娘甲", YILOS.DOCPATH + enterpriseId + "/images/show/036"],
        ["新娘甲", YILOS.DOCPATH + enterpriseId + "/images/show/037"],
        ["新娘甲", YILOS.DOCPATH + enterpriseId + "/images/show/038"],
        ["新娘甲", YILOS.DOCPATH + enterpriseId + "/images/show/039"],
        ["新娘甲", YILOS.DOCPATH + enterpriseId + "/images/show/040"],
        ["新娘甲", YILOS.DOCPATH + enterpriseId + "/images/show/041"],
        ["新娘甲", YILOS.DOCPATH + enterpriseId + "/images/show/042"],
        ["新娘甲", YILOS.DOCPATH + enterpriseId + "/images/show/043"],
        ["新娘甲", YILOS.DOCPATH + enterpriseId + "/images/show/044"],
        ["新娘甲", YILOS.DOCPATH + enterpriseId + "/images/show/045"],
        ["新娘甲", YILOS.DOCPATH + enterpriseId + "/images/show/046"],
        ["新娘甲", YILOS.DOCPATH + enterpriseId + "/images/show/047"],
        ["新娘甲", YILOS.DOCPATH + enterpriseId + "/images/show/048"],
        ["新娘甲", YILOS.DOCPATH + enterpriseId + "/images/show/049"],
        ["新娘甲", YILOS.DOCPATH + enterpriseId + "/images/show/050"],
    ];

    //初始化服务类型
    function initShowCate(callback) {
        var cateSelect = "select id,name from tb_showitem_cate;";
        dbInstance.execQuery(cateSelect, [], function (result) {
            for (var i = 0 , len = result.rows.length; i < len; i++) {
                cateList.push(result.rows.item(i));
            }
            //转换为name-id对应的Map
            _.each(cateList, function (item) {
                cateMap[item.name] = item.id;
            });
            callback(null);
        }, function (error) {
            callback(error);
        });
    }

    //替换类型名字为相应id
    function replaceCateNameWithId(callback) {
        async.each(showData, function (item, callback) {
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

    function productNameByNumber(callback) {
        var temp;
        _.each(showData, function (item, index) {
            temp = index % 25;
            item.push(item[0] + (temp === 0 ? 25 : temp));
        });
        callback(null);
    }

    //生成id和code
    function productIdCode(callback) {
        async.each(showData, function (item, callback) {
            database.getUniqueId(enterpriseId, function (error, trans, id) {
                if (error) {
                    callback(error);
                    return;
                }
                item.push(id);
                database.getUniqueCode("tb_show", 4, function (error, trans, code) {
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

    //保存show
    function saveShow(callback) {
        dbInstance.transaction(function (trans) {
            async.each(showData, function (item, callback) {
                trans.executeSql(showInsert, item, function (trans, result) {
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
        async.waterfall([initShowCate, productNameByNumber, replaceCateNameWithId, productIdCode, saveShow], function (error) {
            if (error) {
                callback(error);
                return;
            }
            callback(null);
        });
    }

    exports.init = init;
});