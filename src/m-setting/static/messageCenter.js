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
    exports.fullscreen = true;
    require("./setting.css");

    var utils = require("mframework/package").utils, 			//全局公共函数
        database = require("mframework/package").database,		//数据操作服务
        dataUtils = require("mframework/package").dataUtils,		//数据操作服务
        dbInstance = null;		                                        //数据操作服务


    var moduleScope;

    function loadModelAsync(params, callback) {
        dbInstance = database.getDBInstance();
        var model = {};
        model.condition = {};

        model.temp = {};

        //最近消费或者未消费时间
        model.consumeTimeType = "consumed";
        model.consumeInterval = 30;

        //累计消费金额上下限
        model.accumulativeCostCaps = "";
        model.accumulativeCostOffline = "";

        //卡余额上下限
        model.cardBalanceCaps = "";
        model.cardBalanceOffline = "";

        //开卡日期上下限
        model.newCardDateCaps = "";
        model.newCardDateOffline = "";

        //查询结果
        model.memberList = [];
        model.selfAddMemberList = [];

        //手工添加
        model.addPhoneNumber = "";

        model.msgSwitch = {};

        model.action = "messageCenter";
        model.actionMes = "clientService";
        model.selectedStyle = "clientService";

        model.templateCount = null;
        //   model.action = "dimensional";
        initData(model, callback);
    }


    //初始化数据
    function initData(model, callback) {
        async.waterfall([transferModel, initCardCate, initStoreInfo, initMsgSwitch], function (error) {
            if (error) {
                utils.log("m-setting messageCenter.js", error);
            }
            setCondition(model);
            callback(model);
        });

        //将Model往下传
        function transferModel(callback) {
            callback(null, model);
        }
    }

    function setCondition(model) {
        //卡类型
        model.condition.cardCate = "cateNoLimit";

        //办卡日期
        model.dateSelList = getDateSelList();
        model.condition.newCardDate = model.dateSelList[0].index;
        model.newCardDateOffline = "";
        model.newCardDateCaps = "";

        //卡余额
        model.moneySelList = getMoneySelList();
        model.condition.cardBalance = model.moneySelList[0].index;
        model.cardBalanceOffline = "";
        model.cardBalanceCaps = "";

        //累计消费
        model.condition.consume = model.moneySelList[0].index;
        model.consumeOffline = "";
        model.consumeCaps = "";

        //最近消费
        model.condition.recently = model.dateSelList[0].index;
        model.recentlyOffline = "";
        model.recentlyCaps = "";

        //最近未消费
        model.condition.noConsume = model.dateSelList[0].index;
        model.noConsumeOffline = "";
        model.noConsumeCaps = "";
    }

    function getDateSelList() {
        var now = new Date();
        var oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).getTime();
        var threeMonthAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()).getTime();
        var sixMonthAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()).getTime();
        var oneYearAgo = new Date(now.getFullYear(), now.getMonth() - 12, now.getDate()).getTime();
        var nowMill = now.getTime();

        return [
            {value: {startDate: 0, endDate: nowMill}, name: "不限", index: "0"},
            {value: {startDate: oneMonthAgo, endDate: nowMill}, name: "一个月内", index: "1"},
            {value: {startDate: threeMonthAgo, endDate: nowMill}, name: "三个月内", index: "2"},
            {value: {startDate: sixMonthAgo, endDate: nowMill}, name: "半年内", index: "3"},
            {value: {startDate: oneYearAgo, endDate: nowMill}, name: "一年内", index: "4"}
        ];
    }

    function getMoneySelList() {
        return [
            {value: {minMoney: 0, maxMoney: 1000000}, name: "不限", index: "0"},
            {value: {minMoney: 0, maxMoney: 499}, name: "0-499", index: "1"},
            {value: {minMoney: 500, maxMoney: 999}, name: "500-999", index: "2"},
            {value: {minMoney: 1000, maxMoney: 1999}, name: "1000-1999", index: "3"},
            {value: {minMoney: 2000, maxMoney: 1000000}, name: "2000以上", index: "4"}
        ];
    }

    function initCardCate(model, callback) {
        model.cardCateList = [];
        var selCardCate = "select id,name from tb_memberCardCategory;";
        dbInstance.execQuery(selCardCate, [], function (result) {
            for (var i = 0, len = result.rows.length; i < len; i++) {
                model.cardCateList.push(result.rows.item(i));
            }
            callback(null, model);
        }, function (error) {
            callback(error);
        });
    }

    function initStoreInfo(model, callback) {
        utils.getStoreInfo(function (error, storeInfo) {
            if (error) {
                utils.log("m-setting messageCenter.js initStoreInfo.utils.getStoreInfo", error);
                callback(error);
                return;
            }
            model.storeInfo = storeInfo;
            callback(null, model);
        });
    }

    //初始化短信开关状态
    function initMsgSwitch(model, callback) {
        model.msgSwitch = {};
        utils.getMsgSwitch(function (error, msgSwitch) {
            if (error) {
                utils.log("m-setting messageCenter.js initMsgSwitch.utils.getMsgSwitch", error);
                callback(error);
                return;
            }
            //使用clone、显示使用utils.setMsgSwitch()改变其他模块用到的值
            model.msgSwitch = _.clone(msgSwitch);
            callback(null, model);
        });
    }

    function initContoller($scope, $parse, $q, $http) {
        moduleScope = $scope;

        $scope.msgCount = function () {
            queryMsgUsedCountAsync(function (error, template) {
                if (error) {
                    $scope.templateCount = null;
                    return;
                }
                $scope.templateCount = {};
                $scope.templateCount["template_4"] = template["template_4"].count;
                $scope.templateCount["template_5"] = template["template_5"].count;
                $scope.templateCount["template_6"] = template["template_6"].count;
                $scope.templateCount["template_7"] = template["template_7"].count;
                $scope.templateCount["template_8"] = template["template_8"].count;
                $scope.digestScope();
            });
        };
        $scope.msgCount();

        //异步查询短信发送条数
        function queryMsgUsedCountAsync(callback) {
            var url = global["_g_server"].serviceurl + "/sms/smsTemplate/" + YILOS.ENTERPRISEID;
            $.ajax({
                type: "get",
                async: true,
                url: url,
                success: function (data) {
                    if (data.code == 0) {
                        callback(null, data.result.template);
                    }
                    else {
                        callback("查询失败");
                    }
                },
                error: function (error) {
                    callback(error);
                }
            });
        }

        if (!YILOS.msgSwitch) {
            YILOS.msgSwitch = $scope.msgSwitch;//为全局短信开关赋值
        }

        $scope.digestScope = function () {
            try {
                $scope.$digest();
            }
            catch (error) {
                console.log(error);
            }
        };

        $scope.selectCardCate = function (item) {
            if ($scope.condition.cardCate === "cateNoLimit") {
                $scope.condition.cardCate = [];
            }

            var index = $scope.condition.cardCate.indexOf(item);
            if (index === -1) {
                $scope.condition.cardCate.push(item);
            }
            else {
                $scope.condition.cardCate.splice(index, 1);
            }

            if ($scope.condition.cardCate.length === 0) {
                $scope.condition.cardCate = "cateNoLimit";
            }
        };

        $scope.newCardInputCommit = function () {
            if ($scope.condition.newCardDate === "custom") {
                searchMember();
            }
            $scope.condition.newCardDate = "custom";
        };

        $scope.cardBalanceInputCommit = function () {
            if ($scope.condition.cardBalance === "custom") {
                searchMember();
            }
            $scope.condition.cardBalance = "custom";
        };

        $scope.consumeInputCommit = function () {
            if ($scope.condition.consume === "custom") {
                searchMember();
            }
            $scope.condition.consume = "custom";
        };

        $scope.recentlyInputCommit = function () {
            if ($scope.condition.recently === "custom") {
                searchMember();
            }
            $scope.condition.recently = "custom";
        };

        $scope.noConsumeInputCommit = function () {
            if ($scope.condition.noConsume === "custom") {
                searchMember();
            }
            $scope.condition.noConsume = "custom";
        };

        $scope.$watch("condition", function () {
            searchMember();
        }, true);

        $scope.showMessageCenter = function () {
            $scope.actionMes = "clientService";
            $scope.selectedStyle = "clientService";
        };

        $scope.showMesAd = function () {
            $scope.actionMes = "mesAd";
            $scope.selectedStyle = "mesAd";
        };


        function searchMember() {
            var memberList = [];
            var sqlCondition = makeCondition();
            dbInstance.execQuery(sqlCondition.statement, sqlCondition.value, function (result) {
                for (var i = 0, len = result.rows.length; i < len; i++) {
                    memberList.push(result.rows.item(i));
                }
                $scope.memberList = memberList;
            }, function (error) {
                utils.log("m-setting messageCenter.js searchMember", error);
            });
        }

        //构造查询条件
        function makeCondition() {
            var statement = "select a.id,a.name,a.phoneMobile from tb_member a,tb_memberCard b"
                + " where b.memberId = a.id"
                + " and (b.create_date between ? and ?)"
                + " and (b.currentMoney between ? and ?)"
                + " and (b.totalConsumption between ? and ?)"
                + " and (b.lastConsumption_date between ? and ?)"
                + " and (b.lastConsumption_date not between ? and ?)";
            var value = [];

            newCardC();
            cardBalanceC();
            consumeC();
            recentlyC();
            noConsumeC();
            cardCateC();

            return {statement: statement, value: value };

            function newCardC() {
                if ($scope.condition.newCardDate === "custom") {
                    if ($scope.newCardDateOffline) {
                        value.push(new Date($scope.newCardDateOffline).getTime());
                    }
                    else {
                        value.push(0);
                    }

                    if ($scope.newCardDateCaps) {
                        value.push(new Date($scope.newCardDateCaps).getTime());
                    }
                    else {
                        value.push(new Date().getTime());
                    }
                }
                else {
                    var index = parseInt($scope.condition.newCardDate);
                    value.push($scope.dateSelList[index].value.startDate);
                    value.push($scope.dateSelList[index].value.endDate);
                }
            }

            function cardBalanceC() {
                if ($scope.condition.cardBalance === "custom") {
                    if ($scope.cardBalanceOffline) {
                        value.push($scope.cardBalanceOffline);
                    }
                    else {
                        value.push(0);
                    }

                    if ($scope.cardBalanceCaps) {
                        value.push($scope.cardBalanceCaps);
                    }
                    else {
                        value.push(1000000);
                    }
                }
                else {
                    var index = parseInt($scope.condition.cardBalance);
                    value.push($scope.moneySelList[index].value.minMoney);
                    value.push($scope.moneySelList[index].value.maxMoney);
                }
            }

            function consumeC() {
                if ($scope.condition.consume === "custom") {
                    if ($scope.consumeOffline) {
                        value.push($scope.consumeOffline);
                    }
                    else {
                        value.push(0);
                    }

                    if ($scope.consumeCaps) {
                        value.push($scope.consumeCaps);
                    }
                    else {
                        value.push(1000000);
                    }
                }
                else {
                    var index = parseInt($scope.condition.consume);
                    value.push($scope.moneySelList[index].value.minMoney);
                    value.push($scope.moneySelList[index].value.maxMoney);
                }
            }

            function recentlyC() {
                if ($scope.condition.recently === "custom") {
                    if ($scope.recentlyOffline) {
                        value.push(new Date($scope.recentlyOffline).getTime());
                    }
                    else {
                        value.push(0);
                    }

                    if ($scope.recentlyCaps) {
                        value.push(new Date($scope.recentlyCaps).getTime());
                    }
                    else {
                        value.push(new Date().getTime());
                    }
                }
                else {
                    var index = parseInt($scope.condition.recently);
                    //不限
                    if (index === 0) {
                        value.push(-1);
                    }
                    else {
                        value.push($scope.dateSelList[index].value.startDate);
                    }
                    value.push($scope.dateSelList[index].value.endDate);
                }
            }

            function noConsumeC() {
                if ($scope.condition.noConsume === "custom") {
                    if ($scope.noConsumeOffline) {
                        value.push(new Date($scope.noConsumeOffline).getTime());
                    }
                    else {
                        value.push(0);
                    }

                    if ($scope.noConsumeCaps) {
                        value.push(new Date($scope.noConsumeCaps).getTime());
                    }
                    else {
                        value.push(new Date().getTime());
                    }
                }
                else {
                    var index = parseInt($scope.condition.noConsume);
                    //不限
                    if (index === 0) {
                        value.push(-1);
                        value.push(-1);//not between -1 and -1
                    }
                    else {
                        value.push($scope.dateSelList[index].value.startDate);
                        value.push($scope.dateSelList[index].value.endDate);
                    }
                }
            }

            function cardCateC() {
                if ($scope.condition.cardCate === "cateNoLimit") {
                    statement += ";";
                }
                else {
                    //根据选择的卡类型拼sql   b.memberCardCategoryId in (?,?,?);
                    var filedCount = $scope.condition.cardCate.length;
                    statement += "and (b.memberCardCategoryId in (";
                    for (var i = 0; i < filedCount; i++) {
                        statement += "?,";
                    }
                    statement = statement.substring(0, statement.length - 1) + "));";

                    _.each($scope.condition.cardCate, function (item) {
                        value.push(item.id);
                    });
                }
            }
        }

        $scope.nextStep = function () {
            if ($scope.memberList.length == 0) {
                utils.showGlobalMsg("请添加短信接收人");
                return;
            }
            $scope.action = "sendMessage";
            $scope.temp.msg = "";
            $scope.temp.msgLast = "[" + $scope.storeInfo.name + "]-发自[乐斯信息]";
            $scope.temp.msgCount = 1;
        };

        $scope.$watch("temp.msg", function (newVal, oldVal) {
            if (($scope.temp.msgLast + newVal).length <= 400) {
                $scope.temp.msgCount = Math.ceil(($scope.temp.msgLast + newVal).toString().length / 70);
            }
            else {
                $scope.temp.msg = oldVal;
            }
        });

        $scope.backIndex = function () {
            $scope.action = "messageCenter";
        };

        $scope.addPhoneBySelf = function () {
            if ($scope.addPhoneNumber) {
                if (!utils.isPhoneNumber($scope.addPhoneNumber)) {
                    utils.showGlobalMsg("手机号码有误");
                    return;
                }
                var memberTemp = {
                    name: "",
                    phoneMobile: $scope.addPhoneNumber
                };
                $scope.memberList.push(memberTemp);
                $scope.selfAddMemberList.push(memberTemp);
                $scope.addPhoneNumber = "";
            }
        };

        //开卡起始日期
        $scope.newCardStart = function () {
            var config = {title: "起始日期"};
            if ($scope.newCardDateOffline) {
                var dateTemp = new Date($scope.newCardDateOffline);
                config.year = dateTemp.getFullYear();
                config.month = dateTemp.getMonth() + 1;
                config.day = dateTemp.getDate();
            }

            showDatePickerDia(config, function (error, date) {
                if (error) {
                    utils.log("m-setting messageCenter.js newCardStart", error);
                    $scope.newCardDateOffline = "";
                    return;
                }
                $scope.newCardDateOffline = date;
                $scope.digestScope();
            });
        };

        //开卡结束日期
        $scope.newCardEnd = function () {
            var config = {title: "结束日期"};
            if ($scope.newCardDateCaps) {
                var dateTemp = new Date($scope.newCardDateCaps);
                config.year = dateTemp.getFullYear();
                config.month = dateTemp.getMonth() + 1;
                config.day = dateTemp.getDate();
            }

            showDatePickerDia(config, function (error, date) {
                if (error) {
                    utils.log("m-setting messageCenter.js newCardEnd", error);
                    $scope.newCardDateCaps = "";
                    return;
                }
                $scope.newCardDateCaps = date;
                $scope.digestScope();
            });
        };

        $scope.recentlyStart = function () {
            var config = {title: "起始日期"};
            if ($scope.recentlyOffline) {
                var dateTemp = new Date($scope.recentlyOffline);
                config.year = dateTemp.getFullYear();
                config.month = dateTemp.getMonth() + 1;
                config.day = dateTemp.getDate();
            }
            showDatePickerDia(config, function (error, date) {
                if (error) {
                    utils.log("m-setting messageCenter.js recentlyStart", error);
                    $scope.recentlyOffline = "";
                    return;
                }
                $scope.recentlyOffline = date;
                $scope.digestScope();
            });
        };

        $scope.recentlyEnd = function () {
            var config = {title: "起始日期"};
            if ($scope.recentlyCaps) {
                var dateTemp = new Date($scope.recentlyCaps);
                config.year = dateTemp.getFullYear();
                config.month = dateTemp.getMonth() + 1;
                config.day = dateTemp.getDate();
            }

            showDatePickerDia(config, function (error, date) {
                if (error) {
                    utils.log("m-setting messageCenter.js recentlyEnd", error);
                    $scope.recentlyCaps = "";
                    return;
                }
                $scope.recentlyCaps = date;
                $scope.digestScope();
            });
        };

        $scope.noConsumeStart = function () {
            var config = {title: "起始日期"};
            if ($scope.noConsumeOffline) {
                var dateTemp = new Date($scope.noConsumeOffline);
                config.year = dateTemp.getFullYear();
                config.month = dateTemp.getMonth() + 1;
                config.day = dateTemp.getDate();
            }
            showDatePickerDia(config, function (error, date) {
                if (error) {
                    utils.log("m-setting messageCenter.js noConsumeStart", error);
                    $scope.noConsumeOffline = "";
                    return;
                }
                $scope.noConsumeOffline = date;
                $scope.digestScope();
            });
        };

        $scope.noConsumeEnd = function () {
            var config = {title: "起始日期"};
            if ($scope.noConsumeCaps) {
                var dateTemp = new Date($scope.noConsumeCaps);
                config.year = dateTemp.getFullYear();
                config.month = dateTemp.getMonth() + 1;
                config.day = dateTemp.getDate();
            }

            showDatePickerDia(config, function (error, date) {
                if (error) {
                    utils.log("m-setting messageCenter.js noConsumeEnd", error);
                    $scope.noConsumeCaps = "";
                    return;
                }
                $scope.noConsumeCaps = date;
                $scope.digestScope();
            });
        };

        function showDatePickerDia(config, callback) {
            if (window.plugins.DatePicker) {
                window.plugins.DatePicker.showDateDia(config, function (result) {
                    callback(null, result.date);
                }, function (error) {
                    callback(error)
                });
            }
            else {
                callback("日期选择插件不存在")
            }
        }

        $scope.delMsgItem = function (msgObject) {
            var i;
            if (msgObject.id) {
                for (i = 0; i < $scope.memberList.length; i++) {
                    if (msgObject.id === $scope.memberList[i].id) {
                        $scope.memberList.splice(i, 1);
                        break;
                    }
                }
            }
            else {
                for (i = 0; i < $scope.memberList.length; i++) {
                    if (msgObject.phoneMobile === $scope.memberList[i].phoneMobile) {
                        $scope.memberList.splice(i, 1);
                        break;
                    }
                }
            }
        };

        $scope.sendSwitch = function () {
//            var memberList = $scope.memberList;
//            var content = $scope.temp.msg;
//            if (memberList.length == 0) {
//                utils.showGlobalMsg("请添加短信接收人");
//                return;
//            }
//            else if ("" == content.replace(/(^\s*)|(\s*$)/g, "")) {
//                utils.showGlobalMsg("请输入短信内容");
//                return;
//            }
            $scope.action = "dimensional";
        };

        $scope.sendSms = function () {
            if ($scope.memberList.length == 0) {
                utils.showGlobalMsg("请添加短信接收人");
                return;
            }
            else if ("" == $scope.temp.msg.replace(/(^\s*)|(\s*$)/g, "")) {
                utils.showGlobalMsg("请输入短信内容");
                return;
            }
            if (window.LosNailActivity) {
                var memberList = $scope.memberList;
                var mobiles = "";
                for (var i = 0; i < memberList.length; i++) {
                    mobiles += memberList[i].phoneMobile + "-";
                }
                mobiles = mobiles.substr(0, mobiles.length - 1);
                var content = $scope.temp.msg;
                window.LosNailActivity.sendSMS(content, mobiles);
            }
        };

        $scope.saveSms2DB = function () {
            var memberList = $scope.memberList;
            var content = $scope.temp.msg;
            if (memberList.length == 0) {
                utils.showGlobalMsg("请添加短信接收人");
                return;
            }
            else if ("" == content.replace(/(^\s*)|(\s*$)/g, "")) {
                utils.showGlobalMsg("请输入短信内容");
                return;
            }
            var mobiles = "";
            for (var i = 0; i < memberList.length; i++) {
                mobiles += memberList[i].phoneMobile + "-";
            }
            //删除最后一个"-"
            mobiles = mobiles.substr(0, mobiles.length - 1);
            $.ajax({
                type: "post",
                async: true,
                url: global["_g_server"].serviceurl + "/nail/saveSmsContent",
                data: {
                    username: YILOS.USERNAME,
                    enterpriseId: YILOS.ENTERPRISEID,
                    mobiles: mobiles,
                    content: content
                },
                dataType: "json",
                success: function (data) {
                    if (data && data.code == "0") {
                        createQRCode(data.result.taskId);
                    }
                },
                error: function (error) {
                    utils.showGlobalMsg("生成二维码失败，请稍后重试");
                    utils.log("m-setting messageCenter.js createQRCode，记录短信异常，错误信息", error);
                }
            });
        };


        function createQRCode(taskId) {
            if (window.LosNailActivity) {
                window.LosNailActivity.createSMSQRCode(taskId);
            }
        }

        $scope.msgStatusSwitch = function (switchName) {
            var updateValue = Math.abs(parseInt($scope.msgSwitch[switchName]) - 1) + "";
            updateSwitchFlag(switchName, updateValue, function (error) {
                if (error) {
                    utils.log("m-setting messageCenter.js msgStatusSwitch.updateSwitchFlag", error);
                    return;
                }
                $scope.msgSwitch[switchName] = updateValue;
                utils.setMsgSwitch($scope.msgSwitch);//开关状态改变
            });
        };


        function updateSwitchFlag(switchName, value, callback) {
            var updateSql = "update sys_config set value = ? where name = ?;";
            dbInstance.transaction(function (trans) {
                trans.executeSql(updateSql, [value, switchName], function (trans, result) {
                    callback(null);
                }, function (trans, error) {
                    callback(error);
                });
            });
        }

        $scope.tipsMsgLimit = function () {
            utils.showGlobalMsg("政策原因，暂时无法发送此类短信")
        };
    }

    function init() {

    }


    function afterPageLoaded() {
        $("#m-setting-messageCenter-area").height($(window).height());
        $("#m-aboutlos-suggestion").height($(window).height());
        $("#m-setting-messageCenter").height($(window).height() - $(".m-setting-title").outerHeight());
    }


    //时间选择、结束时间更新、避免进入短信营销后新增的会员查询不到
    function resetDateList() {
        moduleScope.dateSelList = getDateSelList();
        moduleScope.msgCount();
    }

    function switchMenu(params) {
        resetDateList();
    }

    function paramsChange(params) {
    }
});