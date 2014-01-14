//会员模块对应的数据接口
define(function (require, exports, module) {
    var database = require("mframework/static/package").database;
    var dataUtils = require("mframework/static/package").dataUtils;
    var dbInstance = database.getDBInstance();

    exports.initEmployeeList = initEmployeeList;
    exports.initMemberList = initMemberList;
    exports.initMemberCateList = initMemberCateList;
    exports.newMemberFillIdCode = newMemberFillIdCode;//...
    exports.newMember = newMember;
    exports.updateMember = updateMember;
    exports.deleteMember = deleteMember;
    exports.rechargeFillIdCode = rechargeFillIdCode;
    exports.rechargeMember = rechargeMember;
    exports.searchMember = searchMember;
    exports.queryCardBalance = queryCardBalance;
    exports.queryLastRecharge = queryLastRecharge;
    exports.countMemberCost = countMemberCost;
    exports.queryMemberCount = queryMemberCount;

    function initEmployeeList(model, callback) {
        //充值或者开卡时可以不选择员工
        model.employeeList = [
            {name: "无"}
        ];
        var selectEmployee = "select a.id,a.name,b.bonus_newCard,b.bonus_recharge,b.bonus_newRecordCard from tb_employee a,tb_job b where a.baseInfo_jobId = b.id;";
        dbInstance.execQuery(selectEmployee, [], function (result) {
            for (var i = 0; i < result.rows.length; i++) {
                model.employeeList.push(result.rows.item(i));
            }
            callback(null, model);
        }, function (error) {
            callback(error, model);
        });
    }

    function initMemberList(model, callback) {
        model.memberList = [];
        var selectMember = "select a.id,a.name,a.phoneMobile,a.sex,a.birthday,a.create_date,b.id as cardId,b.recharge_money,b.cardNo,b.currentMoney,b.periodOfValidity,c.name as memberCardCategoryName,c.id as memberCardCategoryId,c.baseInfo_type"
            + " from tb_member a,tb_memberCard b,tb_memberCardCategory c"
            + " where a.id = b.memberId and b.memberCardCategoryId = c.id order by a.create_date desc limit ?;";
        dbInstance.execQuery(selectMember, [model.pageSize], function (result) {
            for (var i = 0, len = result.rows.length; i < len; i++) {
                model.memberList.push(_.clone(result.rows.item(i)));
            }
            callback(null, model);
        }, function (error) {
            callback(error, model);
        });
    }

    function initMemberCateList(model, callback) {
        model.rechargeCateList = [];
        model.recordCateList = [];
        model.cateServiceNameMap = [];//卡类型id为key、服务项name数组为value
        initCateServiceList(function (error) {
            if (error) {
                callback(error, model);
                return;
            }
            var selectCate = "select id,name,baseInfo_type,cardValid,baseInfo_minMoney,cardNoGenRule_cardNoLen,cardNoGenRule_cardNoPrefix,discounts_serviceDiscount from tb_memberCardCategory;";
            dbInstance.execQuery(selectCate, [], function (result) {
                for (var i = 0, len = result.rows.length; i < len; i++) {
                    var temp = _.clone(result.rows.item(i));
                    if (temp.baseInfo_type === "recordTimeCard") {
                        temp.serviceNameStr = model.cateServiceNameMap[temp.id] ? model.cateServiceNameMap[temp.id].join("，") : "";
                        model.recordCateList.push(temp);
                    }
                    else {
                        model.rechargeCateList.push(temp);
                    }
                }
                callback(null, model);
            }, function (trans, error) {
                callback(error, model);
            });
        });

        function initCateServiceList(callback) {
            var selectCateServices = "select a.id,a.serviceId,a.cardCateId,b.name as serviceName from tb_recordCateServices a,tb_service b where a.serviceId = b.id;";
            dbInstance.execQuery(selectCateServices, [], function (result) {
                for (var i = 0 , len = result.rows.length; i < len; i++) {
                    var temp = result.rows.item(i);
                    if (model.cateServiceNameMap[temp.cardCateId]) {
                        model.cateServiceNameMap[temp.cardCateId].push(temp.serviceName);
                    }
                    else {
                        model.cateServiceNameMap[temp.cardCateId] = [temp.serviceName];
                    }
                }
                callback(null);
            }, function (error) {
                callback(error);
            });
        }
    }

    function newMember(member, memberCard, rechargeBill, empBonus, callback) {
        var sqlArray = [];
        sqlArray.push(dataUtils.getInsertSqlOfObj("tb_member", member));
        sqlArray.push(dataUtils.getInsertSqlOfObj("tb_memberCard", memberCard));
        sqlArray.push(dataUtils.getInsertSqlOfObj("tb_rechargeMemberBill", rechargeBill));
        if (!_.isEmpty(empBonus)) {
            sqlArray.push(dataUtils.getInsertSqlOfObj("tb_empBonus", empBonus));
        }
        dataUtils.batchExecuteSql(sqlArray, callback);
    }

    function newMemberFillIdCode(member, memberCard, rechargeBill, empBonus, callback) {
        async.waterfall([fillMemberId, fillCardCodeId, fillBillCodeId, fillEmpBonusId], function (error) {
            if (error) {
                callback(error);
                return;
            }
            var resultPack = {
                member: member,
                memberCard: memberCard,
                rechargeBill: rechargeBill,
                empBonus: empBonus
            };
            callback(null, resultPack);
        });

        function fillMemberId(callback) {
            database.getUniqueId(YILOS.ENTERPRISEID, function (error, trans, id) {
                if (error) {
                    callback(error);
                    return;
                }
                member.id = id;
                callback(null);
            });
        }

        function fillCardCodeId(callback) {
            memberCard.memberId = member.id;
            database.getUniqueCode("tb_memberCard", memberCard.cardCate.cardNoGenRule_cardNoLen, function (error, trans, code) {
                if (error) {
                    callback(error);
                    return;
                }
                var randomNo = Math.floor(Math.random() * 900 + 100);//100-999
                var cardPrefix = memberCard.cardCate.cardNoGenRule_cardNoPrefix;
                memberCard.cardNo = (cardPrefix == null ? "" : cardPrefix) + randomNo + code;
                delete memberCard.cardCate;//移除类型对象
                database.getUniqueId(YILOS.ENTERPRISEID, function (error, trans, id) {
                    if (error) {
                        callback(error);
                        return;
                    }
                    memberCard.id = id;
                    callback(null);
                });
            });
        }

        function fillBillCodeId(callback) {
            rechargeBill.member_id = member.id;
            rechargeBill.memberCard_id = memberCard.id;
            rechargeBill.memberCard_name = memberCard.cardNo;
            database.getUniqueCode("tb_serviceBill", 8, function (error, trans, code) {
                if (error) {
                    callback(error);
                    return;
                }
                rechargeBill.billNo = code;
                database.getUniqueId(YILOS.ENTERPRISEID, function (error, trans, id) {
                    if (error) {
                        callback(error);
                        return;
                    }
                    rechargeBill.id = id;
                    callback(null);
                });
            });
        }

        function fillEmpBonusId(callback) {
            if (_.isEmpty(empBonus)) {
                callback(null);
                return;
            }
            empBonus.project_id = memberCard.id;
            empBonus.serviceBill_id = rechargeBill.id;
            empBonus.cardNo = memberCard.cardNo;
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

    function updateMember(member, memberCard, callback) {
        var sqlArray = [];
        sqlArray.push(dataUtils.getUpdateSqlOfObjId("tb_member", member));
        if (!_.isEmpty(memberCard)) {
            sqlArray.push(dataUtils.getUpdateSqlOfObjId("tb_memberCard", memberCard));
        }
        dataUtils.batchExecuteSql(sqlArray, callback);
    }

    //删除会员、
    function deleteMember(memberId, cardId, callback) {
        var sqlArray = [];
        sqlArray.push({statement: "delete from tb_member where id = ?;", value: [memberId]});
        sqlArray.push({statement: "delete from tb_memberCard where id = ?;", value: [cardId]});
        dataUtils.batchExecuteSql(sqlArray, callback);
    }

    function rechargeMember(memberCard, rechargeBill, empBonus, callback) {
        var sqlArray = [];
        sqlArray.push({statement: "update tb_memberCard set currentMoney = currentMoney + ?,recharge_money = recharge_money + ? where id = ?;", value: [memberCard.rechargeMoney, memberCard.rechargeMoney, memberCard.id]});
        sqlArray.push(dataUtils.getInsertSqlOfObj("tb_rechargeMemberBill", rechargeBill));
        if (!_.isEmpty(empBonus)) {
            sqlArray.push(dataUtils.getInsertSqlOfObj("tb_empBonus", empBonus));
        }
        dataUtils.batchExecuteSql(sqlArray, callback);
    }

    function rechargeFillIdCode(memberCard, rechargeBill, empBonus, callback) {
        async.waterfall([fillBillCodeId, fillEmpBonusId], function (error) {
            if (error) {
                callback(error);
                return;
            }

            var resultPack = {
                memberCard: memberCard,
                rechargeBill: rechargeBill,
                empBonus: empBonus
            };
            callback(null, resultPack);
        });

        function fillBillCodeId(callback) {
            database.getUniqueCode("tb_rechargeBill", 8, function (error, trans, code) {
                if (error) {
                    callback(error);
                    return;
                }
                rechargeBill.billNo = code;
                database.getUniqueId(YILOS.ENTERPRISEID, function (error, trans, id) {
                    if (error) {
                        callback(error);
                        return;
                    }
                    rechargeBill.id = id;
                    callback(null);
                });
            });
        }

        function fillEmpBonusId(callback) {
            if (_.isEmpty(empBonus)) {
                callback(null);
                return;
            }
            empBonus.serviceBill_id = rechargeBill.id;
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

    //搜索会员，keyword搜索关键字，cursorStart记录起始位置，amount查询数量，返回搜索到的会员列表
    function searchMember(keyword, cursorStart, amount, callback) {
        var statement = "select a.id,a.name,a.phoneMobile,a.sex,a.birthday,a.create_date,b.id as cardId,b.recharge_money,b.cardNo,b.currentMoney,b.periodOfValidity,c.name as memberCardCategoryName,c.id as memberCardCategoryId,c.baseInfo_type"
            + " from tb_member a,tb_memberCard b,tb_memberCardCategory c"
            + " where a.id = b.memberId and b.memberCardCategoryId = c.id"
            + " and (a.name like ? "
            + "or a.phoneMobile like ? "
            + "or b.cardNo like ?) order by a.create_date desc limit ?,?;";
        var value = ["%" + keyword + "%", "%" + keyword + "%", "%" + keyword + "%", cursorStart, amount];
        dbInstance.execQuery(statement, value, function (result) {
            var resultPack = [];
            for (var i = 0, len = result.rows.length; i < len; i++) {
                resultPack.push(result.rows.item(i));
            }
            callback(null, resultPack);
        }, function (error) {
            callback(error);
        });
    }

    //查询会员余额
    function queryCardBalance(cardId, callback) {
        var statement = "select currentMoney from tb_memberCard where id = ?;";
        var value = [cardId];
        dbInstance.execQuery(statement, value, function (result) {
            var resultPack = {};
            if (result.rows.length !== 0) {
                resultPack.currentMoney = result.rows.item(0).currentMoney;
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

    //统计会员消费
    function countMemberCost(cardId, callback) {
        var statement = "select sum(def_int1) as pileTimes,sum(amount) as pileCost,avg(amount) as customerPrice,max(dateTime) as recentlyCost,min(dateTime) as firstConsumer,count(*) as count from tb_serviceBill where memberCard_id = ?;";
        var value = [cardId];
        dbInstance.execQuery(statement, value, function (result) {
            var resultPack = {};
            if (result.rows.length !== 0) {
                var temp = result.rows.item(0);
                resultPack.pileTimes = temp.pileTimes;
                resultPack.pileCost = temp.pileCost;
                resultPack.customerPrice = temp.customerPrice;
                resultPack.recentlyCost = temp.recentlyCost;
                resultPack.count = temp.count;
                resultPack.firstConsumer = temp.firstConsumer;
            }
            callback(null, resultPack);
        }, function (error) {
            callback(error);
        });
    }

    //查询会员数量
    function queryMemberCount(callback) {
        var selectCount = "select count(*) as count from tb_member;";
        dbInstance.execQuery(selectCount, [], function (result) {
            var resultPack = {};
            if (result.rows.length !== 0) {
                resultPack.count = result.rows.item(0).count;
            }
            callback(null, resultPack);
        }, function (error) {
            callback(error);
        });
    }
});