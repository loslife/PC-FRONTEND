//会员类型模块对应的数据接口
define(function (require, exports, module) {
    var database = require("mframework/static/package").database;
    var dataUtils = require("mframework/static/package").dataUtils;
    var utils = require("mframework/static/package").utils;
    var cache = utils.getCache();
    var dbInstance = database.getDBInstance();

    exports.isCateHaveMember = isCateHaveMember;//根据类型id判断是否存在会员
    exports.deleteRechargeCate = deleteRechargeCate;//删除充值卡
    exports.deleteRecordCate = deleteRecordCate;//删除记次卡

    exports.newRechargeCate = newRechargeCate;//新增充值卡
    exports.updateRechargeCate = updateRechargeCate;//修改充值卡

    exports.newRecordCate = newRecordCate;//新增记次卡
    exports.updateRecordCate = updateRecordCate;//修改记次卡

    exports.initServiceList = initServiceList;//初始化服务数据
    exports.initCateServiceList = initCateServiceList;//初始化记次卡关联的服务数据
    exports.initCateList = initCateList;//初始化会员卡类型
    exports.cateMemberCount = cateMemberCount;//统计会员类型下的会员数
    exports.reInitServiceList = reInitServiceList;


    //根据类型id判断是否存在会员
    function isCateHaveMember(cateId, callback) {
        var selectMemberCount = "select count(*) as count from tb_memberCard where memberCardCategoryId=?;";
        dbInstance.execQuery(selectMemberCount, [cateId], function (result) {
            if (result.rows.length === 0) {
                callback(selectMemberCount + cateId + "查询出错");
                return;
            }
            if (result.rows.item(0).count !== 0) {
                callback(null, true);
            }
            else {
                callback(null, false);
            }
        }, function (error) {
            callback(error);
        });
    }

    //根据类型id删除卡类型，返回影响记录条数
    function deleteRechargeCate(rechargeCate, callback) {
        dataUtils.deleteRecordById("tb_memberCardCategory", rechargeCate.id, callback);
    }

    function deleteRecordCate(recordCate, callback) {
        var sqlArray = [];
        sqlArray.push({statement: "delete from tb_recordCateServices where cardCateId=?;", value: [recordCate.id]});
        sqlArray.push(dataUtils.getDelSqlById("tb_memberCardCategory", recordCate.id));
        dataUtils.batchExecuteSql(sqlArray, callback);
    }

    //新增充值卡
    function newRechargeCate(rechargeCate, callback) {
        database.getUniqueId(YILOS.ENTERPRISEID, function (error, trans, id) {
            if (error) {
                callback(error);
                return;
            }
            rechargeCate.id = id;
            dataUtils.insertRecord("tb_memberCardCategory", rechargeCate, null, callback);
        });
    }

    function updateRechargeCate(rechargeCate, callback) {
        dataUtils.updateRecordById("tb_memberCardCategory", rechargeCate, null, callback);
    }

    function newRecordCate(recordCate, serviceList, callback) {
        var sqlArray = [];
        database.getUniqueId(YILOS.ENTERPRISEID, function (error, trans, id) {
            if (error) {
                callback(error);
                return;
            }
            recordCate.id = id;
            sqlArray.push(dataUtils.getInsertSqlOfObj("tb_memberCardCategory", recordCate));
            async.each(serviceList, function (item, callback) {
                database.getUniqueId(YILOS.ENTERPRISEID, function (error, trans, id) {
                    if (error) {
                        callback(error);
                        return;
                    }
                    item.id = id;
                    item.cardCateId = recordCate.id;
                    sqlArray.push(dataUtils.getInsertSqlOfObj("tb_recordCateServices", item));
                    callback(null);
                });
            }, function (error) {
                if (error) {
                    callback(error);
                    return;
                }
                dataUtils.batchExecuteSql(sqlArray, callback);
            });
        });
    }

    function initServiceList(model, callback) {
        model.serviceCateMap = cache.getObject("service.category.map");
        model.serviceList = cache.getObject("service.itemList");
        model.serviceCate = cache.getObject("service.productCategories");

        //若缓存中不存在该对象、得到的是undefined、&&运算后为false
        if (model.serviceCateMap && model.serviceList && model.serviceCate) {
            callback(null, model);
        }
        else {
            //缓存不存在时重新查询并设回缓存
            model.serviceCateMap = {};
            model.serviceList = {};
            model.serviceCate = {};
            async.waterfall([queryCate, queryItems], function (error) {
                if (error) {
                    callback(error, model);
                    return;
                }
                cache.set("service.category.map", model.serviceCateMap, true);
                cache.set("service.itemList", model.serviceList, true);
                cache.set("service.productCategories", model.serviceCate, true);
                callback(null, model);
            });
        }

        function queryCate(callback) {
            var selectCate = "select a.id ,a.name from tb_service_cate a;";
            dbInstance.execQuery(selectCate, [], function (result) {
                var len = result.rows.length;
                for (var i = 0; i < len; i++) {
                    var tmp = result.rows.item(i);
                    if (i == 0) {
                        model.serviceCateSelected = tmp.id;
                    }
                    if (!model.serviceCateMap[tmp.id]) {
                        model.serviceCate[tmp.id] = tmp;
                        model.serviceCateMap[tmp.id] = [];
                    }
                }
                callback(null);
            }, function (error) {
                callback(error);
            });
        }

        function queryItems(callback) {
            var selectService = "select a.id c_id,a.name c_name,a.img,b.id,b.name,b.baseInfo_image,b.baseInfo_code,b.prices_salesPrice from tb_service_cate a,tb_service b where a.id == b.serviceCategory_id;";
            dbInstance.execQuery(selectService, [], function (result) {
                var len = result.rows.length;
                for (var i = 0; i < len; i++) {
                    var tmp = result.rows.item(i);
                    if (!model.serviceCateMap[tmp.c_id]) {
                        model.serviceCateMap[tmp.c_id] = [];
                    }
                    if (i === 0) {
                        model.serviceViewArray = model.serviceCateMap[tmp.c_id];
                    }
                    model.serviceCateMap[tmp.c_id].push(tmp);
                    model.serviceList[tmp.id] = tmp;
                }
                callback(null);
            }, function (error) {
                callback(error);
            });
        }
    }

    function reInitServiceList(model, callback) {
        cache.clear("service.category.map", true);
        cache.clear("service.itemList", true);
        cache.clear("service.productCategories", true);
        initServiceList(model, callback);
    }

    function initCateServiceList(model, callback) {
        model.cateServiceNameMap = [];//卡类型id为key、服务项name数组为value
        model.cateServiceIdMap = [];
        var selectCateServices = "select a.id,a.serviceId,a.cardCateId,b.name as serviceName from tb_recordCateServices a,tb_service b where a.serviceId = b.id;";
        dbInstance.execQuery(selectCateServices, [], function (result) {
            for (var i = 0 , len = result.rows.length; i < len; i++) {
                var temp = result.rows.item(i);
                if (model.cateServiceNameMap[temp.cardCateId] && model.cateServiceIdMap[temp.cardCateId]) {
                    model.cateServiceNameMap[temp.cardCateId].push(temp.serviceName);
                    model.cateServiceIdMap[temp.cardCateId].push(temp.serviceId);
                }
                else {
                    model.cateServiceNameMap[temp.cardCateId] = [temp.serviceName];
                    model.cateServiceIdMap[temp.cardCateId] = [temp.serviceId];
                }
            }
            callback(null, model);
        }, function (error) {
            callback(error, model);
        });
    }

    function initCateList(model, callback) {
        model.memberTypeList = [];
        model.recordTimeCateList = [];
        var selectCate = "select name,discounts_serviceDiscount,id,baseInfo_minMoney,cardValid,cardNoGenRule_cardNoLen,cardNoGenRule_cardNoPrefix,baseInfo_type from tb_memberCardCategory;";
        dbInstance.execQuery(selectCate, [], function (result) {
            for (var i = 0, len = result.rows.length; i < len; i++) {
                var temp = _.clone(result.rows.item(i));
                if (temp.baseInfo_type === "recordTimeCard") {
                    model.recordTimeCateList.push(temp);
                }
                else {
                    model.memberTypeList.push(temp);
                }
            }
            callback(null, model);
        }, function (error) {
            callback(error, model);
        });
    }

    function cateMemberCount(model, callback) {
        model.cateMemberCount = {};//以类型id为key、人数为value
        var countSql = "select memberCardCategoryId,count(*) as memberCount from tb_memberCard group by memberCardCategoryId;";
        dbInstance.execQuery(countSql, [], function (result) {
            for (var i = 0; i < result.rows.length; i++) {
                var temp = result.rows.item(i);
                model.cateMemberCount[temp.memberCardCategoryId] = temp.memberCount;
            }
            callback(null, model);
        }, function (error) {
            callback(error, model);
        });
    }

    //更新记次卡
    function updateRecordCate(recordCate, serviceList, callback) {
        var sqlArray = [];
        sqlArray.push(dataUtils.getUpdateSqlOfObjId("tb_memberCardCategory", recordCate));
        async.each(serviceList, function (item, callback) {
            database.getUniqueId(YILOS.ENTERPRISEID, function (error, trans, id) {
                if (error) {
                    callback(error);
                    return;
                }
                item.id = id;
                sqlArray.push(dataUtils.getInsertSqlOfObj("tb_recordCateServices", item));
                callback(null);
            });
        }, function (error) {
            if (error) {
                callback(error);
                return;
            }
            //批量执行是异步的、这部分需要同步的执行、防止出现先插入然后被删除的情况
            var deleteSql = {statement: "delete from tb_recordCateServices where cardCateId=?;", value: [recordCate.id]};
            dataUtils.execOneSql(deleteSql, function (error) {
                if (error) {
                    callback(error);
                    return;
                }
                dataUtils.batchExecuteSql(sqlArray, callback);
            });
        });
    }
});