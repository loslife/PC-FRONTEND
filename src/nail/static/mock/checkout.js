define(function (require, exports, module) {
    var mockTargets = require("./mockTargets").controlTargets;
    var database = require("mframework/static/package").database;
    var dbInstance = database.getDBInstance();
    var enterpriseId = YILOS.ENTERPRISEID;
    var createStart = mockTargets.startDate;
    var createEnd = mockTargets.endDate;
    var employeeList = [];
    var serviceList = [];
    var memberList = [];
    var serviceBillCount = mockTargets.billCount;

    var insertServiceBill = [];
    var insertBillProject = [];
    var updateCard = [];
    var insertEmpBonus = [];

    function initService(callback) {
        var serviceSelect = "select a.id as cate_id,a.name as cate_name,b.id,b.name,b.prices_salesPrice as unitPrice from tb_service_cate a,tb_service b where a.id = b.serviceCategory_id;";
        dbInstance.execQuery(serviceSelect, [], function (result) {
            for (var i = 0 , len = result.rows.length; i < len; i++) {
                serviceList.push(result.rows.item(i));
            }
            if (serviceList.length === 0) {
                callback("没有服务数据!");
                return;
            }
            callback(null);
        }, function (error) {
            callback(error);
        });
    }

    function initEmployee(callback) {
        var empSelect = "select a.id,a.name,b.bonus_cash,b.bonus_memberCard,b.bonus_recharge"
            + " from tb_employee a,tb_job b"
            + " where a.baseInfo_jobId = b.id";
        dbInstance.execQuery(empSelect, [], function (result) {
            for (var i = 0 , len = result.rows.length; i < len; i++) {
                employeeList.push(result.rows.item(i));
            }
            callback(null);
        }, function (error) {
            callback(error);
        });
    }

    function initMember(callback) {
        var memberSelect = "select a.id,a.name,a.create_date,b.id as cardId,b.cardNo,b.currentMoney,c.discounts_serviceDiscount,b.totalConsumption,b.lastConsumption_date,c.id as cateId,c.name as cate_name" +
            " from tb_member a,tb_memberCard b,tb_memberCardCategory c" +
            " where a.id = b.memberId and b.memberCardCategoryId = c.id;";
        dbInstance.execQuery(memberSelect, [], function (result) {
            for (var i = 0 , len = result.rows.length; i < len; i++) {
                memberList.push(_.clone(result.rows.item(i)));
            }
            callback(null);
        }, function (error) {
            callback(error);
        });
    }

    function checkoutMulti(callback) {
        async.timesSeries(serviceBillCount, function (times, callback) {
            console.log("第" + times + "条收银记录!");
            async.waterfall([selectServiceRandom , selectMemberRandom , selectEmployeeRandom, checkout], function (error) {
                callback(error);
            });
        }, function (error) {
            if (error) {
                callback(error);
                return;
            }

            //执行所有积累的SQL
            async.series([batchSaveServiceBill, batchSaveProject, batchUpdateCard, batchSaveBonus], function (error) {
                callback(error);
            });

            function batchSaveServiceBill(callback) {
                dbInstance.transaction(function (trans) {
                    async.each(insertServiceBill, function (item, callback) {
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

            function batchSaveProject(callback) {
                dbInstance.transaction(function (trans) {
                    async.each(insertBillProject, function (item, callback) {
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

            function batchUpdateCard(callback) {
                dbInstance.transaction(function (trans) {
                    async.each(updateCard, function (item, callback) {
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

            function batchSaveBonus(callback) {
                dbInstance.transaction(function (trans) {
                    async.each(insertEmpBonus, function (item, callback) {
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

        //随机选取服务
        function selectServiceRandom(callback) {
            var selectedTemp;
            var serviceSelected = [];
            var oneServiceCount;
            var serviceCount = Math.random() < 0.8 ? 1 : 2;

            for (var i = 0; i < serviceCount; i++) {
                oneServiceCount = Math.random() > 0.8 ? 1 : 2;
                selectedTemp = serviceList[parseInt(Math.random() * serviceList.length)];
                serviceSelected.push({
                    id: selectedTemp.id,
                    name: selectedTemp.name,
                    saleNum: oneServiceCount,
                    unitPrice: selectedTemp.unitPrice,
                    money: parseFloat((selectedTemp.unitPrice * oneServiceCount).toFixed(2)),
                    cate_id: selectedTemp.cate_id,
                    cate_name: selectedTemp.cate_name
                });
            }
            callback(null, serviceSelected);
        }

        //随机选取会员
        function selectMemberRandom(serviceSelected, callback) {
            var memberSelected = null;
            //模仿散客和会员
            if (Math.random() > 0.5) {
                if (memberList.length !== 0) {
                    memberSelected = memberList[parseInt(Math.random() * memberList.length)];
                }
            }
            callback(null, serviceSelected, memberSelected);
        }

        //随机选择员工
        function selectEmployeeRandom(serviceSelected, memberSelected, callback) {
            var employeeSelected = null;
            if (employeeList.length !== 0) {
                employeeSelected = employeeList[parseInt(Math.random() * employeeList.length)];
            }
            else {
                employeeSelected = {
                    id: "",
                    name: "无"
                };
            }
            callback(null, serviceSelected, memberSelected, employeeSelected);
        }

        //结算
        function checkout(serviceSelected, memberSelected, employeeSelected, callback) {
            var payCash, payCard, befDisMoney, aftDisMoney, createDate, discount, billDetail;

            async.waterfall([countCost, saveServiceBill, saveBillProject, updateMemberCard, saveEmpBonus], function (error) {
                callback(error);
            });

            //计算金额
            function countCost(callback) {
                if (memberSelected) {
                    befDisMoney = 0;
                    _.each(serviceSelected, function (item) {
                        befDisMoney += item.money;
                    });
                    discount = memberSelected.discounts_serviceDiscount;
                    aftDisMoney = parseFloat((discount * 0.1 * befDisMoney).toFixed(2));
                    //Math.random() / n 调整增长速率
                    createDate = parseInt(memberSelected.lastConsumption_date + (Math.random() / 10) * (createEnd - memberSelected.lastConsumption_date));
                    if ((memberSelected.currentMoney - aftDisMoney) >= 0.000001) {
                        payCash = 0;
                        payCard = aftDisMoney;
                        memberSelected.currentMoney = memberSelected.currentMoney - payCard;
                        memberSelected.lastConsumption_date = createDate;
                        memberSelected.totalConsumption += payCard;
                    }
                    else {
                        payCash = aftDisMoney;
                        payCard = 0;
                        //TODO rechargeMember
                    }
                }
                else {
                    befDisMoney = 0;
                    _.each(serviceSelected, function (item) {
                        befDisMoney += item.money;
                    });
                    aftDisMoney = befDisMoney;
                    discount = 10;
                    //散客消费时间随机分布
                    createDate = createStart + parseInt(Math.random() * (createEnd - createStart));
                    payCash = aftDisMoney;
                    payCard = 0;
                }
                callback(null);
            }

            //生成收银单
            function saveServiceBill(callback) {
                var serviceBill = {};
                database.getUniqueId(enterpriseId, function (error, trans, id) {
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
                        serviceBill.amount = aftDisMoney;
                        serviceBill.pay_cash = payCash;
                        serviceBill.pay_prePaidCard = payCard;
                        serviceBill.dateTime = createDate;
                        serviceBill.discount = discount;
                        serviceBill.befDisMoney = befDisMoney;
                        serviceBill.create_date = createDate;
                        serviceBill.enterprise_id = enterpriseId;
                        serviceBill.employee_id = employeeSelected.id;
                        serviceBill.employee_name = employeeSelected.name;
                        if (memberSelected) {
                            serviceBill.member_id = memberSelected.id;
                            serviceBill.member_name = memberSelected.name;
                            serviceBill.memberCard_id = memberSelected.cardId;
                            serviceBill.memberCard_name = memberSelected.cate_name;
                            serviceBill.member_currentBalance = memberSelected.currentMoney;
                        }
                        var insertBill = database.getInsertSqlOfObj("", "tb_serviceBill", serviceBill);
                        insertServiceBill.push(insertBill);
                        callback(null, serviceBill);
//                        trans.executeSql(insertBill, [], function (trans, result) {
//                            callback(null, serviceBill);
//                        }, function (trans, error) {
//                            callback(error);
//                        });
                    });
                });
            }

            function saveBillProject(serviceBill, callback) {
                var createTemp = new Date(createDate);
                billDetail = "";
                async.each(serviceSelected, function (item, callback) {
                    database.getUniqueId(enterpriseId, function (error, trans, id) {
                        if (error) {
                            callback(error);
                            return;
                        }
                        var billProject = {
                            id: id,
                            serviceBill_id: serviceBill.id,
                            project_id: item.id,
                            saleNum: item.saleNum,
                            unitPrice: item.unitPrice,
                            discounts: discount,
                            sumMoney: parseFloat((item.unitPrice * item.saleNum * discount * 0.1).toFixed(2)),
                            dateTime: createDate,
                            month: createTemp.getMonth() + 1,
                            day: createTemp.getDate(),
                            weekDay: createTemp.getDay(),
                            project_name: item.name,
                            project_cateId: item.cate_id,
                            project_cateName: item.cate_name,
                            create_date: createDate,
                            enterprise_id: enterpriseId
                        };
                        billDetail += "," + item.name;
                        var billProInsert = database.getInsertSqlOfObj("", "tb_billProject", billProject);
                        insertBillProject.push(billProInsert);
                        callback(null);
//                        trans.executeSql(billProInsert, [], function (trans, result) {
//                            callback(null);
//                        }, function (trans, error) {
//                            callback(error);
//                        });
                    });
                }, function (error) {
                    callback(error, serviceBill);
                });
            }

            //更新会员卡信息
            function updateMemberCard(serviceBill, callback) {
                if (memberSelected) {
                    var cardUpdateSql = "update tb_memberCard set currentMoney = '" + memberSelected.currentMoney
                        + "',modify_date = '" + createDate + "',lastConsumption_date = '" + memberSelected.lastConsumption_date + "',totalConsumption = '" + memberSelected.totalConsumption
                        + "' where id = '" + memberSelected.cardId + "';";
                    updateCard.push(cardUpdateSql);
                    callback(null, serviceBill);
//                    dbInstance.transaction(function (trans) {
//                        trans.executeSql(cardUpdateSql, [], function (trans, result) {
//                            callback(null, serviceBill);
//                        }, function (trans, error) {
//                            callback(error);
//                        });
//                    });
                }
                else {
                    callback(null, serviceBill);
                }
            }

            //生成提成信息
            function saveEmpBonus(serviceBill, callback) {
                if (employeeSelected.id) {
                    database.getUniqueId(enterpriseId, function (error, trans, id) {
                        if (error) {
                            callback(error);
                            return;
                        }
                        var empBonus = {};
                        empBonus.id = id;
                        empBonus.serviceBill_id = serviceBill.id;
                        empBonus.dateTime = serviceBill.dateTime;
                        empBonus.type = 1;//代表服务
                        empBonus.employee_id = serviceBill.employee_id;
                        empBonus.totalMoney = serviceBill.amount;
                        if (memberSelected) {
                            empBonus.member_name = memberSelected.name;
                            empBonus.cardNo = memberSelected.cardNo;
                            empBonus.cardCate = memberSelected.cate_name;
                        }
                        empBonus.befDisMoney = serviceBill.befDisMoney;
                        empBonus.billDetail = billDetail.substring(1);
                        empBonus.discount = discount;
                        //根据支付方式提成方式不一样
                        if (serviceBill.pay_cash !== 0) {
                            empBonus.bonusMoney = parseFloat((empBonus.totalMoney * employeeSelected.bonus_cash / 100).toFixed(2));
                        }
                        else {
                            empBonus.bonusMoney = parseFloat((empBonus.totalMoney * employeeSelected.bonus_memberCard / 100).toFixed(2));
                        }
                        empBonus.create_date = createDate;
                        empBonus.enterprise_id = enterpriseId;
                        var empBonusInsert = database.getInsertSqlOfObj("", "tb_empBonus", empBonus);
                        insertEmpBonus.push(empBonusInsert);
                        callback(null);
//                        trans.executeSql(empBonusInsert, [], function (trans, result) {
//                            callback(null);
//                        }, function (trans, error) {
//                            callback(error);
//                        });
                    });
                }
                else {
                    callback(null)
                }
            }
        }
    }

    function init(callback) {
        async.waterfall([initService , initEmployee , initMember, checkoutMulti], function (error) {
            callback(error);
        });
    }

    exports.init = init;
});