define(function (require, exports, module) {
    exports.init = init;
    exports.switchMenu = switchMenu;
    exports.paramsChange = paramsChange;
    exports.afterPageLoaded = afterPageLoaded;
    exports.loadModelAsync = loadModelAsync;
    exports.initContoller = initContoller;
    exports.fullscreen = true;
    require("./setting.css");

    //基础服务
    var utils = require("mframework/static/package").utils;
    var database = require("mframework/static/package").database;
    var dbInstance = null;
    var featureDataI = require("./member-dataI.js");
    var moduleScope;

    function loadModelAsync(params, callback) {
        dbInstance = database.getDBInstance();
        var model = {
            dia_action: "",
            pageIndex: "memberTypeList",
            selectedStyle: "memberTypeList",
            action: "",
            memberType: {
                id: "",
                name: "",
                baseInfo_minMoney: "",
                discounts_serviceDiscount: ""
            },
            validList: [
                {name: "一年", value: 365},
                {name: "两年", value: 730},
                {name: "三年", value: 1095}
            ],//有效期选项
            selValidIndex: 0,//有效期选中项所引
            cardTypeList: ["充值卡", "记次卡"],//记次卡冲值卡类型
            selectServiceList: [],
            selectServiceNameList: [],
            selectServiceIdList: [],
            selectServiceNameString: "",//记次卡选择的服务项目数组、name构成的string
            temp: {
                selectServiceList: [],
                selectServiceNameList: [],
                selectServiceIdList: [],
                selectServiceNameString: ""
            }
        };

        model.cardTypeSelected = model.cardTypeList[0];
        initData(model, callback);
    }

    function initData(model, callback) {
        async.waterfall([transferModel, initServiceList, initCateServiceList, initCateList, cateMemberCount], function (error, model) {
            if (error) {
                utils.log("m-setting member.js initData", error);
            }
            callback(model)
        });

        //将Model往下传
        function transferModel(callback) {
            callback(null, model);
        }
    }

    function initServiceList(model, callback) {
        featureDataI.initServiceList(model, function (error, model) {
            if (error) {
                utils.log("m-setting member.js initServiceList.featureDataI.initServiceList", error);
            }
            callback(null, model);
        });
    }

    //初始化记次卡关联的服务项数据
    function initCateServiceList(model, callback) {
        featureDataI.initCateServiceList(model, function (error, model) {
            if (error) {
                utils.log("m-setting member.js initServiceList.featureDataI.initCateServiceList", error);
            }
            callback(null, model);
        });
    }


    //初始化卡类型列表
    function initCateList(model, callback) {
        featureDataI.initCateList(model, function (error, model) {
            if (error) {
                utils.log("m-setting member.js initServiceList.featureDataI.initCateList", error);
                return;
            }
            _.each(model.recordTimeCateList, function (item) {
                item.selectServiceNameString = model.cateServiceNameMap[item.id] ? model.cateServiceNameMap[item.id].join("，") : "";//某记次卡下没有服务
            });
            callback(null, model);
        });
    }

    //统计不同类型下的会员数
    function cateMemberCount(model, callback) {
        featureDataI.cateMemberCount(model, function (error, model) {
            if (error) {
                utils.log("m-setting member.js initServiceList.featureDataI.cateMemberCount", error);
            }
            callback(null, model);
        });
    }


    function initContoller($scope, $parse, $q, $http) {
        moduleScope = $scope;

        $scope.digestScope = function () {
            try {
                $scope.$digest();
            }
            catch (error) {
                console.log(error);
            }
        };

        $scope.newMemberCate = function () {
            $scope.selValidIndex = 0;
            emptySelectService();
            emptyMemberType();
            $scope.cardTypeSelected = $scope.cardTypeList[0];//默认选中充值卡
            $scope.action = "新增";
            $scope.pageIndex = "newMemberType";
            $(".error-hint").hide();
            utils.showSoftKeyboard("#m-setting-memberType-add-name", 500);
        };

        //清空服务项目选择
        function emptySelectService() {
            $scope.temp.selectServiceList = [];
            $scope.temp.selectServiceNameList = [];
            $scope.temp.selectServiceIdList = [];
            $scope.temp.selectServiceNameString = "";

            $scope.selectServiceList = [];
            $scope.selectServiceNameList = [];
            $scope.selectServiceIdList = [];
            $scope.selectServiceNameString = "";
        }

        //清空$scope.memberType
        function emptyMemberType() {
            $scope.memberType = {};
            $scope.memberType.id = "";
            $scope.memberType.name = "";
            $scope.memberType.discounts_serviceDiscount = "";
            $scope.memberType.baseInfo_minMoney = "";
            $scope.memberType.cardNoGenRule_cardNoPrefix = "";
            $scope.memberType.cardNoGenRule_cardNoLen = 5;
        }

        //区分新增修改记次卡和充值卡
        $scope.switchSaveCateType = function () {
            if ($scope.cardTypeSelected === $scope.cardTypeList[0]) {
                saveRechargeType();
            }
            else {
                saveRecordCate();
            }
        };

        function checkRecordCateName() {
            var flag;
            var nameErr = $("#new-count-name-error").hide();
            flag = utils.checkStrMinLen($scope.memberType.name, 1);
            if (!flag) {
                nameErr.show();
            }
            return flag;
        }

        function checkServiceSelect() {
            var flag = true;
            var serviceErr = $("#new-count-serviceList-error").hide();
            if (!$scope.memberType.selectServiceList || $scope.memberType.selectServiceList.length === 0) {
                flag = false;
                serviceErr.show();
            }
            return flag;
        }

        function checkMoneyAndCount() {
            var flag;
            var MCErr = $("#new-count-minMoney-error").hide();
            //开卡金额与次数
            flag = utils.checkNum($scope.memberType.baseInfo_minMoney, 0, 1000000) && utils.checkNum($scope.memberType.discounts_serviceDiscount, 1, 1000000);
            if (!flag) {
                MCErr.show();
            }
            return flag;
        }

        //校验充值卡的输入
        function checkRecordInput() {
            var nameCheck = checkRecordCateName();
            var serviceCheck = checkServiceSelect();
            var moneyCountCheck = checkMoneyAndCount();
            return nameCheck && serviceCheck && moneyCountCheck;
        }

        //保存记次卡
        function saveRecordCate() {
            if (!checkRecordInput()) {
                return;
            }
            if ($scope.memberType.id !== "") {
                updateCardCate();
            }
            else {
                newCardCate();
            }

            //更新
            function updateCardCate() {
                var cardCate = {}, cateService = {}, serviceList = [];
                var updateTime = new Date().getTime();
                cardCate.id = $scope.memberType.id;
                cardCate.modify_date = new Date().getTime();
                cardCate.cardValid = $scope.validList[$scope.selValidIndex].value;
                cardCate.name = $scope.memberType.name;
                cardCate.discounts_serviceDiscount = $scope.memberType.discounts_serviceDiscount;
                cardCate.baseInfo_minMoney = $scope.memberType.baseInfo_minMoney;
                cardCate.cardNoGenRule_cardNoLen = $scope.memberType.cardNoGenRule_cardNoLen;
                cardCate.cardNoGenRule_cardNoPrefix = $scope.memberType.cardNoGenRule_cardNoPrefix;

                _.each($scope.memberType.selectServiceList, function (item) {
                    cateService.cardCateId = cardCate.id;
                    cateService.cardCateName = cardCate.name;
                    cateService.serviceId = item.id;
                    cateService.serviceName = item.name;
                    cateService.create_date = updateTime;
                    cateService.enterprise_Id = YILOS.ENTERPRISEID;
                    serviceList.push(_.clone(cateService));
                });
                featureDataI.updateRecordCate(cardCate, serviceList, function (error) {
                    if (error) {
                        utils.showAreaFailMsg("#m-setting-addInput", "修改失败");
                        utils.log("m-setting member.js saveRecordCate.updateCardCate.featureDataI.updateRecordCate", error);
                        return;
                    }
                    database.updateBackupFlag(updateTime, YILOS_NAIL_MODULE.MEMBER, null);
                    _.each($scope.recordTimeCateList, function (item, index) {
                        if (item.id === cardCate.id) {
                            $scope.memberType.cardValid = cardCate.cardValid;
                            $scope.recordTimeCateList.splice(index, 1, _.extend(cardCate, $scope.memberType));
                        }
                    });
                    $scope.cateServiceIdMap[cardCate.id] = [];
                    _.each($scope.selectServiceList, function (item) {
                        $scope.cateServiceIdMap[cardCate.id].push(item.id);
                    });
                    utils.showAreaSuccessMsg("#m-setting-addInput", "修改成功");
                    global.eventEmitter.emitEvent("m-setting.member.change", [cardCate.id]);
                    setTimeout(function () {
                        $scope.backIndex();
                        try {
                            $scope.$digest();
                        }
                        catch (error) {
                            console.log(error);
                        }
                    }, 2000);
                });
            }

            //新增
            function newCardCate() {
                var createDate = new Date().getTime();
                var cardCate = {}, serviceList = [], cateService = {};
                cardCate.enterprise_id = YILOS.ENTERPRISEID;
                cardCate.create_date = createDate;
                cardCate.cardValid = $scope.validList[$scope.selValidIndex].value;
                cardCate.name = $scope.memberType.name;
                cardCate.discounts_serviceDiscount = $scope.memberType.discounts_serviceDiscount;
                cardCate.baseInfo_minMoney = $scope.memberType.baseInfo_minMoney;
                cardCate.cardNoGenRule_cardNoLen = $scope.memberType.cardNoGenRule_cardNoLen;
                cardCate.cardNoGenRule_cardNoPrefix = $scope.memberType.cardNoGenRule_cardNoPrefix;
                cardCate.baseInfo_type = "recordTimeCard";//用于标志记次卡

                _.each($scope.memberType.selectServiceList, function (item) {
                    cateService.cardCateName = cardCate.name;
                    cateService.serviceId = item.id;
                    cateService.serviceName = item.name;
                    cateService.create_date = createDate;
                    cateService.enterprise_Id = YILOS.ENTERPRISEID;
                    serviceList.push(_.clone(cateService));
                });

                featureDataI.newRecordCate(cardCate, serviceList, function (error) {
                    if (error) {
                        utils.showAreaFailMsg("#m-setting-addInput", "新增失败");
                        utils.log("m-setting member.js saveRecordCate.newCardCate.featureDataI.newRecordCate", error);
                        return;
                    }
                    database.updateBackupFlag(createDate, YILOS_NAIL_MODULE.MEMBER, null);
                    utils.showAreaSuccessMsg("#m-setting-addInput", "新增成功");
                    global.eventEmitter.emitEvent("m-setting.member.change");
                    //界面上的服务项目显示
                    cardCate.selectServiceNameString = $scope.memberType.selectServiceNameString;
                    //保持修改类型时服务项目选择正确性
                    $scope.cateServiceIdMap[cardCate.id] = [];
                    _.each($scope.selectServiceList, function (item) {
                        $scope.cateServiceIdMap[cardCate.id].push(item.id);
                    });
                    $scope.recordTimeCateList.push(cardCate);
                    setTimeout(function () {
                        $scope.backIndex();
                        try {
                            $scope.$digest();
                        }
                        catch (error) {
                            console.log(error);
                        }
                    }, 2000);
                });
            }
        }

        //保存充值卡
        function saveRechargeType() {
            if (!checkInput()) {
                return;
            }
            if ($scope.memberType.id !== "") {
                updateCardCate();
            }
            else {
                newCardCate();
            }

            //修改卡类型
            function updateCardCate() {
                var updateTime = new Date().getTime();
                var cardCate = {};
                cardCate.id = $scope.memberType.id;
                cardCate.modify_date = updateTime;
                cardCate.cardValid = $scope.validList[$scope.selValidIndex].value;
                cardCate.name = $scope.memberType.name;
                cardCate.discounts_serviceDiscount = $scope.memberType.discounts_serviceDiscount;
                cardCate.baseInfo_minMoney = $scope.memberType.baseInfo_minMoney;
                cardCate.cardNoGenRule_cardNoPrefix = $scope.memberType.cardNoGenRule_cardNoPrefix;
                cardCate.cardNoGenRule_cardNoLen = $scope.memberType.cardNoGenRule_cardNoLen;
                featureDataI.updateRechargeCate(cardCate, function (error, rowsAffected) {
                    if (error) {
                        utils.showAreaFailMsg("#m-setting-addInput", "修改失败");
                        utils.log("m-setting member.js saveRechargeType.updateCardCate。featureDataI.updateRechargeCate", error);
                        return;
                    }
                    database.updateBackupFlag(updateTime, YILOS_NAIL_MODULE.MEMBER, null);
                    _.each($scope.memberTypeList, function (item, index) {
                        if (item.id === $scope.memberType.id) {
                            $scope.memberTypeList.splice(index, 1, _.clone($scope.memberType));
                        }
                    });
                    utils.showAreaSuccessMsg("#m-setting-addInput", "修改成功");
                    global.eventEmitter.emitEvent("m-setting.member.change", [$scope.memberType.id]);
                    setTimeout(function () {
                        $scope.backIndex();
                        try {
                            $scope.$digest();
                        }
                        catch (error) {
                            console.log(error);
                        }
                    }, 2000);
                });
            }

            //新增卡类型
            function newCardCate() {
                var createDate = new Date().getTime();
                var cardCate = {};
                cardCate.create_date = createDate;
                cardCate.cardValid = $scope.validList[$scope.selValidIndex].value;
                cardCate.enterprise_id = YILOS.ENTERPRISEID;
                cardCate.name = $scope.memberType.name;
                cardCate.discounts_serviceDiscount = $scope.memberType.discounts_serviceDiscount;
                cardCate.baseInfo_minMoney = $scope.memberType.baseInfo_minMoney;
                cardCate.cardNoGenRule_cardNoPrefix = $scope.memberType.cardNoGenRule_cardNoPrefix;
                cardCate.cardNoGenRule_cardNoLen = $scope.memberType.cardNoGenRule_cardNoLen;

                featureDataI.newRechargeCate(cardCate, function (error) {
                    if (error) {
                        utils.showAreaFailMsg("#m-setting-addInput", "新增失败");
                        utils.log("m-setting member.js saveRechargeType.newCardCate", error);
                        return;
                    }
                    database.updateBackupFlag(createDate, YILOS_NAIL_MODULE.MEMBER, null);
                    //在featureDataI.newRechargeCate中为cardCate生成了id、callback回来后cardCate中有id字段
                    $scope.memberTypeList.push(_.clone(cardCate));
                    emptyMemberType();
                    utils.showAreaSuccessMsg("#m-setting-addInput", "新增成功");
                    global.eventEmitter.emitEvent("m-setting.member.change");
                    setTimeout(function () {
                        $(".error-hint").hide();
                    }, 500);
                    setTimeout(function () {
                        $scope.backIndex();
                        try {
                            $scope.$digest();
                        }
                        catch (error) {
                            console.log(error);
                        }
                    }, 2000);
                });
            }
        }

        //判断会员类型是否可以修改、当该记次卡类型下没有会员时才能修改会员类型信息
        $scope.isEditAble = function (memberCate) {
            if (memberCate.baseInfo_type === "recordTimeCard") {
                featureDataI.isCateHaveMember(memberCate.id, function (error, have) {
                    if (error) {
                        utils.log("m-setting member.js isEditAble.featureDataI.isCateHaveMember", error);
                        utils.showGlobalMsg("系统错误，请稍后再试");
                        return;
                    }
                    if (have) {
                        utils.showGlobalMsg("记次卡尚有会员不能修改");
                    }
                    else {
                        updateMemberCate(memberCate);
                    }
                });
            }
            else {
                updateMemberCate(memberCate);
            }


            function updateMemberCate(memberCate) {
                if (memberCate.baseInfo_type === "recordTimeCard") {
                    $scope.cardTypeSelected = $scope.cardTypeList[1];//记次卡
                    emptySelectService();
                    //保持修改时服务项的选中
                    $scope.selectServiceIdList = $scope.cateServiceIdMap[memberCate.id];
                    _.each($scope.selectServiceIdList, function (item) {
                        $scope.selectServiceList.push($scope.serviceList[item]);
                        $scope.selectServiceNameList.push($scope.serviceList[item].name);
                    });
                    $scope.selectServiceNameString = $scope.selectServiceNameList.join(",");
                    memberCate.selectServiceList = $scope.selectServiceList;
                    utils.showSoftKeyboard("#m-setting-countType-name", 500);
                }
                else {
                    $scope.cardTypeSelected = $scope.cardTypeList[0];
                    utils.showSoftKeyboard("#m-setting-memberType-add-name", 500);
                }
                $scope.memberType = _.clone(memberCate);
                //保持有效期选中
                _.each($scope.validList, function (item, index) {
                    if (item.value === $scope.memberType.cardValid) {
                        $scope.selValidIndex = index;
                    }
                });
                $scope.action = "修改";
                $scope.pageIndex = "editMemberType";
                $(".error-hint").hide();
            }
        };


        $scope.showDelCateDia = function (cardCate) {
            $scope.deleteCate = cardCate;
            $.fancybox.open({href: "#m-setting-memberCard-delete" },
                {
                    openEffect: 'none',
                    closeEffect: 'none',
                    padding: 0,
                    margin: 0,
                    minHeight: 50,
                    closeBtn: false,
                    closeClick: false,
                    autoSize: false,
                    autoHeight: true,
                    autoWidth: true,
                    fitToView: true,
                    helpers: {
                        overlay: {
                            closeClick: false
                        }
                    }
                }
            );
        };

        $scope.deleteItemConfirm = function () {
            featureDataI.isCateHaveMember($scope.deleteCate.id, function (error, have) {
                if (error) {
                    utils.showAreaFailMsg("#m-setting-memberCard-delete", "删除失败");
                    utils.log("m-setting member.js deleteItem.featureDataI.isCateHaveMember", error);
                    return;
                }
                if (have) {
                    utils.showAreaFailMsg("#m-setting-memberCard-delete", "该类型尚有会员不能删除");
                }
                else {
                    deleteCate(function (error) {
                        if (error) {
                            utils.showAreaFailMsg("#m-setting-memberCard-delete", "删除失败");
                            utils.log("m-setting member.js deleteItemConfirm.deleteCate", error);
                            return;
                        }
                        database.updateBackupFlag(new Date().getTime(), YILOS_NAIL_MODULE.MEMBER, null);
                        _.each($scope.memberTypeList, function (item, index) {
                            if (item.id === $scope.deleteCate.id) {
                                $scope.memberTypeList.splice(index, 1);
                            }
                        });
                        _.each($scope.recordTimeCateList, function (item, index) {
                            if (item.id === $scope.deleteCate.id) {
                                $scope.recordTimeCateList.splice(index, 1);
                            }
                        });
                        $scope.deleteCate = {};
                        utils.showAreaSuccessMsg("#m-setting-memberCard-delete", "删除成功");
                        global.eventEmitter.emitEvent("m-setting.member.change");
                        setTimeout(function () {
                            $scope.modalDialogClose();
                            try {
                                $scope.$digest();
                            }
                            catch (error) {
                                console.log(error);
                            }
                        }, 2000);
                    });
                }
            });

            function deleteCate(callback) {
                if ($scope.deleteCate.baseInfo_type === "recordTimeCard") {
                    featureDataI.deleteRecordCate($scope.deleteCate, callback);
                }
                else {
                    featureDataI.deleteRechargeCate($scope.deleteCate, callback);
                }
            }
        };

        $scope.backIndex = function () {
            $scope.pageIndex = "memberTypeList";
        };

        $scope.modalDialogClose = function () {
            $.fancybox.close();
        };

        $scope.closeCateSelDia = function () {
            $.fancybox.close();
            checkServiceSelect();
        };

        $scope.checkName = function () {
            var flag = true;
            var nameErr = $(".error-hint-one").hide();
            if ($scope.memberType.name) {
                $scope.memberType.name = $scope.memberType.name.toString().replace(/^\s+|\s+$/g, '');
                if ($scope.memberType.name.length > 12 || $scope.memberType.name.length < 1) {
                    flag = false;
                    nameErr.show();
                }
            }
            else {
                flag = false;
                nameErr.show();
            }
            return flag;
        };

        $scope.checkMinMoney = function () {
            var flag = true;
            var minMoneyErr = $("#error-minMoney").hide();
            if ($scope.memberType.baseInfo_minMoney) {
                if ($scope.memberType.baseInfo_minMoney < 0 || $scope.memberType.baseInfo_minMoney > 1000000) {
                    flag = false;
                    minMoneyErr.show();
                }
            }
            else {
                $scope.memberType.baseInfo_minMoney = 0;
            }
            return flag;
        };

        $scope.checkDiscount = function () {
            var flag = true;
            var disErr = $(".error-hint-two").hide();
            if ($scope.memberType.discounts_serviceDiscount) {
                if ($scope.memberType.discounts_serviceDiscount <= 0 || $scope.memberType.discounts_serviceDiscount > 10) {
                    flag = false;
                    disErr.show();
                }
            }
            else {
                flag = false;
                disErr.show();
            }
            return flag;
        };

        $scope.checkCardFix = function () {
            var flag = true;
            var cardPreErr = $("#error-cardPrefix").hide();
            if ($scope.memberType.cardNoGenRule_cardNoPrefix) {
                $scope.memberType.cardNoGenRule_cardNoPrefix = $scope.memberType.cardNoGenRule_cardNoPrefix.toString().replace(/^\s+|\s+$/g, '');
                if ($scope.memberType.cardNoGenRule_cardNoPrefix.length > 6 || $scope.memberType.cardNoGenRule_cardNoPrefix.length < 1) {
                    flag = false;
                    cardPreErr.show();
                }
            }
            return flag;
        };


        //输入验证
        function checkInput() {
            var flag;
            var nameCheckResult = $scope.checkName();
            var minMoneyCheckResult = $scope.checkMinMoney();
            var disCheckResult = $scope.checkDiscount();
            var cardFixCheckResult = $scope.checkCardFix();
            flag = (nameCheckResult && minMoneyCheckResult && disCheckResult && cardFixCheckResult);
            return flag;
        }

        $scope.selectValid = function (index) {
            $scope.selValidIndex = index;
        };

        $scope.transValidToName = function (value) {
            var result = "";
            _.each($scope.validList, function (item) {
                if (item.value == value) {
                    result = item.name;
                }
            });
            return result;
        };

        //切换记次卡、充值卡
        $scope.selectCardType = function (cardType) {
            $scope.cardTypeSelected = cardType;
        };

        //服务项目选择弹出框
        $scope.showSelectCateService = function () {
            if (window.LosNailActivity) {
                window.LosNailActivity.closeSoftKeyboard();
            }
            if (moduleScope.serviceNeedReload) {
                moduleScope.serviceNeedReload = false;
                featureDataI.reInitServiceList(moduleScope, function () {
                    initServiceDialog();
                    try {
                        moduleScope.$digest();
                    }
                    catch (error) {
                        console.log(error);
                    }
                });
            }
            else {
                initServiceDialog();
            }

            function initServiceDialog() {
                $.fancybox.open({href: "#newCountCate-selectService-dialog"},
                    {
                        openEffect: "none",
                        closeEffect: "none",
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
                var proCateTemp = _.pairs($scope.serviceCateMap);
                if (proCateTemp.length !== 0) {
                    $scope.serviceCateSelected = proCateTemp[0][0];
                    $scope.serviceViewArray = $scope.serviceCateMap[$scope.serviceCateSelected];
                }
                else {
                    $scope.serviceCateSelected = "all";
                    $scope.serviceViewArray = {};
                }
                $scope.temp.selectServiceList = _.clone($scope.selectServiceList);
                $scope.temp.selectServiceNameList = _.clone($scope.selectServiceNameList);
                $scope.temp.selectServiceIdList = _.clone($scope.selectServiceIdList);
                $scope.temp.selectServiceNameString = _.clone($scope.selectServiceNameString);
            }
        };

        //选择服务项
        $scope.selectCateService = function (service) {
            //是否已选择、已选择则去除
            var serviceExist = _.find($scope.temp.selectServiceList, function (item) {
                return item.id === service.id;
            });

            if (_.isEmpty(serviceExist)) {
                //记次卡选取服务项时只能选取一个服务项
                $scope.temp.selectServiceList = [service];
                $scope.temp.selectServiceNameList = [service.name];
                $scope.temp.selectServiceIdList = [service.id];
//                $scope.temp.selectServiceList.push(service);
//                $scope.temp.selectServiceNameList.push(service.name);
//                $scope.temp.selectServiceIdList.push(service.id);
            }
            else {
                _.each($scope.temp.selectServiceList, function (item, index) {
                    if (item.id === service.id) {
                        $scope.temp.selectServiceList.splice(index, 1);
                        $scope.temp.selectServiceNameList.splice(index, 1);
                        $scope.temp.selectServiceIdList.splice(index, 1);
                    }
                });
            }
            $scope.temp.selectServiceNameString = $scope.temp.selectServiceNameList.join("，");
        };

        //选择服务项确认
        $scope.selectCateServiceCommit = function () {
            $scope.selectServiceList = _.clone($scope.temp.selectServiceList);
            $scope.selectServiceNameList = _.clone($scope.temp.selectServiceNameList);
            $scope.selectServiceIdList = _.clone($scope.temp.selectServiceIdList);
            $scope.selectServiceNameString = _.clone($scope.temp.selectServiceNameString);

            $scope.memberType.selectServiceList = $scope.selectServiceList;
            $scope.memberType.selectServiceNameString = $scope.selectServiceNameString;
            $scope.closeCateSelDia();
        };

        $scope.choiceCate = function (cate, key) {
            $scope.serviceViewArray = cate;
            $scope.serviceCateSelected = key;
        };

        $scope.choiceAllCate = function () {
            $scope.serviceViewArray = $scope.serviceList;
            $scope.serviceCateSelected = "all";
        };
        $scope.showChargeCard = function() {
            $scope.pageIndex = "memberTypeList";
            $scope.selectedStyle = "memberTypeList";
        }
        $scope.showRecordCard = function() {
            $scope.pageIndex = "memberRecordTime";
            $scope.selectedStyle = "memberRecordTime";
        }

    }

    function init() {

    }


    function afterPageLoaded() {
        $("#m-setting-typeList").height($(window).height() - $(".m-setting-title").outerHeight() - 10);
        $("#m-setting-recordTime").height($(window).height() - $(".m-setting-title").outerHeight() - 10);

        //服务或者服务类别发生改变
        global.eventEmitter.addListener("setting.service.service.change", function () {
            moduleScope.serviceNeedReload = true;
        });
        global.eventEmitter.addListener("setting.service.servicecate.change", function () {
            moduleScope.serviceNeedReload = true;
        });

        //新增会员
        global.eventEmitter.addListener("member.member.change", function () {
            moduleScope.needCoutMems = true;
        });
    }

    function switchMenu(params) {
        if (moduleScope.needCoutMems) {
            moduleScope.needCoutMems = false;
            //重新统计类型会员数
            cateMemberCount(moduleScope, function () {
                moduleScope.digestScope();
            });
        }
    }

    function paramsChange(params) {

    }
});
