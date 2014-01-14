//会员类型模块对应的数据接口
define(function (require, exports, module) {
    var database = require("mframework/static/package").database;
    var dataUtils = require("mframework/static/package").dataUtils;
    var utils = require("mframework/static/package").utils;
    var cache = utils.getCache();
    var dbInstance = database.getDBInstance();

    exports.initPendOrderList = initPendOrderList;
    exports.initEmployeeList = initEmployeeList;
    exports.initServiceList = initServiceList;
    exports.pendOrder = pendOrder;
    exports.deletePend = deletePend;
    exports.checkout = checkout;
    exports.fillIdCode = fillIdCode;
    exports.queryMember = queryMember;
    exports.queryPendingOrder = queryPendingOrder;
    exports.searchMember = searchMember;
    exports.queryLastRecharge = queryLastRecharge;
    exports.initCateServiceList = initCateServiceList;

    function initPendOrderList(model, callback) {
        model.pendList = [];
        var selectPend = "select id,amount,member_id,memberCard_id,employee_id from tb_serviceBill_temp order by dateTime desc;";
        dbInstance.execQuery(selectPend, [], function (result) {
            for (var i = 0, len = result.rows.length; i < len; i++) {
                model.pendList.push(result.rows.item(i));
            }
            callback(null, model);
        }, function (error) {
            callback(error, model);
        });
    }

    function initEmployeeList(model, callback) {
        model.employeeList = [
            {name: "无"}
        ];
        var selectEmployee = "select a.id,a.name,b.bonus_cash,b.bonus_memberCard,b.bonus_recordCardConsume,a.baseInfo_image from tb_employee a,tb_job b where a.baseInfo_jobId = b.id";
        dbInstance.execQuery(selectEmployee, [], function (result) {
            for (var i = 0, len = result.rows.length; i < len; i++) {
                model.employeeList.push(result.rows.item(i));
            }
            callback(null, model);
        }, function (error) {
            callback(error, model);
        });
    }

    function initServiceList(model, callback) {
        model.productCategorieMap = cache.getObject("service.category.map");
        model.productList = cache.getObject("service.itemList");
        model.productCategories = cache.getObject("service.productCategories");
        //若缓存中不存在该对象、得到的是undefined、&&运算后为false
        if (model.productCategorieMap && model.productList && model.productCategories) {
            callback(null, model);
        }
        else {
            if (YILOS.onDeviceReady) {
                initData();
            }
            else {
                global.eventEmitter.addListener("data-init-success", function () {
                    initData()
                });
            }
        }

        function initData() {
            model.productCategorieMap = {};
            model.productList = {};
            model.productCategories = {};
            async.waterfall([queryCate, queryItems], function (error) {
                if (error) {
                    callback(error, model);
                    return;
                }
                cache.set("service.category.map", model.productCategorieMap, true);
                cache.set("service.itemList", model.productList, true);
                cache.set("service.productCategories", model.productCategories, true);
                callback(null, model);
            });
        }

        function queryCate(callback) {
            var selectCate = "select a.id ,a.name from tb_service_cate a;";
            dbInstance.execQuery(selectCate, [], function (result) {
                for (var i = 0, len = result.rows.length; i < len; i++) {
                    var temp = result.rows.item(i);
                    if (!model.productCategorieMap[temp.id]) {
                        model.productCategories[temp.id] = temp;
                        model.productCategorieMap[temp.id] = [];
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
                for (var i = 0, len = result.rows.length; i < len; i++) {
                    var temp = result.rows.item(i);
                    //服务所关联的类别不存在时
                    if (!model.productCategorieMap[temp.c_id]) {
                        model.productCategorieMap[temp.c_id] = [];
                    }
                    model.productCategorieMap[temp.c_id].push(temp);
                    model.productList[temp.id] = temp;
                }
                callback(null);
            }, function (error) {
                callback(error);
            });
        }
    }

    function initCateServiceList(model, callback) {
        model.cateServiceNameMap = {};
        model.cateServiceIdMap = {};
        model.cateAvgPriceMap = {};
        initCateAvgPrice(function (error) {
            if (error) {
                callback(error);
                return;
            }
            var selectCateServices = "select a.id,a.serviceId,a.cardCateId,b.name as serviceName from tb_recordCateServices a,tb_service b where a.serviceId = b.id;";
            dbInstance.execQuery(selectCateServices, [], function (result) {
                for (var i = 0 , len = result.rows.length; i < len; i++) {
                    var temp = result.rows.item(i);
                    if (model.cateServiceNameMap[temp.cardCateId]) {
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
                callback(error);
            });
        });

        //获取类型平均价格
        function initCateAvgPrice(callback) {
            var selectCateAvg = "select id,baseInfo_minMoney/discounts_serviceDiscount as avgPrice from tb_memberCardCategory where baseInfo_type = ?;";
            dbInstance.execQuery(selectCateAvg, ["recordTimeCard"], function (result) {
                var temp;
                for (var i = 0, len = result.rows.length; i < len; i++) {
                    temp = result.rows.item(i);
                    model.cateAvgPriceMap[temp.id] = temp.avgPrice;
                }
                callback(null);
            }, function (error) {
                callback(error);
            });
        }
    }


    //挂单、order单、serviceList产品列表
    function pendOrder(order, serviceList, callback) {
        async.waterfall([fillOrderId, fillServiceId], function (error) {
            if (error) {
                callback(error);
                return;
            }
            var sqlArray = [];
            sqlArray.push(dataUtils.getInsertSqlOfObj("tb_serviceBill_temp", order));
            _.each(serviceList, function (item) {
                sqlArray.push(dataUtils.getInsertSqlOfObj("tb_billProject_temp", item));
            });
            dataUtils.batchExecuteSql(sqlArray, callback);
        });


        function fillOrderId(callback) {
            database.getUniqueId(YILOS.ENTERPRISEID, function (error, trans, id) {
                if (error) {
                    callback(error);
                    return;
                }
                order.id = id;
                callback(null);
            });
        }

        function fillServiceId(callback) {
            async.each(serviceList, function (item, callback) {
                item.serviceBill_id = order.id;
                database.getUniqueId(YILOS.ENTERPRISEID, function (error, trans, id) {
                    if (error) {
                        callback(error);
                        return;
                    }
                    item.id = id;
                    callback(null);
                });
            }, function (error) {
                callback(error);
            });
        }
    }

    //删除挂单
    function deletePend(delPendId, callback) {
        var sqlArray = [];
        sqlArray.push({statement: "delete from tb_serviceBill_temp where id = ?;", value: [delPendId]});
        sqlArray.push({statement: "delete from tb_billProject_temp where serviceBill_id = ?;", value: [delPendId]});
        dataUtils.batchExecuteSql(sqlArray, callback);
    }

    function checkout(bill, billProject, memberCard, empBonus, callback) {
        var sqlArray = [];
        sqlArray.push(dataUtils.getInsertSqlOfObj("tb_serviceBill", bill));
        //因为记次卡、加入了一个oldPrice字段、字段数据库中不存在
        var filter = ["id", "serviceBill_id", "project_id", "saleNum", "unitPrice", "discounts", "sumMoney", "dateTime", "month", "day", "weekDay", "project_name", "project_cateId", "project_cateName", "create_date", "enterprise_id"];
        _.each(billProject, function (item) {
            sqlArray.push(dataUtils.getInsertSqlOfObj("tb_billProject", item, filter));
        });
        if (!_.isEmpty(empBonus)) {
            sqlArray.push(dataUtils.getInsertSqlOfObj("tb_empBonus", empBonus));
        }

        if (!_.isEmpty(memberCard)) {
            //会员卡支付
            if (bill.pay_prePaidCard !== 0) {
                sqlArray.push({
                    statement: "update tb_memberCard set currentMoney = currentMoney - ?,modify_date = ?,lastConsumption_date = ?,totalConsumption = totalConsumption + ? where id = ?;",
                    value: [memberCard.reduction, memberCard.updateDate, memberCard.updateDate, memberCard.reduction, memberCard.id]
                });
            }
            else {
                //会员使用现金消费也记录到会员累积消费、记录其最后消费时间
                sqlArray.push({
                    statement: "update tb_memberCard set modify_date = ?,lastConsumption_date = ?,totalConsumption = totalConsumption + ? where id = ?;",
                    value: [bill.create_date, bill.create_date, bill.pay_cash, memberCard.id]
                });
            }
        }
        dataUtils.batchExecuteSql(sqlArray, callback);
    }

    //流水单、服务列表、会员卡、员工提成
    function fillIdCode(serviceBill, projectList, memberCard, empBonus, callback) {
        async.waterfall([fillBillIdCode, fillProjectId, fillEmpBonusId], function (error) {
            if (error) {
                callback(error);
                return;
            }
            var resultPack = {
                serviceBill: serviceBill,
                projectList: projectList,
                memberCard: memberCard,
                empBonus: empBonus
            };
            callback(null, resultPack);
        });


        function fillBillIdCode(callback) {
            database.getUniqueId(YILOS.ENTERPRISEID, function (error, trans, id) {
                if (error) {
                    callback(error);
                    return;
                }
                serviceBill.id = id;
                database.getUniqueCode("tb_serviceBill", 8, function (error, trans, code) {
                    if (error) {
                        callback(error);
                        return;
                    }
                    serviceBill.billNo = code;
                    callback(null);
                });
            });
        }

        function fillProjectId(callback) {
            async.each(projectList, function (item, callback) {
                item.serviceBill_id = serviceBill.id;
                database.getUniqueId(YILOS.ENTERPRISEID, function (error, trans, id) {
                    if (error) {
                        callback(error);
                        return;
                    }
                    item.id = id;
                    callback(null);
                });
            }, function (error) {
                callback(error);
            });
        }

        function fillEmpBonusId(callback) {
            if (_.isEmpty(empBonus)) {
                callback(null);
                return;
            }
            database.getUniqueId(YILOS.ENTERPRISEID, function (error, trans, id) {
                if (error) {
                    callback(error);
                    return;
                }
                empBonus.id = id;
                callback(null);
            });
        }
    }

    //查询会员
    function queryMember(memberId, callback) {
        var statement = "select a.id,a.name,a.phoneMobile,a.sex,a.create_date,b.id as cardId,b.cardNo,b.currentMoney,b.periodOfValidity,c.id as cardCateId,c.name as memberCardCategoryName,c.discounts_serviceDiscount,c.baseInfo_type"
            + " from tb_member a,tb_memberCard b,tb_memberCardCategory c where a.id = ? and a.id = b.memberId and b.memberCardCategoryId = c.id;";
        var value = [memberId];
        dbInstance.execQuery(statement, value, function (result) {
            if (result.rows.length !== 0) {
                callback(null, _.clone(result.rows.item(0)));
            }
            else {
                callback(null, {});
            }
        }, function (error) {
            callback(error);
        });
    }

    //插叙挂单信息
    function queryPendingOrder(pendId, callback) {
        var statement = "select project_id,saleNum from tb_billProject_temp where serviceBill_id = ?;";
        var value = [pendId];
        dbInstance.execQuery(statement, value, function (result) {
            var resultPack = [];
            for (var i = 0, len = result.rows.length; i < len; i++) {
                resultPack.push(_.clone(result.rows.item(i)));
            }
            callback(null, resultPack);
        }, function (error) {
            callback(error);
        });
    }

    //搜索会员，keyword搜索关键字，cursorStart记录起始位置，amount查询数量，返回搜索到的会员列表
    function searchMember(keyword, cursorStart, amount, callback) {
        var statement = "select a.id,a.name,a.phoneMobile,a.sex,a.create_date,b.id as cardId,b.cardNo,b.currentMoney,b.periodOfValidity,c.id as cardCateId,c.name as memberCardCategoryName,c.discounts_serviceDiscount,c.baseInfo_type"
            + " from tb_member a,tb_memberCard b,tb_memberCardCategory c"
            + " where a.id = b.memberId and b.memberCardCategoryId = c.id"
            + " and (a.name like ? "
            + "or a.phoneMobile like ? "
            + "or b.cardNo like ?) order by a.create_date desc limit ?,?;";
        var value = ["%" + keyword + "%", "%" + keyword + "%", "%" + keyword + "%", cursorStart, amount];
        dbInstance.execQuery(statement, value, function (result) {
            var resultPack = [];
            for (var i = 0, len = result.rows.length; i < len; i++) {
                resultPack.push(_.clone(result.rows.item(i)));
            }
            callback(null, resultPack);
        }, function (error) {
            callback(error);
        });
    }

    //查询会员最后消费日期
    function queryLastRecharge(cardId, callback) {
        var statement = "select max(create_date) as lastRecharge from tb_rechargeMemberBill where memberCard_id = ?;";
        var value = [cardId];
        dbInstance.execQuery(statement, value, function (result) {
            var resultPack = {};
            if (result.rows.length !== 0) {
                resultPack.lastRecharge = result.rows.item(0).lastRecharge;
            }
            callback(null, resultPack);
        }, function (error) {
            callback(error);
        });
    }
});