define(function (require, exports, module) {
    //暴露全局初始化方法
    exports.init = init;
    //一级菜单切换回调
    exports.switchMenu = switchMenu;
    //URL参数变更回调
    exports.paramsChange = paramsChange;
    //模块页面完全加载完成后回调
    exports.afterPageLoaded = afterPageLoaded;
    //模块模型初始化接口
    exports.loadModelAsync = loadModelAsync;
    //模块控制器初始化接口
    exports.initContoller = initContoller;
    exports.checktimeout = true;

    var moduleScope = null;
    var utils = require("mframework/static/package").utils;
    var widgets = require("m-widgets/static/package");
    var database = require("mframework/static/package").database;		//数据操作服务
    var featureDataI = require("./allMemberList-dataI.js");

    var CONSTANT = {
        memberCountCaps: 80,
        searchDelay: 600    //搜索延迟的毫秒数
    };

    function loadModelAsync(params, callback) {
        var model = {
            memberInfo: {},
            memberCard: {},
            pageNo: 1,
            pageSize: 20,
            memberRecharge: {rechargeMoney: ""},
            newMember: {
                name: "",
                sex: "0",
                cardNo: "",//卡编号即会员编号
                birthday: "",
                phoneMobile: "",
                currentMoney: "",
                memberCardCategory: "",
                create_date: ""
            },
            search: "",
            memberCount: {},
            sexConstant: [
                {name: "女", value: "0"},
                {name: "男", value: "1"}
            ],//性别常量
            temp: {},
            licenseInfo: {},
            cardTypeList: ["充值卡", "记次卡"],//记次卡冲值卡类型
            pageIndex: "memberList"
        };
        model.cardTypeSelected = model.cardTypeList[0];
        initData(model, callback);
    }

    function initData(model, callback) {
        async.waterfall([transferModel, getMaxMemberCount, initMemberList, initMemberCateList, initEmployeeList, initMsgSwitch, initStoreInfo, initTicketSwitch], function (error, model) {
            if (error) {
                utils.log("m-member allMemberList.js initData");
                return;
            }
            callback(model);
        });

        //将Model往下传
        function transferModel(callback) {
            callback(null, model);
        }
    }

    //获取当前版本会员数目上限
    function getMaxMemberCount(model, callback) {
        utils.getUserData(function (error, data) {
            if (error) {
                utils.log("m-member allMemberList.js getMaxMemberCount", error);
                callback(error);
                return;
            }
            if (_.isNumber(data.maxMemberCount)) {
                model.licenseInfo.maxMemberCount = data.maxMemberCount;
            }
            else {
                model.licenseInfo.maxMemberCount = 800;
            }
            callback(null, model);
        });
    }

    function initEmployeeList(model, callback) {
        featureDataI.initEmployeeList(model, function (error, model) {
            if (error) {
                utils.log("m-member allMemberList.js initEmployeeList.featureDataI.initEmployeeList", error);
                callback(error);
                return;
            }
            callback(null, model);
        });
    }

    function initMemberList(model, callback) {
        model.pageNo = 1;
        featureDataI.initMemberList(model, function (error, model) {
            if (error) {
                utils.log("m-member allMemberList.js initMemberList.featureDataI.initMemberList", error);
                callback(error);
                return;
            }
            callback(null, model);
        });
    }

    function initMemberCateList(model, callback) {
        featureDataI.initMemberCateList(model, function (error, model) {
            if (error) {
                utils.log("m-member allMemberList.js initMemberCateList.featureDataI.initMemberCateList", error);

            }
            callback(null, model);
        });
    }

    function initMsgSwitch(model, callback) {
        utils.getMsgSwitch(function (error, msgSwitch) {
            if (error) {
                utils.log("m-member allMemberList.js initMsgSwitch.utils.getMsgSwitch", error);
                callback(error);
                return;
            }
            model.msgSwitch = msgSwitch;
            callback(null, model);
        });
    }

    function initStoreInfo(model, callback) {
        utils.getStoreInfo(function (error, storeInfo) {
            if (error) {
                utils.log("m-member allMemberList.js initStoreInfo.utils.getStoreInfo", error);
                callback(error);
                return;
            }
            model.storeInfo = storeInfo;
            callback(null, model);
        });
    }

    //初始化小票格式开关
    function initTicketSwitch(model, callback) {
        utils.getTicketSwitch(function (error, ticketSwitch) {
            if (error) {
                callback(error);
                return;
            }
            model.ticketSwitch = ticketSwitch;
            callback(null, model);
        });
    }


    function initContoller($scope, $parse, $q, $http, $location) {
        moduleScope = $scope;

        $scope.digestScope = function () {
            try {
                $scope.$digest();
            }
            catch (error) {
                console.log(error);
            }
        };

        //选取某会员、
        $scope.selectMember = function (member) {
            $scope.temp.memberSelected = member;
            $("#member-" + $scope.memberInfo.id).css("background-color", "");
            $("#member-" + member.id).css("background-color", "#398acb");
            $scope.memberInfo.cardNo = member.cardNo;
            $scope.memberInfo.name = member.name;
            $scope.memberInfo.sex = member.sex;
            $scope.memberInfo.birthday = member.birthday;
            $scope.memberInfo.phoneMobile = member.phoneMobile == null ? "" : member.phoneMobile;
            $scope.memberInfo.currentMoney = member.currentMoney;
            $scope.memberInfo.memberCardCategory = member.memberCardCategoryName;
            $scope.memberInfo.memberCardCategoryId = member.memberCardCategoryId;
            $scope.memberInfo.create_date = member.create_date;
            $scope.memberInfo.id = member.id;
            $scope.memberInfo.cardId = member.cardId;
            $scope.memberInfo.baseInfo_type = member.baseInfo_type;

            async.series([isInvalid, countMemberCost, queryCardBalance], function (error) {
                if (error) {
                    utils.log("m-member allMemberList.js selectMember", error);
                    utils.showGlobalMsg("会员信息查询有误，请稍后再试");
                }
            });

            //会员卡是否失效
            function isInvalid(callback) {
                featureDataI.queryLastRecharge(member.cardId, function (error, result) {
                    if (error) {
                        callback(error);
                        return;
                    }
                    if (!_.isEmpty(result)) {
                        var befDays , lastRecharge = result.lastRecharge;
                        if (lastRecharge) {
                            befDays = Math.ceil((new Date().getTime() - lastRecharge) / (3600 * 1000 * 24));
                            if (befDays > member.periodOfValidity) {
                                $("#m-setting-memberInfo-invalid").show();
                            }
                            else {
                                $("#m-setting-memberInfo-invalid").hide();
                            }
                        }
                        else {
                            $("#m-setting-memberInfo-invalid").hide();
                        }
                    }
                    callback(null);
                });
            }

            //会员消费统计
            function countMemberCost(callback) {
                $scope.memberCount.pileRecharge = member.recharge_money;
                featureDataI.countMemberCost(member.cardId, function (error, result) {
                    if (error) {
                        callback(error);
                        return;
                    }
                    if (!_.isEmpty(result)) {
                        $scope.memberCount.pileTimes = result.pileTimes;
                        $scope.memberCount.pileCost = result.pileCost;
                        $scope.memberCount.customerPrice = result.customerPrice;
                        $scope.memberCount.recentlyCost = $scope.getBefCurrentDate(result.recentlyCost);
                        if ($scope.memberCount.recentlyCost === "") {
                            $scope.memberCount.recentlyCost = "未消费";
                        }
                        if (result.count) {
                            var befDay = Math.ceil((new Date().getTime() - result.firstConsumer) / 86400000);
                            //防止出现0天消费一次
                            if (befDay === 0) {
                                befDay = 1
                            }
                            $scope.memberCount.frequency = "平均" + Math.ceil(befDay / result.count) + "天消费1次";
                        }
                        else {
                            $scope.memberCount.frequency = "未消费";
                        }
                    }
                    callback(null);
                });
            }

            //重新从数据库更新该会员数据
            function queryCardBalance(callback) {
                featureDataI.queryCardBalance(member.cardId, function (error, result) {
                    if (error) {
                        callback(error);
                        return;
                    }
                    if (!_.isEmpty(result)) {
                        member.currentMoney = result.currentMoney;
                        $scope.memberInfo.currentMoney = member.currentMoney;
                    }
                    callback(null);
                });
            }
        };

        //跳转至消费详情页面
        $scope.consumeDetail = function (memberCardId) {
            $location.path("#/m-member/consumeList?memberCard_id=" + memberCardId);
        };

        //检查会员数量是否超过当前版本上限
        function checkMemberCount(callback) {
            if ($scope.temp.currentMemberCount) {
                if ($scope.temp.currentMemberCount < $scope.licenseInfo.maxMemberCount) {
                    callback(null, false);
                }
                else {
                    callback(null, true);
                }
            }
            else {
                featureDataI.queryMemberCount(function (error, result) {
                    if (error) {
                        callback(error);
                        return;
                    }
                    if (!_.isEmpty(result)) {
                        $scope.temp.currentMemberCount = result.count;
                        //是否达到最大会员数
                        if ($scope.temp.currentMemberCount < $scope.licenseInfo.maxMemberCount) {
                            callback(null, false);
                        }
                        else {
                            callback(null, true);
                        }
                    }
                    else {
                        callback("会员数获取出错");
                    }
                });
            }
        }

        function emptyNewMember() {
            $scope.newMember.id = "";
            $scope.newMember.name = "";
            $scope.newMember.sex = $scope.sexConstant[0];
            $scope.newMember.birthday = "";
            $scope.newMember.phoneMobile = "";
            if ($scope.rechargeCateList.length !== 0) {
                $scope.cardTypeSelected = $scope.cardTypeList[0];
                $scope.newMember.memberCardCategory = $scope.rechargeCateList[0];
                $scope.memberRecharge.rechargeMoney = $scope.newMember.memberCardCategory.baseInfo_minMoney;
            }
            $scope.newMember.employee = $scope.employeeList[0];
        }

        //新增会员初始化
        $scope.addMember = function () {
            checkMemberCount(function (error, reachMaxCount) {
                if (error) {
                    utils.showGlobalMsg("系统错误!");
                    utils.log("m-member allMemberList.js addMember.checkMemberCount", error);
                    return;
                }
                if (reachMaxCount) {
                    utils.showGlobalMsg("会员数量已达到上限,请联系客服人员升级版本!");
                }
                else {
                    $scope.action = "开卡";
                    emptyNewMember();
                    $scope.pageIndex = "memberNewOrUpdate";
                    $(".error-hint").hide();
                    utils.showSoftKeyboard("#m-setting-addMember input:first", 500);
                }
            });
        };

        //更换类别时、自动将开卡金额设置为该类型最低值
        $scope.selectMemberCate = function (memberCate) {
            $scope.newMember.memberCardCategory = memberCate;
            $scope.memberRecharge.rechargeMoney = $scope.newMember.memberCardCategory.baseInfo_minMoney;

        };

        //选取性别
        $scope.selectMemberSex = function (sex) {
            $scope.newMember.sex = sex;
        };

        $scope.selectMemberEmpBonus = function (employee) {
            $scope.newMember.employee = employee;
        };

        //检查名字
        $scope.checkName = function () {
            var nameError = $(".error-hint-one").hide();
            var legal = utils.checkStrMinLen($scope.newMember.name, 1);
            if (!legal) {
                nameError.show();
            }
            return legal;
        };

        //检查手机号码
        $scope.checkPhone = function () {
            var phoneError = $(".error-hint-three").hide();
            var legal = utils.isPhoneNumber($scope.newMember.phoneMobile);
            if (!legal) {
                phoneError.show();
            }
            return legal;
        };

        //检查初始金额
        $scope.checkRecharge = function () {
            var flag = true;
            var rechargeError = $("#error-new-recharge").hide();
            if ($scope.memberRecharge.rechargeMoney || $scope.memberRecharge.rechargeMoney === 0) {
                if (parseFloat($scope.memberRecharge.rechargeMoney) < parseFloat($scope.newMember.memberCardCategory.baseInfo_minMoney)) {
                    flag = false;
                    $("#newCard-minMoney-error").text("不能小于该类型最低金额" + $scope.newMember.memberCardCategory.baseInfo_minMoney);
                    rechargeError.show();
                }
                if (parseFloat($scope.memberRecharge.rechargeMoney) > 1000000) {
                    flag = false;
                    $("#newCard-minMoney-error").text("输入金额过大");
                    rechargeError.show();
                }
            }
            else {
                flag = false;
                $("#newCard-minMoney-error").text("请输入数字");
                rechargeError.show();
            }
            return flag;
        };

        //对新增或者修改数据进行校验、newMember
        function checkInput() {
            var flag;
            //保持提示最新的错
            var rechargeError = $("#error-new-recharge").hide();

            var nameCheckResult = $scope.checkName();
            var phoneCheckResult = $scope.checkPhone();

            flag = (nameCheckResult && phoneCheckResult);

            //新增修改都调用此校验方法、修改时不需要对开卡金额校验
            if (!$scope.newMember.id) {
                if ($scope.memberRecharge.rechargeMoney || $scope.memberRecharge.rechargeMoney === 0) {
                    if (parseFloat($scope.memberRecharge.rechargeMoney) < parseFloat($scope.newMember.memberCardCategory.baseInfo_minMoney)) {
                        flag = false;
                        $("#newCard-minMoney-error").text("不能小于该类型最低金额" + $scope.newMember.memberCardCategory.baseInfo_minMoney);
                        rechargeError.show();
                    }
                    if (parseFloat($scope.memberRecharge.rechargeMoney) > 1000000) {
                        flag = false;
                        $("#newCard-minMoney-error").text("输入金额过大");
                        rechargeError.show();
                    }
                }
                else {
                    flag = false;
                    rechargeError.show();
                }
            }

            if ($scope.rechargeCateList.length === 0) {
                flag = false;
                utils.showAreaFailMsg("#member-new", "请先在管理台添加会员类型");
            }
            return flag;
        }

        //根据毫秒数转换成离当前日期的合适表示字符串
        $scope.getBefCurrentDate = function (milli) {
            if (milli) {
                var befDayStr, nowDate = new Date(), regDate = new Date(parseInt(milli));
                var befDay = Math.floor((nowDate.getTime() - milli) / 86400000);            //距今多少天

                if (befDay <= 1) {
                    if (nowDate.getDate() - regDate.getDate() < 1) {
                        befDayStr = "今天";
                    }
                    else {
                        befDayStr = "昨天";
                    }
                }
                else if (befDay <= 2) {
                    if (nowDate.getDate() - regDate.getDate() < 2) {
                        befDayStr = "昨天";
                    }
                    else {
                        befDayStr = "前天";
                    }
                }
                else if (befDay <= 3) {
                    if (nowDate.getDate() - regDate.getDate() < 3) {
                        befDayStr = "前天";
                    }
                    else {
                        befDayStr = "4天前";
                    }
                }
                else if (befDay < 7) {
                    befDayStr = befDay + "天前";
                }
                else if (befDay <= 28) {
                    befDayStr = Math.ceil(befDay / 7) + "周前";
                }
                else if (befDay <= 365) {
                    befDayStr = Math.ceil(befDay / 30) + "月前"
                }
                else {
                    befDayStr = Math.ceil(befDay / 365) + "年前"
                }
            }
            else {
                befDayStr = "";
            }
            return befDayStr;
        };

        function printRechargeTicket(rechargeBill, callback) {
            //开关关闭状态
            if ($scope.ticketSwitch.rechargeTicketSwitch == 0) {
                callback(null);
                return;
            }

            var printTemplate = {
                ticket_type: 3,
                header: {
                    store_name: $scope.storeInfo.name,
                    consume_no: rechargeBill.billNo,
                    date: new Date().Format("yyyy-MM-dd hh:mm:ss"),
                    card_no: $scope.memberInfo.cardNo
                },
                body: [
                    {
                        name: $scope.memberInfo.memberCardCategory + "卡充值",
                        amount: "1",
                        sum: "￥" + rechargeBill.amount.toFixed(2)
                    }
                ],
                summary: {},
                config_item: {
                    discount_amount: "",
                    balance: ""
                },
                //小计，折后，扣卡，优惠金额，卡内余额，地址，电话
                footer: {
                    address: $scope.storeInfo.addr_state_city_area + $scope.storeInfo.addr_detail,
                    phone: $scope.storeInfo.contact_phoneMobile
                }
            };
            utils.printTicket(printTemplate, callback);
        }

        function printNewCardTicket(rechargeBill, memberCard, callback) {
            //开关关闭状态
            if ($scope.ticketSwitch.newCardTicketSwitch == 0) {
                callback(null);
                return;
            }

            var printTemplate = {
                header: {
                    store_name: $scope.storeInfo.name,
                    consume_no: rechargeBill.billNo,
                    date: new Date().Format("yyyy-MM-dd hh:mm:ss"),
                    card_no: memberCard.cardNo
                },
                body: [
                    {
                        name: "办理" + memberCard.memberCardCategoryName + "卡",
                        amount: "1",
                        sum: "￥" + rechargeBill.amount.toFixed(2)
                    }
                ],
                summary: {},
                config_item: {
                    discount_amount: "",
                    balance: ""
                },
                //小计，折后，扣卡，优惠金额，卡内余额，地址，电话
                footer: {
                    address: $scope.storeInfo.addr_state_city_area + $scope.storeInfo.addr_detail,
                    phone: $scope.storeInfo.contact_phoneMobile
                }
            };

            //记次卡开卡小票
            if ($scope.cardTypeSelected === $scope.cardTypeList[1]) {
                printTemplate.ticket_type = 5;
            }
            else {
                printTemplate.ticket_type = 4;
            }
            utils.printTicket(printTemplate, callback);
        }

        //新增或者修改会员确认
        $scope.newMember_save = function () {
            //通过覆盖层将按钮disable
            var memSaveCover = $("#member-save-disable-cover");
            memSaveCover.show();

            if (!checkInput()) {
                memSaveCover.hide();
                return;
            }

            var birMilli = "";
            if ($scope.newMember.birthday) {
                birMilli = new Date($scope.newMember.birthday).getTime()
            }

            if ($scope.newMember.id === "") {
                newMember();
            }
            else {
                memSaveCover.hide();
                updateMember();
            }

            //新增会员
            function newMember() {
                var now = new Date();
                var createDate = now.getTime();
                $scope.newMember.create_date = createDate;
                $scope.newMember.currentMoney = $scope.memberRecharge.rechargeMoney;

                var member = {
                    name: $scope.newMember.name,
                    phoneMobile: $scope.newMember.phoneMobile.toString(),
                    sex: $scope.newMember.sex.value,
                    birthday: birMilli,
                    create_date: createDate,
                    enterprise_id: YILOS.ENTERPRISEID
                };

                var memberCard = {
                    currentMoney: $scope.newMember.currentMoney,
                    recharge_money: $scope.newMember.currentMoney,
                    periodOfValidity: $scope.newMember.memberCardCategory.cardValid,
                    memberCardCategoryName: $scope.newMember.memberCardCategory.name,
                    memberCardCategoryId: $scope.newMember.memberCardCategory.id,
                    cardNo: "",
                    employee_id: $scope.newMember.employee ? ($scope.newMember.employee.id ? $scope.newMember.employee.id : "" ) : "",
                    employee_name: $scope.newMember.employee ? ($scope.newMember.employee.id ? $scope.newMember.employee.name : "" ) : "",
                    memberId: "",
                    enterprise_Id: YILOS.ENTERPRISEID,
                    create_date: createDate,
                    lastConsumption_date: 0,
                    totalConsumption: 0,
                    cardCate: $scope.newMember.memberCardCategory
                };

                //记次卡余额、标记为剩余多少次
                if ($scope.cardTypeSelected === $scope.cardTypeList[1]) {
                    memberCard.currentMoney = $scope.newMember.memberCardCategory.discounts_serviceDiscount;
                }

                var rechargeBill = {
                    type: 2,//开卡
                    amount: $scope.newMember.currentMoney,
                    dateTime: createDate,
                    day: now.getDate(),
                    weekDay: now.getDay(),
                    month: now.getMonth() + 1,
                    memberCardCate_id: memberCard.memberCardCategoryId,
                    memberCard_name: memberCard.cardNo,
                    member_name: member.name,
                    member_currentBalance: memberCard.currentMoney,//当前剩余多少次
                    employee_id: memberCard.employee_id,
                    employee_name: memberCard.employee_name,
                    pay_cash: $scope.newMember.currentMoney,
                    create_date: createDate,
                    enterprise_id: YILOS.ENTERPRISEID
                };


                var empBonus = {};
                if (memberCard.employee_id && $scope.newMember.currentMoney != 0) {
                    empBonus.dateTime = createDate;
                    empBonus.type = 8;//代表开卡
                    empBonus.employee_id = memberCard.employee_id;
                    empBonus.totalMoney = $scope.newMember.currentMoney;
                    empBonus.member_name = member.name;
                    empBonus.cardCate = memberCard.memberCardCategoryName;
                    empBonus.befDisMoney = $scope.newMember.currentMoney;
                    empBonus.billDetail = "开卡";
                    empBonus.discount = 10;
                    empBonus.bonusMoney = parseFloat((empBonus.totalMoney * $scope.newMember.employee.bonus_newCard / 100).toFixed(2));
                    empBonus.create_date = createDate;
                    empBonus.enterprise_id = YILOS.ENTERPRISEID;

                    //记次卡开卡提成
                    if ($scope.cardTypeSelected === $scope.cardTypeList[1]) {
                        empBonus.bonusMoney = parseFloat((empBonus.totalMoney * $scope.newMember.employee.bonus_newRecordCard / 100).toFixed(2));
                    }
                }

                featureDataI.newMemberFillIdCode(member, memberCard, rechargeBill, empBonus, function (error, result) {
                    if (error) {
                        utils.log("m-member allMemberList.js newMember_save.newMember.featureDataI.newMemberFillIdCode", error);
                        utils.showAreaFailMsg("#member-new", "新增失败");
                        memSaveCover.hide();
                        return;
                    }
                    var printResult = _.clone(result);
                    featureDataI.newMember(result.member, result.memberCard, result.rechargeBill, result.empBonus, function (error) {
                        if (error) {
                            utils.log("m-member allMemberList.js newMember_save.newMember.featureDataI.newMember", error);
                            utils.showAreaFailMsg("#member-new", "新增失败");
                            memSaveCover.hide();
                            return;
                        }
                        memSaveCover.hide();
                        //新增成功将当前会员数量+1
                        $scope.temp.currentMemberCount++;
                        database.updateBackupFlag(createDate, YILOS_NAIL_MODULE.MEMBER, null);
                        if (!_.isEmpty(empBonus)) {
                            database.updateBackupFlag(createDate, YILOS_NAIL_MODULE.EMPLOYEE, null);
                        }
                        var temp = {
                            id: member.id,
                            name: member.name,
                            sex: member.sex,
                            birthday: member.birthday,
                            create_date: member.create_date,
                            phoneMobile: member.phoneMobile,
                            cardId: memberCard.id,
                            cardNo: memberCard.cardNo,
                            currentMoney: memberCard.currentMoney,
                            memberCardCategoryName: memberCard.memberCardCategoryName,
                            memberCardCategoryId: memberCard.memberCardCategoryId,
                            periodOfValidity: memberCard.periodOfValidity,
                            recharge_money: memberCard.recharge_money,
                            baseInfo_type: $scope.cardTypeSelected === $scope.cardTypeList[1] ? "recordTimeCard" : ""
                        };

                        var msgContent = {};
                        if ($scope.msgSwitch.newCardMsgSwitch == 1 && temp.baseInfo_type !== "recordTimeCard") {
                            //充值卡开卡提醒
                            msgContent.template_id = "template_5";
                            msgContent.phoneNumber = temp.phoneMobile;
                            msgContent.memberCardName = temp.memberCardCategoryName + "卡";//因为短信模版问题、模版中没有卡字
                            msgContent.totalMoney = temp.currentMoney;
                            msgContent.enterpriseName = $scope.storeInfo.name;
                            sendMsg(msgContent);
                        }
                        else if ($scope.msgSwitch.newRecordMsgSwitch == 1 && temp.baseInfo_type === "recordTimeCard") {
                            //记次卡开卡提醒
                            msgContent.template_id = "template_6";
                            msgContent.phoneNumber = temp.phoneMobile;
                            msgContent.memberCardName = temp.memberCardCategoryName + "卡";//因为短信模版问题、模版中没有卡字
                            msgContent.totalMoney = temp.recharge_money;
                            msgContent.times = temp.currentMoney;
                            msgContent.enterpriseName = $scope.storeInfo.name;
                            sendMsg(msgContent);
                        }

                        $scope.memberList.splice(0, 0, temp);
                        //新增会员成功
                        global.eventEmitter.emitEvent('member.member.change');
                        setTimeout(function () {
                            $(".error-hint").hide();
                        }, 500);
                        emptyNewMember();
                        //新增成功后2s返回
                        setTimeout(function () {
                            $scope.cancel();
                            $scope.digestScope();
                        }, 2000);
                        utils.showAreaSuccessMsg("#member-new", "新增成功");
                        printNewCardTicket(printResult.rechargeBill, printResult.memberCard, function (error) {
                            if (error) {
                                //todo 打印失败处理
                                utils.log("m-member allMemberList.js newMember_save.newMember.printNewCardTicket", error);
                                console.log("打印失败");
                            }
                        });
                    });
                });
            }

            function updateMember() {
                var updateTime = new Date().getTime();
                var updateMember = {
                    id: $scope.newMember.id,
                    name: $scope.newMember.name,
                    phoneMobile: $scope.newMember.phoneMobile.toString(),
                    sex: $scope.newMember.sex.value,
                    birthday: birMilli,
                    modify_date: updateTime
                };
                var updateCard = {};

                var oldCateId = $scope.memberInfo.memberCardCategoryId;
                var msgContent = null;

                if ($scope.cardTypeSelected === $scope.cardTypeList[0]) {
                    updateCard = {
                        id: $scope.memberInfo.cardId,
                        periodOfValidity: $scope.newMember.memberCardCategory.cardValid,
                        memberCardCategoryName: $scope.newMember.memberCardCategory.name,
                        memberCardCategoryId: $scope.newMember.memberCardCategory.id,
                        modify_date: updateTime
                    };
                    var newCateId = updateCard.memberCardCategoryId;
                    if (newCateId !== oldCateId) {
                        msgContent = {};
                        msgContent.template_id = "template_7";
                        msgContent.phoneNumber = updateMember.phoneMobile;
                        msgContent.srcMemberCardName = $scope.memberInfo.memberCardCategory;
                        msgContent.destMemberCardName = updateCard.memberCardCategoryName;
                        msgContent.enterpriseName = $scope.storeInfo.name;
                    }
                }

                featureDataI.updateMember(updateMember, updateCard, function (error) {
                    if (error) {
                        utils.showAreaFailMsg("#member-new", "修改失败");
                        utils.log("m-member allMemberList.js newMember_save.updateMember.featureDataI.updateMember", error);
                        return;
                    }
                    global.eventEmitter.emitEvent("member.member.change", [updateMember.id]);
                    database.updateBackupFlag(updateTime, YILOS_NAIL_MODULE.MEMBER, null);
                    //刷新界面会员信息
                    for (var i = 0; i < $scope.memberList.length; i++) {
                        if ($scope.memberList[i].id == updateMember.id) {
                            var temp = _.clone($scope.memberList[i]);
                            temp.name = updateMember.name;
                            temp.phoneMobile = updateMember.phoneMobile;
                            temp.sex = updateMember.sex;
                            temp.birthday = updateMember.birthday;
                            temp.memberCardCategoryName = $scope.newMember.memberCardCategory.name;
                            temp.memberCardCategoryId = $scope.newMember.memberCardCategory.id;
                            temp.periodOfValidity = $scope.newMember.memberCardCategory.cardValid;
                            $scope.memberList.splice(i, 1, temp);
                            break;
                        }
                    }
                    //修改成功后2s返回
                    setTimeout(function () {
                        $scope.cancel();
                        $scope.digestScope();
                    }, 2000);

                    if (msgContent && $scope.msgSwitch.cardCateChangeMsgSwitch == 1) {
                        sendMsg(msgContent);
                    }
                    utils.showAreaSuccessMsg("#member-new", "修改成功");
                });
            }
        };

        //充值
        $scope.rechargeMember = function () {
            if (!_.isEmpty($scope.memberInfo)) {
                if ($scope.memberInfo.baseInfo_type === "recordTimeCard") {
                    utils.showGlobalMsg("记次卡不能充值");
                    return;
                }
                $scope.memberRecharge.rechargeMoney = "";
                $(".error-hint").hide();
                $scope.pageIndex = "memberRecharge";
                utils.showSoftKeyboard("#m-setting-member-recharge input:first", 500);
            }
            else {
                utils.showGlobalMsg("请选择一位会员");
            }
        };

        $scope.updateMember = function () {
            $scope.action = "修改会员";
            if (!_.isEmpty($scope.memberInfo)) {
                if ($scope.memberInfo.birthday) {
                    var dateTemp = new Date($scope.memberInfo.birthday);
                    $scope.newMember.birthday = dateTemp.getFullYear() + "-" + (dateTemp.getMonth() + 1) + "-" + dateTemp.getDate();
                }
                $scope.newMember.id = $scope.memberInfo.id;
                $scope.newMember.name = $scope.memberInfo.name;
                $scope.newMember.sex = $scope.sexConstant[parseInt($scope.memberInfo.sex)];
                $scope.newMember.phoneMobile = parseInt($scope.memberInfo.phoneMobile);
                $scope.newMember.cardNo = $scope.memberInfo.cardNo;
                $scope.newMember.baseInfo_type = $scope.memberInfo.baseInfo_type;
                //卡类型选中
                if ($scope.newMember.baseInfo_type === "recordTimeCard") {
                    $scope.cardTypeSelected = $scope.cardTypeList[1];
                    _.each($scope.recordCateList, function (item) {
                        if ($scope.memberInfo.memberCardCategoryId === item.id) {
                            $scope.newMember.memberCardCategory = item;
                        }
                    });
                }
                else {
                    $scope.cardTypeSelected = $scope.cardTypeList[0];
                    _.each($scope.rechargeCateList, function (item) {
                        if ($scope.memberInfo.memberCardCategoryId === item.id) {
                            $scope.newMember.memberCardCategory = item;
                        }
                    });
                }
                $(".error-hint").hide();
                $scope.pageIndex = "memberNewOrUpdate";
                utils.showSoftKeyboard("#m-setting-addMember input:first", 500);
            }
            else {
                utils.showGlobalMsg("请选择一位会员");
            }
        };

        $scope.checkRechargeMoney = function () {
            var recError = $(".error-hint-four").hide();
            var legal = utils.checkNum($scope.memberRecharge.rechargeMoney, 0.000001, 100000);//不包含0、使用0.000001替代
            if (!legal) {
                recError.show();
            }
            return legal;
        };

        //充值确认
        $scope.rechargeMember_save = function () {
            var rechargeCover = $("#recharge-save-disable-cover");
            rechargeCover.show();
            if (!$scope.checkRechargeMoney()) {
                rechargeCover.hide();
                return;
            }
            var now = new Date();
            var createDate = now.getTime();

            var memberCard = {
                id: $scope.memberInfo.cardId,
                rechargeMoney: parseFloat($scope.memberRecharge.rechargeMoney)
            };

            var rechargeBill = {
                type: 1,//充值
                amount: memberCard.rechargeMoney,
                dateTime: createDate,
                day: now.getDate(),
                weekDay: now.getDay(),
                month: now.getMonth() + 1,
                member_id: $scope.memberInfo.id,
                member_name: $scope.memberInfo.name,
                memberCard_id: memberCard.id,
                memberCardCate_id: $scope.memberInfo.memberCardCategoryId,
                memberCard_name: $scope.memberInfo.cardNo,
                member_currentBalance: parseFloat($scope.memberInfo.currentMoney + $scope.memberRecharge.rechargeMoney),
                employee_id: $scope.newMember.employee ? ($scope.newMember.employee.id ? $scope.newMember.employee.id : "") : "",
                employee_name: $scope.newMember.employee ? ($scope.newMember.employee.id ? $scope.newMember.employee.name : "") : "",
                pay_cash: memberCard.rechargeMoney,
                create_date: createDate,
                enterprise_id: YILOS.ENTERPRISEID
            };


            var empBonus = {};

            if (rechargeBill.employee_id) {
                empBonus.project_id = memberCard.id;
                empBonus.serviceBill_id = rechargeBill.id;
                empBonus.dateTime = createDate;
                empBonus.type = 4;//代表充值
                empBonus.employee_id = rechargeBill.employee_id;
                empBonus.totalMoney = memberCard.rechargeMoney;
                empBonus.member_name = $scope.memberInfo.name;
                empBonus.cardNo = $scope.memberInfo.cardNo;
                empBonus.cardCate = $scope.memberInfo.memberCardCategory;
                empBonus.befDisMoney = memberCard.rechargeMoney;
                empBonus.billDetail = "卡充值";
                empBonus.discount = 10;
                empBonus.bonusMoney = (memberCard.rechargeMoney * $scope.newMember.employee.bonus_recharge / 100).toFixed(2);
                empBonus.create_date = createDate;
                empBonus.enterprise_id = YILOS.ENTERPRISEID;
            }

            featureDataI.rechargeFillIdCode(memberCard, rechargeBill, empBonus, function (error, result) {
                if (error) {
                    utils.showAreaFailMsg("#member-recharge", "充值失败");
                    rechargeCover.hide();
                    utils.log("m-member allMemberList.js rechargeMember_save.featureDataI.rechargeFillIdCode", error);
                    return;
                }
                var printResult = _.clone(result);
                featureDataI.rechargeMember(result.memberCard, result.rechargeBill, result.empBonus, function (error) {
                    if (error) {
                        utils.showAreaFailMsg("#member-recharge", "充值失败");
                        rechargeCover.hide();
                        utils.log("m-member allMemberList.js rechargeMember_save.featureDataI.rechargeMember", error);
                        return;
                    }
                    rechargeCover.hide();
                    global.eventEmitter.emitEvent('member.member.change', [$scope.memberInfo.id]);
                    database.updateBackupFlag(rechargeBill.create_date, YILOS_NAIL_MODULE.MEMBER, null);
                    if (!_.isEmpty(empBonus)) {
                        database.updateBackupFlag(rechargeBill.create_date, YILOS_NAIL_MODULE.EMPLOYEE, null);
                    }

                    var msgContent = {};
                    if ($scope.msgSwitch && $scope.msgSwitch.cardRechargeMsgSwitch == 1) {
                        //发送短信内容
                        msgContent.template_id = "template_8";
                        msgContent.phoneNumber = $scope.memberInfo.phoneMobile;
                        msgContent.memberCardNo = $scope.memberInfo.cardNo;
                        msgContent.memberCardName = $scope.memberInfo.memberCardCategory;
                        msgContent.money = parseFloat($scope.memberRecharge.rechargeMoney);
                        msgContent.enterpriseName = $scope.storeInfo.name;
                        sendMsg(msgContent);
                    }

                    //跟充值相关的信息刷新
                    for (var i = 0; i < $scope.memberList.length; i++) {
                        if ($scope.memberList[i].cardId == memberCard.id) {
                            var temp = _.clone($scope.memberList[i]);
                            temp.currentMoney += memberCard.rechargeMoney;
                            temp.recharge_money += memberCard.rechargeMoney;
                            $scope.memberInfo.currentMoney = temp.currentMoney;
                            $scope.memberList.splice(i, 1, temp);
                            break;
                        }
                    }

                    $scope.memberRecharge.rechargeMoney = "";
                    $scope.digestScope();
                    //充值成功2s后返回
                    setTimeout(function () {
                        $scope.cancel();
                    }, 2000);

                    utils.showAreaSuccessMsg("#member-recharge", "充值成功");
                    printRechargeTicket(printResult.rechargeBill, function (error) {
                        if (error) {
                            //todo 打印失败处理
                            utils.log("m-member allMemberList.js rechargeMember_save.printRechargeTicket", error);
                            console.log("打印失败");
                        }
                    });
                });
            });
        };

        function showMsg(msg) {
            utils.showTips(msg);
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
                        showMsg("账户余额不足，发送短信失败");
                    }
                },
                error: function (error) {

                }
            });
        }

        //注销会员
        $scope.cancelMember = function () {
            if (!_.isEmpty($scope.memberInfo)) {
                $.fancybox.open({href: "#member-cancel" },
                    {
                        openEffect: 'none',
                        closeEffect: 'none',
                        closeBtn: false,
                        closeClick: false,
                        autoSize: false,
                        autoHeight: true,
                        autoWidth: true,
                        fitToView: true,
                        padding: 0,
                        margin: 0,
                        helpers: {
                            overlay: {
                                closeClick: false
                            }
                        }
                    });
            }
            else {
                utils.showGlobalMsg("请选择一位会员");
            }
        };

        //注销确认
        $scope.cancelMember_yes = function () {
            featureDataI.deleteMember($scope.memberInfo.id, $scope.memberInfo.cardId, function (error) {
                if (error) {
                    utils.showAreaFailMsg("#member-cancel", "注销失败");
                    utils.log("m-member allMemberList.js cancelMember_yes.featureDataI.deleteMember", error);
                    return;
                }
                for (var i = 0; i < $scope.memberList.length; i++) {
                    if ($scope.memberList[i].id == $scope.memberInfo.id) {
                        $scope.memberList.splice(i, 1);
                        break;
                    }
                }
                var memberIdTemp = $scope.memberInfo.id;
                $scope.memberInfo = {};
                $scope.memberCount = {};
                //防止再次切换到该页面选择已注销的会员
                $scope.temp.memberSelected = {};
                $("#m-setting-memberInfo-invalid").hide();//注销的是失效会员、隐藏该提示信息
                global.eventEmitter.emitEvent('member.member.change', [memberIdTemp]);
                if ($scope.temp.currentMemberCount) {
                    $scope.temp.currentMemberCount--;
                }
                setTimeout(function () {
                    $scope.cancel();
                }, 2000);
                utils.showAreaSuccessMsg("#member-cancel", "注销成功");
            });
        };

        //操作返回、
        $scope.cancel = function () {
            $scope.pageIndex = "memberList";
            setTimeout(function () {
                if (!_.isEmpty($scope.memberInfo)) {
                    //再次触发选择会员操作、保持memberInfo内容最新
                    for (var i = 0; i < $scope.memberList.length; i++) {
                        if ($scope.memberList[i].id === $scope.memberInfo.id) {
                            $scope.selectMember($scope.memberList[i]);
                            $scope.digestScope();
                            break;
                        }
                    }
                }
            }, 100);
            $scope.closeDialog();
        };

        $scope.closeDialog = function () {
            $.fancybox.close();
        };

        $scope.$watch("search", function (newVal, oldVal) {
            if (newVal !== oldVal) {
                //$scope.newVal用于延迟处理查询、防止在连续输入时查询开销过大
                $scope.newVal = newVal;
                setTimeout(function () {
                    if (newVal === $scope.newVal) {
                        $scope.searchMember();
                    }
                }, CONSTANT.searchDelay);
            }
        }, false);

        $scope.searchMember = function () {
            $scope.pageNo = 1;      //重新设置页数
            $scope.memberList = [];
            featureDataI.searchMember($scope.search, 0, $scope.pageSize, function (error, result) {
                if (error) {
                    utils.log("m-member allMemberList.js $scope.searchMember.featureDataI.searchMember", error);
                    utils.showGlobalMsg("查询失败,请稍后再试");
                    return;
                }
                $scope.memberList = $scope.memberList.concat(result);

                $("#scroll-result-list>.caps-tip").hide();
                $scope.digestScope();
            });
        };

        //会员列表展示$scope.pageSize条、向下滚动触发翻页动作
        $scope.memberNextPage = function () {
            //上限提示
            if ($scope.memberList.length >= CONSTANT.memberCountCaps) {
                $("#scroll-result-list>.caps-tip").show();
                return;
            }

            featureDataI.searchMember($scope.search, $scope.pageNo * $scope.pageSize, $scope.pageSize, function (error, result) {
                if (error) {
                    utils.log("m-member allMemberList.js $scope.searchMember.featureDataI.searchMember", error);
                    utils.showGlobalMsg("查询失败,请稍后再试");
                    return;
                }
                $scope.memberList = $scope.memberList.concat(result);
                if (result.length !== 0) {
                    $scope.pageNo++;
                    $scope.digestScope();
                }
            });
        };

        $scope.selBirthday = function ($event) {
            var config = {
                title: "选择日期"
            };

            if ($scope.newMember.birthday) {
                var dateTemp = new Date($scope.newMember.birthday);
                config.year = dateTemp.getFullYear();
                config.month = dateTemp.getMonth() + 1;
                config.day = dateTemp.getDate();
            }
            else {
                config.year = 1980;
                config.month = 1;
                config.day = 1;
            }

            showDatePickerDia(config, $event.target, function (error, date) {
                if (error) {
                    utils.log("m-member allMemberList.js showDatePickerDia", error);
                    return;
                }
                $scope.newMember.birthday = date;
                $scope.digestScope();
            });
        };

        //显示系统日期选择控件
        function showDatePickerDia(config, el, callback) {
            if (cordova.platformId == "ios") {
                var options = {
                    date: new Date(),
                    x: $(el).offset().left + 300,
                    y: $(el).offset().top,
                    mode: 'date'
                };
                // calling show() function with options and a result handler
                datePicker.show(options, function (date) {
                    var month = date.getMonth() + 1;
                    callback(null, date.getFullYear() + "-" + month + "-" + date.getDate());
                });
            }
            else if (window.plugins && window.plugins.DatePicker) {
                window.plugins.DatePicker.showDateDia(config, function (result) {
                    callback(null, result.date);
                }, function (error) {
                    callback(error)
                });
            }
            else {
                callback("日期选择插件不存在");
            }
        }

        //选择充值卡还是记次卡
        $scope.selectCardType = function (type) {
            //充值卡
            if (type === $scope.cardTypeList[0] && $scope.rechargeCateList.length !== 0) {
                $scope.selectMemberCate($scope.rechargeCateList[0]);
                $scope.cardTypeSelected = type;
            }
            else if (type === $scope.cardTypeList[1] && $scope.recordCateList.length !== 0) {
                $scope.selectMemberCate($scope.recordCateList[0]);
                $scope.cardTypeSelected = type;
            }
            else if ($scope.recordCateList.length === 0) {
                utils.showGlobalMsg("请先添加记次卡类型");
            }
            else {
                utils.showGlobalMsg("请先添加充值卡类型");
            }

        }
    }

    function init() {

    }

    function afterPageLoaded() {
        $('.m-member-fancybox-media').fancybox({
            openEffect: 'none',
            closeEffect: 'none',
            autoSize: false,
            padding: 0,
            closeBtn: false,
            closeClick: false,
            margin: 0,
            autoHeight: true,
            autoWidth: true,
            fitToView: true,
            helpers: {
                overlay: {
                    closeClick: false
                }
            }
        });

        $("#out-result-list").scroll(function () {
            var listHeight = $("#out-result-list").height();
            var scrollHeight = $(this)[0].scrollHeight;
            var scrollTop = $(this)[0].scrollTop;
            if (listHeight + scrollTop >= scrollHeight - 100) {
                moduleScope.memberNextPage();
            }
        });

        adjustHeight();

        //设置模块中会员类型发生改变、重新初始化
        global.eventEmitter.addListener("m-setting.member.change", function (memberCateId) {
            if (!memberCateId) {
                initMemberCateList(moduleScope, function () {
                });
            }
            else {
                initMemberCateList(moduleScope, function () {
                    var changedMemberCate = _.find(moduleScope.rechargeCateList, function (item) {
                        return item.id == memberCateId;
                    });
                    if (!_.isEmpty(changedMemberCate)) {
                        var nameTemp = changedMemberCate.name;
                        //修改会员类型后重新刷新左侧会员列表
                        _.each(moduleScope.memberList, function (item) {
                            if (item.memberCardCategoryId == memberCateId) {
                                item.memberCardCategoryName = nameTemp;
                            }
                        });
                    }
                });
            }
        });

        //服务项修改、可能涉及到记次卡内的服务
        global.eventEmitter.addListener("setting.service.service.change", function () {
            moduleScope.cateReload = true;
        });

        global.eventEmitter.addListener("m-setting.employee.change", function () {
            initEmployeeList(moduleScope, function () {
            });
        });

        function adjustHeight() {
            if (!$("#m-member-allMemberList-area").is(":hidden")) {
                var permanentMenuKeyHeight = 0;
                if (window.LosNailActivity && !window.LosNailActivity.hasPermanentMenuKey()) {
                    permanentMenuKeyHeight = 60
                }
                if ($(document).width() <= 800) {
                    $("#m-member-allMemberList-area .member-right").height($("#main-container").outerHeight());
                    $("#m-member-allMemberList-area #out-result-list").height($("#main-container").outerHeight() - $("#member-search-input").outerHeight() - 48);

                } else {
                    $("#m-member-allMemberList-area .member-right").height($("#main-container").outerHeight());
                    $("#m-member-allMemberList-area #out-result-list").height($("#main-container").outerHeight() - $("#member-search-input").outerHeight() - permanentMenuKeyHeight - 24);
                }
            }
        }
    }

    function switchMenu(params) {
        if (moduleScope) {
            if (!_.isEmpty(moduleScope.temp.memberSelected)) {
                moduleScope.selectMember(moduleScope.temp.memberSelected);
                setTimeout(function () {
                    moduleScope.$digest();
                }, 100);
            }
            if (moduleScope.cateReload) {
                initMemberCateList(moduleScope, function () {
                });
                moduleScope.cateReload = false;
            }
        }
    }

    function paramsChange(params) {

    }
});
