//收银点结算的动作
define(function (require, exports, module) {
    var utils = require("mframework/package").utils;
    var database = require("mframework/package").database;
    var featureDataI = require("./checkout-dataI.js");

    exports.initScope = initScope;
    exports.commitWithMoney = commitWithMoney;
    exports.commitWithRecord = commitWithRecord;
    exports.commitBoth = commitBoth;
    exports.commitRecordNotSave = commitRecordNotSave;

    //angular的$scope对象
    var angScope = null;

    function initScope(scope) {
        angScope = scope;
    }

    //disable收银确认button
    function disCheckBtn() {
        $("#checkout-button-cover").show();
    }

    //enable收银确认button
    function enCheckBtn() {
        $("#checkout-button-cover").hide();
    }

    //会员使用充值卡支付
    function printMemRechargeTicket(serviceBill, projectList, memberInfo, callback) {
        var ticketTemplate = {};
        ticketTemplate.ticket_type = 1;
        ticketTemplate.header = {
            store_name: angScope.storeInfo.name,
            consume_no: serviceBill.billNo,
            date: new Date().Format("yyyy-MM-dd hh:mm:ss"),
            card_no: memberInfo.cardNo
        };
        ticketTemplate.body = [];
        _.each(projectList, function (item) {
            ticketTemplate.body.push({
                name: item.project_name,
                amount: item.saleNum,
                sum: "￥" + (item.saleNum * item.unitPrice).toFixed(2)//item.sumMoney是折后金额
            });
        });
        ticketTemplate.summary = {
            subtotal: "￥" + serviceBill.befDisMoney.toFixed(2),
            discount: "￥" + serviceBill.amount.toFixed(2),
            paid: "￥" + serviceBill.amount.toFixed(2)
        };
        ticketTemplate.config_item = {
            discount_amount: "￥" + (serviceBill.befDisMoney - serviceBill.amount).toFixed(2),
            balance: "￥" + serviceBill.member_currentBalance.toFixed(2)
        };
        ticketTemplate.footer = {
            address: angScope.storeInfo.addr_state_city_area + angScope.storeInfo.addr_detail,
            phone: angScope.storeInfo.contact_phoneMobile
        };
        utils.printTicket(ticketTemplate, callback);
    }

    //会员使用记次卡支付
    function printMemRecordTicket(serviceBill, projectList, memberInfo, callback) {
        var ticketTemplate = {};
        //记次卡所有商品原价
        var totalOldMoney = 0;

        ticketTemplate.ticket_type = 2;
        ticketTemplate.header = {
            store_name: angScope.storeInfo.name,
            consume_no: serviceBill.billNo,
            date: new Date().Format("yyyy-MM-dd hh:mm:ss"),
            card_no: memberInfo.cardNo
        };
        ticketTemplate.body = [];
        _.each(projectList, function (item, index) {
            ticketTemplate.body.push({
                name: item.project_name,
                amount: item.saleNum,
                sum: parseFloat((item.oldPrice * item.saleNum).toFixed(2))//原价*数量、
            });
            totalOldMoney += ticketTemplate.body[index].sum;//小记
            ticketTemplate.body[index].sum = "￥" + ticketTemplate.body[index].sum.toFixed(2);
        });

        ticketTemplate.summary = {
            subtotal: "￥" + totalOldMoney.toFixed(2),
            buckle_times: serviceBill.def_int1 + "次",
            paid: serviceBill.def_int1 + "次"
        };

        ticketTemplate.config_item = {
            discount_amount: "￥" + (totalOldMoney - serviceBill.amount).toFixed(2),
            balance: "￥" + serviceBill.member_currentBalance.toFixed(2)
        };

        ticketTemplate.footer = {
            address: angScope.storeInfo.addr_state_city_area + angScope.storeInfo.addr_detail,
            phone: angScope.storeInfo.contact_phoneMobile
        };
        utils.printTicket(ticketTemplate, callback);
    }

    //会员使用现金支付
    function printMemCashTicket(serviceBill, projectList, memberInfo, callback) {
        var ticketTemplate = {};
        ticketTemplate.ticket_type = 6;
        ticketTemplate.header = {
            store_name: angScope.storeInfo.name,
            consume_no: serviceBill.billNo,
            date: new Date().Format("yyyy-MM-dd hh:mm:ss"),
            card_no: memberInfo.cardNo
        };
        ticketTemplate.body = [];
        _.each(projectList, function (item) {
            ticketTemplate.body.push({
                name: item.project_name,
                amount: item.saleNum,
                sum: "￥" + (item.saleNum * item.unitPrice).toFixed(2)//item.sumMoney是折后金额
            });
        });
        ticketTemplate.summary = {
            subtotal: "￥" + serviceBill.befDisMoney.toFixed(2),
            discount: "￥" + serviceBill.amount.toFixed(2),
            paid: "￥" + angScope.temp.realPayMoney.toFixed(2),//实收
            change: "￥" + angScope.temp.changeMoney.toFixed(2)//找零
        };
        ticketTemplate.config_item = {
            discount_amount: "￥" + (serviceBill.befDisMoney - serviceBill.amount).toFixed(2),
            balance: "￥" + serviceBill.member_currentBalance.toFixed(2)
        };
        ticketTemplate.footer = {
            address: angScope.storeInfo.addr_state_city_area + angScope.storeInfo.addr_detail,
            phone: angScope.storeInfo.contact_phoneMobile
        };
        utils.printTicket(ticketTemplate, callback);
    }

    //打印现金消费小票
    function printCashTicket(serviceBill, projectList, callback) {
        var ticketTemplate = {};
        ticketTemplate.ticket_type = 0;
        ticketTemplate.header = {
            store_name: angScope.storeInfo.name,
            consume_no: serviceBill.billNo,
            date: new Date().Format("yyyy-MM-dd hh:mm:ss")
        };

        ticketTemplate.body = [];

        _.each(projectList, function (item) {
            ticketTemplate.body.push({
                name: item.project_name,
                amount: item.saleNum,
                sum: "￥" + item.sumMoney.toFixed(2)
            });
        });

        ticketTemplate.summary = {
            subtotal: "￥" + serviceBill.befDisMoney.toFixed(2),
            discount: "￥" + serviceBill.amount.toFixed(2),
            paid: "￥" + angScope.temp.realPayMoney.toFixed(2),//实收
            change: "￥" + angScope.temp.changeMoney.toFixed(2)//找零
        };

        ticketTemplate.config_item = {
            discount_amount: "￥" + (serviceBill.befDisMoney - serviceBill.amount).toFixed(2)
        };

        ticketTemplate.footer = {
            address: angScope.storeInfo.addr_state_city_area + angScope.storeInfo.addr_detail,
            phone: angScope.storeInfo.contact_phoneMobile
        };
        utils.printTicket(ticketTemplate, callback);
    }

    //打印小票
    function printConsumeTicket(serviceBill, projectList, memberInfo, callback) {
        //不打印收银小票
        if (angScope.ticketSwitch.checkoutTicketSwitch == 0) {
            callback(null);
            return;
        }

        if (!_.isEmpty(angScope.memberSelected)) {
            if (angScope.memberSelected.baseInfo_type === "recordTimeCard") {
                //记次卡
                printMemRecordTicket(serviceBill, projectList, memberInfo, callback);
            }
            else if (serviceBill.pay_cash === 0) {
                //会员充值卡消费
                printMemRechargeTicket(serviceBill, projectList, memberInfo, callback);
            }
            else {
                //会员现金消费
                printMemCashTicket(serviceBill, projectList, memberInfo, callback);
            }
        }
        else {
            //散客现金消费
            printCashTicket(serviceBill, projectList, callback);
        }
    }

    //现金、或者充值卡
    function commitWithMoney() {
        //遮盖确认按钮、防止多次点击
        disCheckBtn();

        //会员卡全部支付不够应收
        if (angScope.pay.prePaidCard + angScope.pay.cash < angScope.incomeStatus.paidMoney) {
            utils.showAreaFailMsg("#m-pos-checkout-popup", "会员卡金额不足");
            enCheckBtn();
            return;
        }

        if (_.isUndefined(angScope.temp.changeMoney) || angScope.temp.changeMoney < 0) {
            utils.showAreaFailMsg("#m-pos-checkout-popup", "支付金额不足");
            enCheckBtn();
            return;
        }
        var serviceBill = {}, projectList = [], memberCard = {}, empBonus = {};       //收银单
        var billDetail = [];
        var disInfo;        //商品折扣信息
        var now = new Date();
        var createDate = now.getTime();

        if (angScope.globalDis !== "") {
            disInfo = angScope.globalDis;
        }
        else if (!_.isEmpty(angScope.memberSelected)) {
            disInfo = angScope.memberSelected.discounts_serviceDiscount;
        }
        else {
            disInfo = 10;
        }

        fillServiceBill();
        fillProjectList();
        fillEmpBonus();

        if (!_.isEmpty(angScope.memberSelected)) {
            memberCard.id = angScope.memberSelected.cardId;
            memberCard.reduction = serviceBill.pay_prePaidCard;
            memberCard.updateDate = createDate;
        }

        var msgContent = null;
        if (angScope.msgSwitch.consumeMsgSwitch == 1 && memberCard.id) {
            msgContent = {};
            msgContent.template_id = "template_4";
            msgContent.projectList = billDetail.join(",");
            if (msgContent.projectList.length >= 60) {
                msgContent.projectList = msgContent.projectList.substring(0, 55) + "...";
            }
            msgContent.phoneNumber = angScope.memberSelected.phoneMobile;
            msgContent.totalMoney = serviceBill.befDisMoney;
            msgContent.afterDiscountMoney = serviceBill.amount;
            msgContent.balance = serviceBill.member_currentBalance;
            msgContent.enterpriseName = angScope.storeInfo.name;
        }

        featureDataI.fillIdCode(serviceBill, projectList, memberCard, empBonus, function (error, result) {
            if (error) {
                utils.showAreaFailMsg("#m-pos-checkout-popup", "收银失败");
                enCheckBtn();
                utils.log("m-pos checkoutCommit.js commitWithMoney.featureDataI.fillIdCode", error);
                return;
            }
            var printResult = _.clone(result);
            featureDataI.checkout(result.serviceBill, result.projectList, result.memberCard, result.empBonus, function (error) {
                if (error) {
                    utils.showAreaFailMsg("#m-pos-checkout-popup", "收银失败");
                    enCheckBtn();
                    utils.log("m-pos checkoutCommit.js commitWithMoney.featureDataI.checkout", error);
                    return;
                }

                //发短信
                if (msgContent) {
                    sendMsg(msgContent);
                }

                deletePend(function (error) {
                    if (error) {
                        utils.showAreaFailMsg("#m-pos-checkout-popup", "收银失败");
                        enCheckBtn();
                        utils.log("m-pos checkoutCommit.js checkout.featureDataI.checkout.needDelPend", error);
                        return;
                    }
                    checkoutSuccess(printResult, createDate, memberCard, empBonus);
                });
            });

        });

        function fillServiceBill() {
            serviceBill.amount = angScope.incomeStatus.paidMoney;
            serviceBill.pay_cash = angScope.pay.cash;
            serviceBill.pay_prePaidCard = angScope.pay.prePaidCard;
            serviceBill.dateTime = createDate;
            serviceBill.discount = disInfo;
            serviceBill.befDisMoney = angScope.incomeStatus.totalMoney;
            serviceBill.create_date = createDate;
            serviceBill.enterprise_id = YILOS.ENTERPRISEID;

            //员工选择非无
            if (!_.isEmpty(angScope.employeeSelected) && angScope.employeeSelected.id) {
                serviceBill.employee_id = angScope.employeeSelected.id;
                serviceBill.employee_name = angScope.employeeSelected.name;
            }
            //会员消费
            if (!_.isEmpty(angScope.memberSelected)) {
                serviceBill.member_id = angScope.memberSelected.id;
                serviceBill.member_name = angScope.memberSelected.name;
                serviceBill.memberCard_id = angScope.memberSelected.cardId;
                serviceBill.memberCard_name = angScope.memberSelected.memberCardCategoryName;
                serviceBill.member_currentBalance = angScope.memberSelected.currentMoney - serviceBill.pay_prePaidCard;
            }
        }

        function fillProjectList() {
            var billProject;
            var proList = angScope.buyProductRecords;

            if (angScope.recordContext.overProduct) {
                proList = angScope.recordContext.overProduct;
            }

            _.each(proList, function (item) {
                billProject = {
                    project_id: item.id,
                    saleNum: item.saleNum,
                    unitPrice: item.unitPrice,
                    discounts: disInfo,
                    sumMoney: parseFloat((item.unitPrice * item.saleNum * disInfo / 10).toFixed(2)),
                    dateTime: now.getTime(),
                    month: now.getMonth() + 1,
                    day: now.getDate(),
                    weekDay: now.getDay(),
                    project_name: item.name,
                    project_cateId: item.cate_id,
                    project_cateName: item.cate_name,
                    create_date: createDate,
                    enterprise_id: YILOS.ENTERPRISEID
                };
                projectList.push(billProject);
                billDetail.push(item.name);
            });
        }

        function fillEmpBonus() {
            if (serviceBill.employee_id) {
                empBonus.dateTime = createDate;
                empBonus.type = 1;//代表服务
                empBonus.employee_id = serviceBill.employee_id;
                empBonus.totalMoney = serviceBill.amount;
                if (!_.isEmpty(angScope.memberSelected)) {
                    empBonus.member_name = angScope.memberSelected.name;
                    empBonus.cardNo = angScope.memberSelected.cardNo;
                    empBonus.cardCate = angScope.memberSelected.memberCardCategoryName;
                }
                empBonus.befDisMoney = serviceBill.befDisMoney;
                empBonus.billDetail = billDetail.join("，");
                empBonus.discount = disInfo;

                //根据支付方式提成方式不一样
                if (serviceBill.pay_cash !== 0) {
                    empBonus.bonusMoney = parseFloat((empBonus.totalMoney * angScope.employeeSelected.bonus_cash / 100).toFixed(2));
                }
                else {
                    empBonus.bonusMoney = parseFloat((empBonus.totalMoney * angScope.employeeSelected.bonus_memberCard / 100).toFixed(2));
                }
                empBonus.create_date = createDate;
                empBonus.enterprise_id = YILOS.ENTERPRISEID;
            }
        }
    }

    //是否是挂单结算、需要移除挂单
    function deletePend(callback) {
        if (!_.isEmpty(angScope.pendBill)) {
            featureDataI.deletePend(angScope.pendBill.id, function (error) {
                if (error) {
                    callback(error);
                    return;
                }
                //从挂单列表中移除该项
                _.each(angScope.pendList, function (item, index) {
                    if (item.id === angScope.pendBill.id) {
                        angScope.pendList.splice(index, 1);
                    }
                });
                angScope.pendBill = {};
                //调整挂单显示位置
                angScope.countPendShow();
                callback(null);
            });
        }
        else {
            callback(null);
        }
    }

    //收银成功清理及提示
    function checkoutSuccess(printResult, createDate, memberCard, empBonus) {
        global.eventEmitter.emitEvent('pos.checkout.servicebill.add');
        database.updateBackupFlag(createDate, YILOS_NAIL_MODULE.SERVICEBILL, null);//收银单
        if (!_.isEmpty(memberCard)) {
            database.updateBackupFlag(createDate, YILOS_NAIL_MODULE.MEMBER, null);//会员卡信息
        }
        if (!_.isEmpty(empBonus)) {
            database.updateBackupFlag(createDate, YILOS_NAIL_MODULE.EMPLOYEE, null);//员工提成
        }
        enCheckBtn();
        setTimeout(function () {
            $.fancybox.close();
            angScope.digestScope();
        }, 1000);
        utils.showAreaSuccessMsg("#m-pos-checkout-popup", "收银成功");
        printConsumeTicket(printResult.serviceBill, printResult.projectList, _.clone(angScope.memberSelected), function (error) {
            if (error) {
                //todo 失败处理
                utils.log("m-pos checkoutCommit.js commitWithMoney.printConsumeTicket", error);
                console.log("打印失败");
            }
            angScope.clearOrder();
            angScope.reInitRecordOrder();//记次卡信息继续清除
        });
    }

    //使用记次卡收银
    function commitWithRecord() {
        //遮盖确认按钮、防止多次点击
        disCheckBtn();

        var serviceBill = {}, projectList = [], memberCard = {}, empBonus = {};       //收银单
        var billDetail = [];
        var now = new Date();
        var createDate = now.getTime();

        fillServiceBill();
        fillProjectList();
        fillEmpBonus();
        memberCard.id = angScope.memberSelected.cardId;
        memberCard.reduction = angScope.pay.cardTimes;//扣次数
        memberCard.updateDate = createDate;

        featureDataI.fillIdCode(serviceBill, projectList, memberCard, empBonus, function (error, result) {
            if (error) {
                utils.showAreaFailMsg("#m-pos-checkout-popup", "收银失败");
                enCheckBtn();
                utils.log("m-pos checkoutCommit.js commitWithRecord.featureDataI.fillIdCode", error);
                return;
            }
            var printResult = _.clone(result);
            featureDataI.checkout(result.serviceBill, result.projectList, result.memberCard, result.empBonus, function (error) {
                if (error) {
                    utils.showAreaFailMsg("#m-pos-checkout-popup", "收银失败");
                    enCheckBtn();
                    utils.log("m-pos checkoutCommit.js commitWithRecord.featureDataI.checkout", error);
                    return;
                }
                deletePend(function (error) {
                    if (error) {
                        utils.showAreaFailMsg("#m-pos-checkout-popup", "收银失败");
                        enCheckBtn();
                        utils.log("m-pos checkoutCommit.js checkout.featureDataI.checkout.needDelPend", error);
                        return;
                    }
                    checkoutSuccess(printResult, createDate, memberCard, empBonus);
                });
            });
        });

        function fillServiceBill() {
            var unitPrice = angScope.cateAvgPriceMap[angScope.memberSelected.cardCateId];//记次卡平均价格
            serviceBill.def_int1 = angScope.pay.cardTimes;//消费次数
            serviceBill.amount = angScope.pay.cardTimes * unitPrice;
            serviceBill.pay_cash = 0;
            serviceBill.pay_prePaidCard = angScope.pay.cardTimes * unitPrice;
            serviceBill.dateTime = createDate;
            serviceBill.discount = 10;//记次卡无折扣
            serviceBill.befDisMoney = angScope.pay.cardTimes * unitPrice;
            serviceBill.create_date = createDate;
            serviceBill.enterprise_id = YILOS.ENTERPRISEID;

            //员工选择非无
            if (!_.isEmpty(angScope.employeeSelected) && angScope.employeeSelected.id) {
                serviceBill.employee_id = angScope.employeeSelected.id;
                serviceBill.employee_name = angScope.employeeSelected.name;
            }
            serviceBill.member_id = angScope.memberSelected.id;
            serviceBill.member_name = angScope.memberSelected.name;
            serviceBill.memberCard_id = angScope.memberSelected.cardId;
            serviceBill.memberCard_name = angScope.memberSelected.memberCardCategoryName;
            serviceBill.member_currentBalance = angScope.memberSelected.currentMoney - angScope.pay.cardTimes;//记次卡还剩多少次
        }

        function fillProjectList() {
            var billProject;
            var avePrice = 0;
            var projectTotalNum = 0;
            _.each(angScope.buyProductRecords, function (item) {
                projectTotalNum += item.saleNum;
            });
            avePrice = serviceBill.amount / projectTotalNum;//平均价

            _.each(angScope.buyProductRecords, function (item) {
                billProject = {
                    project_id: item.id,
                    saleNum: item.saleNum,
                    oldPrice: item.unitPrice,//项目原价、记次卡为保持报表一次性、收银单记录的是记次卡每次消费的平均价格、//保存时该字段不需要、仅用于在小票中计算优惠金额
                    unitPrice: avePrice,
                    discounts: 10,
                    sumMoney: parseFloat((avePrice * item.saleNum).toFixed(2)),
                    dateTime: now.getTime(),
                    month: now.getMonth() + 1,
                    day: now.getDate(),
                    weekDay: now.getDay(),
                    project_name: item.name,
                    project_cateId: item.cate_id,
                    project_cateName: item.cate_name,
                    create_date: createDate,
                    enterprise_id: YILOS.ENTERPRISEID
                };
                projectList.push(billProject);
                billDetail.push(item.name);
            });
        }

        function fillEmpBonus() {
            if (serviceBill.employee_id) {
                empBonus.dateTime = createDate;
                empBonus.type = 1;//代表服务
                empBonus.employee_id = serviceBill.employee_id;
                empBonus.totalMoney = serviceBill.amount;
                empBonus.member_name = angScope.memberSelected.name;
                empBonus.cardNo = angScope.memberSelected.cardNo;
                empBonus.cardCate = angScope.memberSelected.memberCardCategoryName;
                empBonus.befDisMoney = serviceBill.befDisMoney;
                empBonus.billDetail = billDetail.join("，");
                empBonus.discount = 10;
                //记次卡消费提成
                empBonus.bonusMoney = parseFloat((empBonus.totalMoney * angScope.employeeSelected.bonus_recordCardConsume / 100).toFixed(2));
                empBonus.create_date = createDate;
                empBonus.enterprise_id = YILOS.ENTERPRISEID;
            }
        }
    }

    //提交记次卡等待下一步操作
    function commitRecordNotSave() {
        var serviceBill = {}, projectList = [], memberCard = {}, empBonus = {};       //收银单
        var billDetail = [];
        var now = new Date();
        var createDate = now.getTime();

        fillServiceBill();
        fillProjectList();
        fillEmpBonus();
        memberCard.id = angScope.memberSelected.cardId;
        memberCard.reduction = angScope.pay.cardTimes;//扣次数
        memberCard.updateDate = createDate;

        var resultPack = {};

        resultPack.serviceBill = serviceBill;
        resultPack.projectList = projectList;
        resultPack.memberCard = memberCard;
        resultPack.empBonus = empBonus;

        return resultPack;

        function fillServiceBill() {
            var unitPrice = angScope.cateAvgPriceMap[angScope.memberSelected.cardCateId];//记次卡平均价格
            serviceBill.def_int1 = angScope.pay.cardTimes;//消费次数
            serviceBill.amount = angScope.pay.cardTimes * unitPrice;
            serviceBill.pay_cash = 0;
            serviceBill.pay_prePaidCard = angScope.pay.cardTimes * unitPrice;
            serviceBill.dateTime = createDate;
            serviceBill.discount = 10;//记次卡无折扣
            serviceBill.befDisMoney = angScope.pay.cardTimes * unitPrice;
            serviceBill.create_date = createDate;
            serviceBill.enterprise_id = YILOS.ENTERPRISEID;

            //员工选择非无
            if (!_.isEmpty(angScope.employeeSelected) && angScope.employeeSelected.id) {
                serviceBill.employee_id = angScope.employeeSelected.id;
                serviceBill.employee_name = angScope.employeeSelected.name;
            }
            serviceBill.member_id = angScope.memberSelected.id;
            serviceBill.member_name = angScope.memberSelected.name;
            serviceBill.memberCard_id = angScope.memberSelected.cardId;
            serviceBill.memberCard_name = angScope.memberSelected.memberCardCategoryName;
            serviceBill.member_currentBalance = angScope.memberSelected.currentMoney - angScope.pay.cardTimes;//记次卡还剩多少次
        }

        function fillProjectList() {
            var billProject;
            var avePrice = 0;
            var projectTotalNum = 0;
            _.each(angScope.recordContext.recordProduct, function (item) {
                projectTotalNum += item.saleNum;
            });
            avePrice = serviceBill.amount / projectTotalNum;//平均价

            _.each(angScope.recordContext.recordProduct, function (item) {
                billProject = {
                    project_id: item.id,
                    saleNum: item.saleNum,
                    oldPrice: item.unitPrice,
                    unitPrice: avePrice,
                    discounts: 10,
                    sumMoney: parseFloat((avePrice * item.saleNum).toFixed(2)),
                    dateTime: now.getTime(),
                    month: now.getMonth() + 1,
                    day: now.getDate(),
                    weekDay: now.getDay(),
                    project_name: item.name,
                    project_cateId: item.cate_id,
                    project_cateName: item.cate_name,
                    create_date: createDate,
                    enterprise_id: YILOS.ENTERPRISEID
                };
                projectList.push(billProject);
                billDetail.push(item.name);
            });
        }

        function fillEmpBonus() {
            if (serviceBill.employee_id) {
                empBonus.dateTime = createDate;
                empBonus.type = 1;//代表服务
                empBonus.employee_id = serviceBill.employee_id;
                empBonus.totalMoney = serviceBill.amount;
                empBonus.member_name = angScope.memberSelected.name;
                empBonus.cardNo = angScope.memberSelected.cardNo;
                empBonus.cardCate = angScope.memberSelected.memberCardCategoryName;
                empBonus.befDisMoney = serviceBill.befDisMoney;
                empBonus.billDetail = billDetail.join("，");
                empBonus.discount = 10;
                //记次卡消费提成
                empBonus.bonusMoney = parseFloat((empBonus.totalMoney * angScope.employeeSelected.bonus_recordCardConsume / 100).toFixed(2));
                empBonus.create_date = createDate;
                empBonus.enterprise_id = YILOS.ENTERPRISEID;
            }
        }
    }

    //使用记次卡及现金或充值卡收银提交
    function commitBoth() {
        disCheckBtn();
        var recordBillInfo = angScope.recordContext.billInfo;
        var serviceBill = recordBillInfo.serviceBill;
        var projectList = recordBillInfo.projectList;
        var memberCard = recordBillInfo.memberCard;
        var empBonus = recordBillInfo.empBonus;

        featureDataI.fillIdCode(serviceBill, projectList, memberCard, empBonus, function (error, result) {
            if (error) {
                utils.showAreaFailMsg("#m-pos-checkout-popup", "收银失败");
                enCheckBtn();
                utils.log("m-pos checkoutCommit.js commitBoth.featureDataI.checkout", error);
                return;
            }
            featureDataI.checkout(result.serviceBill, result.projectList, result.memberCard, result.empBonus, function (error) {
                if (error) {
                    utils.showAreaFailMsg("#m-pos-checkout-popup", "收银失败");
                    enCheckBtn();
                    utils.log("m-pos checkoutCommit.js checkout.featureDataI.checkout", error);
                    return;
                }
                printMemRecordTicket(result.serviceBill, result.projectList, _.clone(angScope.recordContext.memberSelected), function (error) {
                    if (error) {
                        utils.log("m-pos checkoutCommit.js commitBoth.printConsumeTicket", error);
                    }
                    commitWithMoney();
                });
            });
        });
    }

    function sendMsg(msgArg) {
        var url = global["_g_server"].serviceurl + "/sms/sendEnterpriseSms/" + YILOS.ENTERPRISEID;
        $.ajax({
            type: "post",
            async: true,
            url: url,
            data: msgArg,
            dataType: "json",
            success: function (data) {
                if (data.code == 1 && data.error.errorCode == "7000005") {
                    utils.showTips("账户余额不足，发送短信失败");
                }
            },
            error: function (error) {

            }
        });
    }
});