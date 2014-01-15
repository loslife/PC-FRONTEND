define(function (require, exports, module) {
    exports.init = init;
    exports.switchMenu = switchMenu;
    exports.paramsChange = paramsChange;
    exports.afterPageLoaded = afterPageLoaded;
    exports.loadModelAsync = loadModelAsync;
    exports.initContoller = initContoller;
    exports.checktimeout = true;

    require("./pos.css");
    var utils = require("mframework/static/package").utils,
        cache = utils.getCache(),
        self = this,
        CONSTANT = {
            memSeaDelay: 200        //会员搜索延迟毫秒数
        };
    var moduleScope;
    var featureDataI = require("./checkout-dataI.js");
    var checkoutCommit = require("./checkoutCommit.js");
    var checkoutPend = require("./checkoutPend.js");

    function loadModelAsync(params, callback) {
        var model = {
            licenseInfo: {expire_day: 0},
            productCategorieMap: {},    //可以选择的产品和服务类别对应的产品服务列表
            productCategories: {},      //类型ID与类型信息的映射
            productViewArray: [],       //界面需要展示的产品列表

            productSelected: {},        //操作当前选中的商品、可进行数量更改、从购买列表中去除等
            buyProductRecords: [],      //购买商品列表

            suspendServiceBillList: [], //挂起服务单信息
            resumeServiceBill: null,    //恢复的挂起单号，恢复挂起单时

            memberList: [],
            memberSelected: {},
            memberSearch: "",

            //金额收入状态
            incomeStatus: {
                totalMoney: 0,         //合计
                discountMoney: 0,      //折扣金额(优惠金额)
                paidMoney: 0,           //应收
                recordTolMoney: 0
            },

            pendBill: {},

            //挂单列表
            pendList: [],
            pendShowList: [],
            pendHiddenList: [],

            //支付方式
            pay: {
                cash: 0,
                prePaidCard: 0
            },

            numKeyboard: {
                key: ["7", "8", "9", "4", "5", "6", "1", "2", "3", "0", ".", "←"],
                keyStack: [],
                value: ""
            },

            employeeList: [],
            employeeSelected: {},

            globalDis: "",//全局折扣信息、在收银时可由收银员调节

            //用于往scope上挂一些临时变量
            temp: {
                discountDisplay: "无",
                flipStatusFront: true //员工选择与键盘翻转的状态
            },
            //记次卡收银上下文
            recordContext: {
            }
        };
        if (YILOS.INITCLEANCACHE == "true") {
            utils.getCache().clearAll();
        }
        initPageData(model, callback);
    }

    //初始化页面数据模型
    function initPageData(model, callback) {
        async.waterfall([transferModel, initServiceData, initEmployeeData, initPendOrder, initCateServiceList, initMsgSwitch, initStoreInfo, initTicketSwitch ], function (error, model) {
//        async.waterfall([transferModel, initServiceData, initEmployeeData, initPendOrder, initCateServiceList, initMsgSwitch, initTicketSwitch ], function (error, model) {
            if (error) {
                utils.log("m-pos checkout.js initPageData", error);
                return;
            }
            callback(model);
        });

        //将Model往下传
        function transferModel(callback) {
            callback(null, model);
        }
    }

    //初始化挂单数据
    function initPendOrder(model, callback) {
        featureDataI.initPendOrderList(model, function (error, model) {
            if (error) {
                utils.log("m-pos checkout.js initPendOrder.featureDataI.initPendOrderList", error);
                callback(error);
                return;
            }
            callback(null, model);
        });
    }

    //初始化员工数据
    function initEmployeeData(model, callback) {
        featureDataI.initEmployeeList(model, function (error, model) {
            if (error) {
                utils.log("m-pos checkout.js initEmployeeData.featureDataI.initEmployeeList", error);
                callback(error);
                return;
            }
            model.employeeSelected = model.employeeList[0];
            callback(null, model);
        });
    }

    //初始化服务数据
    function initServiceData(model, callback) {
        featureDataI.initServiceList(model, function (error, model) {
            if (error) {
                utils.log("m-pos checkout.js initServieData.featureDataI.initServiceList", error);
                callback(error);
                return;
            }
            var proCateTemp = _.pairs(model.productCategorieMap);
            if (proCateTemp.length !== 0) {
                model.productCategorySelected = proCateTemp[0][0];
                model.productViewArray = model.productCategorieMap[model.productCategorySelected];
            }
            else {
                model.productCategorySelected = "all";
                model.productViewArray = {};
            }
            model.needReload = false;
            callback(null, model);
        });
    }

    function initCateServiceList(model, callback) {
        featureDataI.initCateServiceList(model, function (error, model) {
            if (error) {
                utils.log("m-pos checkout.js initCateServiceList.featureDataI.initCateServiceList", error);
                callback(error);
                return;
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
        //保存当前上下文到模块级别，方便非angular代码调用
        moduleScope = $scope;
        checkoutCommit.initScope($scope);
        checkoutPend.initScope($scope);

        if (window.LosNailActivity) {
            var licenseInfo = window.LosNailActivity.getLicenseInfo();
            if (licenseInfo) {
                $scope.licenseInfo = JSON.parse(licenseInfo);
            }
        }

        //刷新Scope、
        $scope.digestScope = function () {
            try {
                $scope.$digest();
            }
            catch (error) {
                console.log(error);
            }
        };

        $scope.modalDialogClose = function () {
            $.fancybox.close();
        };

        //关闭收银窗口
        $scope.closeCheckoutDia = function () {
            $.fancybox.close();
            //记次卡收银中途关闭收银窗口
            if ($scope.temp.isSecondStep) {
                $scope.reInitRecordOrder();
                $scope.temp.isSecondStep = false;
            }
            //结算框关闭时、扣次信息清空
            if (typeof $scope.pay.cardTimes !== "undefined") {
                delete $scope.pay.cardTimes;
            }
        };

        //尝试重新打印
        $scope.reprintCommit = function () {
            checkoutCommit.reprintCommit();
        };

        //放弃重新打印
        $scope.cancelReprint = function () {
            checkoutCommit.cancelReprint();
        };

        $scope.closeMemberSelDia = function () {
            $.fancybox.close();
            if ($scope.temp.isSecondStep) {
                $scope.reInitRecordOrder();
                $scope.temp.isSecondStep = false;
            }
        };

        //记次卡收银
        $scope.reInitRecordOrder = function () {
            $scope.recordContext = {};
            $scope.temp.memberSelected = {};
            $scope.memberSelected = {};
            $scope.selMemberSaveNotCheckout();
        };

        //选择类别
        $scope.choiceCate = function (cate, key, $index) {
            $("#m-pos-checkout-area .pos-product-nav").css("left", $index * 9 + "rem")
            $scope.productViewArray = cate;
            $scope.productCategorySelected = key;
        };

        //选择所有类别
        $scope.choiceAllCate = function () {
            var $index = _.pairs($scope.productCategorieMap).length;
            $("#m-pos-checkout-area .pos-product-nav").css("left", $index * 9 + "rem")
            $scope.productViewArray = $scope.productList;
            $scope.productCategorySelected = "all";
        };

        //选择消费商品
        $scope.selectProduct = function (product, count) {


            //添加至左边消费列表中
            addProductRecord(product, count);
            //底部显示选中的商品项信息
            $scope.selectProductOrder(product.id);
        };

        //选中订单中商品
        $scope.selectProductOrder = function (productId) {
            _.each($scope.buyProductRecords, function (item, index) {
                if (productId === item.id) {
                    $scope.productSelected = item;
                    $scope.productSelected.index = index;
                }
            });
        };

        //对消费商品中选中项进行数量增加
        $scope.addProductOrderNum = function () {
            if (!_.isEmpty($scope.productSelected)) {
                $scope.productSelected.saleNum++;
                $scope.productSelected.money += $scope.productSelected.unitPrice;
                indexCountCost();
            }
        };

        //对消费商品中选中项进行数量减少
        $scope.reduceProductOrderNum = function () {
            if (!_.isEmpty($scope.productSelected)) {
                if ($scope.productSelected.saleNum > 1) {
                    $scope.productSelected.saleNum--;
                    $scope.productSelected.money -= $scope.productSelected.unitPrice;
                    indexCountCost();
                }
            }
        };

        //从消费列表在中移除某商品
        $scope.deleteProductOrderNum = function () {
            if ($scope.buyProductRecords.length > 0) {
                var rowIndex = $scope.productSelected.index;
                $scope.buyProductRecords.splice(rowIndex, 1);
                indexCountCost();
                if ($scope.buyProductRecords.length === 0) {
                    $scope.productSelected = {};
                    return;
                }
                if (rowIndex === $scope.buyProductRecords.length) {
                    $scope.productSelected = $scope.buyProductRecords[rowIndex - 1];
                    $scope.productSelected.index = rowIndex - 1;
                }
                else {
                    $scope.productSelected = $scope.buyProductRecords[rowIndex];
                    $scope.productSelected.index = rowIndex;
                }
            }
        };

        //修改单项产品价格弹出框
        $scope.changeProductPrice = function(productId,price){
            if ($scope.buyProductRecords.length > 0) {
                $scope.temp.changed_price = price;
                $scope.temp.changed_price_productId = productId;
                $scope.numKeyboard.value = "";
                $scope.numKeyboard.keyStack = [];
                $.fancybox.open({href: "#m-pos-change-productprice-popup"},
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
        }

        $scope.changePriceInput = function (key) {
            var keyValueTemp = clickKeyboard(key);
            //以"."开始
            if (keyValueTemp.indexOf(".") === 0) {
                keyValueTemp = "0" + keyValueTemp;
            }
            $scope.temp.changed_price = parseInt(keyValueTemp) ;
            $scope.temp.changed_price_tempMap = $scope.temp.changed_price_tempMap || {};
            $scope.temp.changed_price_tempMap[$scope.temp.changed_price_productId] = $scope.temp.changed_price;
        };

        //修改单项产品价格提交
        $scope.changeProductPriceCommit = function(price){
            var rowIndex = $scope.productSelected.index;
            $scope.buyProductRecords[rowIndex].unitPrice = price;
            $scope.productSelected.unitPrice = price;

            //修改产品列表中的原始价格
            _.each($scope.productList,function(product){
                if(product.id == $scope.productSelected.id){
                    product.prices_salesPrice =   price;
                    return;
                }
            });

            $scope.buyProductRecords[rowIndex].money  = $scope.buyProductRecords[rowIndex].unitPrice * $scope.buyProductRecords[rowIndex].saleNum;
            indexCountCost();
            $scope.temp.changed_price = 0;
            $scope.modalDialogClose();
        }


        //挂单确认
        $scope.showPendingConfirm = function () {
            if ($scope.buyProductRecords.length === 0) {
                utils.showGlobalMsg("未选择商品,不能挂单");
                return;
            }
            $.fancybox.open({href: "#m-pos-checkout-hangup-popup" },
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
        };

        //显示员工选择、
        $scope.showCheckoutSelectEmployee = function () {
            slidfast.ui.flip();//翻牌
            $scope.temp.flipStatusFront = !$scope.temp.flipStatusFront;
        };

        //选取提成员工
        $scope.selectEmployeeCheckout = function (employee) {
            $scope.employeeSelected = employee;
            slidfast.ui.flip();//翻牌
            $scope.temp.flipStatusFront = !$scope.temp.flipStatusFront;
        };

        //获取记次卡的服务项名称
        $scope.getServiceNameStr = function (cateId) {
            var nameArray = $scope.cateServiceNameMap[cateId];
            var nameString = _.isArray(nameArray) ? nameArray.join('，') : "";
            if (nameString.length > 12) {
                nameString = nameString.substring(0, 12) + "...";
            }
            return nameString;
        };

        //挂单
        $scope.pendingOrder = function () {
            checkoutPend.pendingOrder();
        };

        $scope.pendSelectEmployee = function (employee) {
            $scope.employeeSelected = employee;
            $scope.pendingOrder();
        };

        //清空单服务单信息
        $scope.clearOrder = function () {
            $scope.buyProductRecords = [];
            $scope.productSelected = {};
            $scope.employeeSelected = $scope.employeeList[0];
            $scope.incomeStatus = {
                totalMoney: 0,
                discountMoney: 0,
                paidMoney: 0,
                recordTolMoney: 0,
                payTimes: 0
            };
            $scope.memberSelected = {};
            $scope.temp = {
                realPayMoney: 0,
                discountDisplay: "无",
                flipStatusFront: $scope.temp.flipStatusFront
            };
            $scope.pay = {};
            $scope.recordContext = {};
            $scope.globalDis = "";
        };

        //撤销当前单
        $scope.cancelOrder = function () {
            //非挂单清除
            if (_.isEmpty($scope.pendBill)) {
                $scope.clearOrder();
            }
            else {
                featureDataI.deletePend($scope.pendBill.id, function (error) {
                    if (error) {
                        utils.log("m-pos checkout.js cancelOrder.featureDataI.deletePend", error);
                        utils.showGlobalMsg("清除服务单失败，请稍后再试");
                        return;
                    }
                    _.each($scope.pendList, function (item, index) {
                        if (item.id === $scope.pendBill.id) {
                            $scope.pendList.splice(index, 1);
                        }
                    });
                    $scope.pendBill = {};
                    $scope.clearOrder();
                    $scope.countPendShow();
                });
            }
        };

        $scope.getEmpName = function (employeeId) {
            var name = "无";
            var empTemp = _.find($scope.employeeList, function (item) {
                return item.id == employeeId;
            });
            if (empTemp && empTemp.name) {
                name = empTemp.name;
            }
            return name;
        };

        //恢复挂起的单
        $scope.resumePendingOrder = function (pendOrder) {
            checkoutPend.resumeOrder(pendOrder);
        };

        //弹出会员选择框
        $scope.showMemberSel = function () {
            $scope.numKeyboard.value = "";
            $scope.numKeyboard.keyStack = [];
            $.fancybox.open({href: "#m-pos-member-popup" },
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
        };

        //选择会员
        $scope.selectMember = function (member) {
            $scope.temp.memberSelected = member;
        };

        //记次卡消费计算
        function countCostRecord() {
            var cardServiceIdList = $scope.cateServiceIdMap[$scope.memberSelected.cardCateId];

            //undefined
            if (!cardServiceIdList) {
                cardServiceIdList = [];
            }
            var productList = _.clone($scope.buyProductRecords);
            var numOfTimes = 0, timesMax = 0;//消费次数

            var totalMoney = 0;//总金额
            var recordTolMoney = 0;//使用记次卡减少的金额

            //获取记次卡合理消费次数
            _.each(productList, function (item) {
                if (cardServiceIdList.indexOf(item.id) !== -1) {
                    if (numOfTimes === 0 || numOfTimes > item.saleNum) {
                        numOfTimes = item.saleNum;
                        //取其中最大数量的记次项目数量作为扣次最大值
                        if (item.saleNum > timesMax) {
                            timesMax = item.saleNum;
                        }
                    }
                }
                totalMoney += item.money;
            });

            //记次卡次数不足
            if (numOfTimes > $scope.memberSelected.currentMoney) {
                numOfTimes = $scope.memberSelected.currentMoney;
            }

            //会员卡已过期
            if ($scope.memberSelected.validStr) {
                numOfTimes = 0;
            }

            if (numOfTimes !== 0) {
                //输入的次数、优先级更高
                if ($scope.pay.cardTimes || $scope.pay.cardTimes === 0) {
                    countRecordOver($scope.pay.cardTimes);
                    $scope.incomeStatus.payTimes = $scope.pay.cardTimes;
                }
                else {
                    countRecordOver(numOfTimes);
                    $scope.incomeStatus.payTimes = numOfTimes;
                }
                _.each($scope.recordContext.recordProduct, function (item) {
                    recordTolMoney += item.money;
                });
            }
            else {
                $scope.incomeStatus.payTimes = 0;
            }
            $scope.incomeStatus.totalMoney = totalMoney;
            $scope.incomeStatus.recordTolMoney = recordTolMoney;
            $scope.incomeStatus.paidMoney = totalMoney - recordTolMoney;
            $scope.pay.timesMax = timesMax;//记次卡最多可扣记次控制收银输入扣次的最大值
        }

        //计算记次项和剩余项
        function countRecordOver(recordTimes) {
            var cardServiceIdList = $scope.cateServiceIdMap[$scope.memberSelected.cardCateId];
            var productList = _.clone($scope.buyProductRecords);
            var recordProduct = [], overProduct = [];//记次项目与剩余的项目
            var recordTemp, overTemp;
            _.each(productList, function (item) {
                if (cardServiceIdList.indexOf(item.id) !== -1) {
                    if (recordTemp === 0) {
                        overProduct.push(item);
                        return;
                    }

                    //消费次数大于项目数量
                    if (recordTimes >= item.saleNum) {
                        recordProduct.push(item);
                    }
                    else {
                        recordTemp = _.clone(item);
                        overTemp = _.clone(item);
                        recordTemp.saleNum = recordTimes;
                        recordTemp.money = recordTemp.unitPrice * recordTemp.saleNum;
                        overTemp.saleNum = item.saleNum - recordTimes;
                        overTemp.money = overTemp.unitPrice * overTemp.saleNum;
                        recordProduct.push(recordTemp);
                        overProduct.push(overTemp);
                    }
                }
                else {
                    overProduct.push(item);
                }
            });

            //将区分后的项目挂到记次卡上下文
            $scope.recordContext.recordProduct = recordProduct;
            $scope.recordContext.overProduct = overProduct;
        }

        //选择会员后跳转至结算页面
        $scope.selMemberSave = function () {
            if ($scope.temp.memberSelected && !_.isEmpty($scope.temp.memberSelected)) {
                $scope.memberSelected = $scope.temp.memberSelected;
                isMemberInvalid($scope.memberSelected, function (error) {
                    if (error) {
                        utils.log("m-pos checkout.js selMemberSave.isMemberInvalid", error);
                        return;
                    }
                    $scope.memberSearch = "";
                    $scope.memberList = [];
                    if ($scope.buyProductRecords.length !== 0) {
                        $scope.modalDialogClose();
                        indexCountCost();
                        $scope.checkoutConfirm();
                    }
                    else {
                        $scope.modalDialogClose();
                        utils.showGlobalMsg("未选择商品,不能结算");
                    }
                });
                return;
            }
            $scope.memberSearch = "";
            $scope.memberList = [];

            if ($scope.buyProductRecords.length !== 0) {
                indexCountCost();
                $scope.modalDialogClose();
                $scope.checkoutConfirm();
            }
            else {
                $scope.modalDialogClose();
                utils.showGlobalMsg("未选择商品,不能结算");
            }
        };

        //选择会员保存不结算
        $scope.selMemberSaveNotCheckout = function () {
            if ($scope.temp.memberSelected && !_.isEmpty($scope.temp.memberSelected)) {
                $scope.memberSelected = $scope.temp.memberSelected;
                isMemberInvalid($scope.temp.memberSelected, function (error) {
                    if (error) {
                        utils.log("m-pos checkout.js selMemberSaveNotCheckout.isMemberInvalid", error);
                        return;
                    }
                    $scope.memberSearch = "";
                    $scope.memberList = [];
                    //挂单之前选择过会员、恢复挂单时会触发会员选择事件、导致直接弹出结算框
                    if ($scope.buyProductRecords.length !== 0) {
                        indexCountCost();
                    }
                });
                return;
            }
            $scope.memberSearch = "";
            $scope.memberList = [];
            if ($scope.buyProductRecords.length !== 0) {
                indexCountCost();
            }
        };

        //选择会员后跳转至挂单页面
        $scope.selMemberPend = function () {
            if ($scope.temp.memberSelected && !_.isEmpty($scope.temp.memberSelected)) {
                $scope.memberSelected = $scope.temp.memberSelected;
            }
            $scope.memberSearch = "";
            $scope.memberList = [];

            $scope.closeMemberSelDia();

            if ($scope.buyProductRecords.length !== 0) {
                $scope.showPendingConfirm();
            }
            else {
                utils.showGlobalMsg("未选择商品，不能挂单");
            }
        };

        //判断会员是否失效
        function isMemberInvalid(member, callback) {
            featureDataI.queryLastRecharge(member.cardId, function (error, result) {
                if (error) {
                    callback(error);
                    return;
                }
                if (!_.isEmpty(result)) {
                    var befDays = Math.ceil((new Date().getTime() - result.lastRecharge) / 86400000);
                    if (befDays > member.periodOfValidity) {
                        $scope.memberSelected.validStr = "(已失效)";
                        $scope.memberSelected.discounts_serviceDiscount = 10;
                    }
                    else {
                        $scope.memberSelected.validStr = "";
                    }
                }
                else {
                    $scope.memberSelected.validStr = "";
                }
                callback(null);
            });
        }

        $scope.$watch("memberSelected", function (newVal) {
            if (_.isEmpty(newVal)) {
                $("#m-pos-checkout-member-info").hide();
            }
        });

        //监听会员查询输入
        $scope.$watch("memberSearch", function (newVal, oldVal) {
            if (newVal !== oldVal && newVal !== "") {
                if (newVal.length < 4) {
                    //$scope.newVal用于延迟处理查询、防止在连续输入时查询开销过大
                    $scope.temp.newVal = newVal;
                    setTimeout(function () {
                        if (newVal === $scope.temp.newVal) {
                            $scope.searchMember();
                        }
                    }, 600);//600毫秒延迟
                }
                else {
                    //$scope.newVal用于延迟处理查询、防止在连续输入时查询开销过大
                    $scope.temp.newVal = newVal;
                    setTimeout(function () {
                        if (newVal === $scope.temp.newVal) {
                            $scope.searchMember();
                        }
                    }, CONSTANT.memSeaDelay);
                }
            }
        }, false);

        //查询会员
        $scope.searchMember = function () {
            featureDataI.searchMember($scope.memberSearch, 0, 20, function (error, result) {
                if (error) {
                    utils.showGlobalMsg("会员信息查询失败，请稍后再试");
                    utils.log("m-pos checkout.js searchMember.featureDataI.searchMember", error);
                    return;
                }
                $scope.memberList = result;
                $scope.digestScope();
            });
        };

        //结算弹出框
        $scope.checkoutConfirm = function () {
            $scope.temp.realPayMoney = $scope.incomeStatus.paidMoney;   //实收
            $scope.temp.changeMoney = 0;                                //找零
            $scope.temp.keyStack = [];
            //会员结算
            if ($scope.memberSelected && !_.isEmpty($scope.memberSelected)) {
                if ($scope.memberSelected.baseInfo_type === "recordTimeCard") {
                    $scope.payMode = "record";
                    $scope.pay.cardTimes = $scope.incomeStatus.payTimes;
                    if ($scope.memberSelected.validStr) {
                        setTimeout(function () {
                            utils.showAreaFailMsg("#m-pos-checkout-popup", "会员卡已失效");
                        }, 100);
                    }
                }
                else {
                    //显示结算框会员信息
                    $("#m-pos-checkout-member-info").show();
                    //会员卡失效
                    if ($scope.memberSelected.validStr) {
                        $scope.payMode = "cash";
                        $scope.pay.cash = $scope.incomeStatus.paidMoney;
                        $scope.pay.prePaidCard = 0;
                        $("#pay-memberCard-radio").hide();
                        setTimeout(function () {
                            utils.showAreaFailMsg("#m-pos-checkout-popup", "会员卡已失效");
                        }, 100);
                    }
                    //有效余额不足
                    else if ($scope.memberSelected.currentMoney < $scope.incomeStatus.paidMoney) {
                        $scope.payMode = "cash";
                        $scope.pay.cash = $scope.incomeStatus.paidMoney;
                        $scope.pay.prePaidCard = 0;
                        $("#pay-memberCard-radio").show();
                        setTimeout(function () {
                            utils.showAreaFailMsg("#m-pos-checkout-popup", "会员卡余额不足");
                        }, 100);
                    }
                    else {
                        $scope.payMode = "memberCard";
                        $scope.pay.prePaidCard = $scope.incomeStatus.paidMoney;
                        $scope.pay.cash = 0;
                        $("#pay-memberCard-radio").show();
                    }
                }
            }
            else {
                $scope.payMode = "cash";
                $scope.pay.cash = $scope.incomeStatus.paidMoney;
                $scope.pay.prePaidCard = 0;
                $("#pay-memberCard-radio").hide();
            }

            $scope.numKeyboard.value = "";
            $scope.numKeyboard.keyStack = [];
            if ($scope.buyProductRecords.length === 0) {
                utils.showGlobalMsg("未选择商品,不能结算");
                return;
            }
            if ($scope.licenseInfo.expire_day < 0) {
                $("#m-pos-checkout-popup .dialog-body.normal").hide();
                $("#m-pos-checkout-popup .dialog-body.out-of-date").show();
            } else {
                $("#m-pos-checkout-popup .dialog-body.normal").show();
                $("#m-pos-checkout-popup .dialog-body.out-of-date").hide();
            }
            $.fancybox.open({href: "#m-pos-checkout-popup" },
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

            $scope.digestScope();

            //上次收银选取员工操作未完成、翻转至虚拟键盘
            if ($scope.temp.flipStatusFront === false) {
                slidfast.ui.flip();
                $scope.temp.flipStatusFront = true;
            }
        };

        //暂时只支持一种支付方式
        $scope.$watch("payMode", function (newVal) {
            switch (newVal) {
                case "cash":
                    $scope.pay.cash = $scope.incomeStatus.paidMoney;
                    $scope.pay.prePaidCard = 0;
                    $scope.temp.realPayMoney = $scope.incomeStatus.paidMoney;//实收
                    $scope.temp.changeMoney = $scope.temp.realPayMoney - $scope.incomeStatus.paidMoney;
                    $scope.numKeyboard.keyStack = [];//键盘重新初始化
                    break;
                case "memberCard":
                    $scope.pay.cash = 0;
                    $scope.pay.prePaidCard = $scope.incomeStatus.paidMoney;
                    if ($scope.memberSelected.currentMoney < $scope.incomeStatus.paidMoney) {
                        $scope.pay.prePaidCard = $scope.memberSelected.currentMoney;
                        $scope.temp.realPayMoney = $scope.pay.prePaidCard;//此时会员卡余额不足
                    }
                    else {
                        $scope.temp.realPayMoney = $scope.incomeStatus.paidMoney;
                    }
                    $scope.temp.changeMoney = $scope.temp.realPayMoney - $scope.incomeStatus.paidMoney;
                    break;
                case "record":
                    break;
            }
        });
        //确认License过期确认行为
        $scope.conformLicenseAlarm = function () {
            $.fancybox.close();
            $location.path("#/m-setting/account");
        };

        //记次卡结算第二步
        $scope.recordCheckoutSecond = function () {
            $.fancybox.close();
            $.fancybox.open({href: "#m-pos-checkout-second-popup"},
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
        };

        //记次卡收银第二步使用现金支付
        $scope.secondCashCheckout = function () {
            //记次卡支付次数不为0
            if ($scope.pay.cardTimes) {
                //获取serviceBill,memberCard,projectBill,empBonus并存入recordContext中、
                $scope.recordContext.billInfo = checkoutCommit.commitRecordNotSave();
            }

            $scope.recordContext.memberSelected = _.clone($scope.memberSelected);
            $scope.temp.memberSelected = {};
            $scope.memberSelected = {};
            $scope.recordContext.recordTolMoney = $scope.incomeStatus.recordTolMoney;
            $scope.checkoutConfirm();
            indexCountCost();//重新计算
            $scope.temp.isSecondStep = true;
        };

        //记次卡收银第二步使用会员卡支付
        $scope.secondCardCheckout = function () {
            //记次卡支付次数不为0
            if ($scope.pay.cardTimes) {
                //获取serviceBill,memberCard,projectBill,empBonus并存入recordContext中、
                $scope.recordContext.billInfo = checkoutCommit.commitRecordNotSave();
            }
            $scope.recordContext.memberSelected = _.clone($scope.memberSelected);
            $scope.temp.memberSelected = {};
            $scope.memberSelected = {};
            $scope.recordContext.recordTolMoney = $scope.incomeStatus.recordTolMoney;
            $scope.showMemberSel();
            $scope.temp.isSecondStep = true;
        };

        //结算确认、生成相应的serviceBill记录
        $scope.checkout = function () {
            if ($scope.memberSelected && !_.isEmpty($scope.memberSelected) && $scope.memberSelected.baseInfo_type === "recordTimeCard") {
                //记次卡不够全部支付
                if ($scope.incomeStatus.paidMoney > 0) {
                    $scope.recordCheckoutSecond();
                }
                else {
                    checkoutCommit.commitWithRecord();
                }
            }
            else {
                //记次信息存在则生成两条收银记录
                if ($scope.recordContext.billInfo) {
                    checkoutCommit.commitBoth();
                }
                else {
                    checkoutCommit.commitWithMoney();
                }
            }
        };

        $scope.memberSearchInput = function (key) {
            $scope.memberSearch = clickKeyboard(key);
            if ($scope.numKeyboard.keyStack.length === 0) {
                $scope.memberSearch = "";
            }
        };

        $scope.indexPayInput = function (key) {
            if ($scope.payMode === "memberCard") {
                //充值卡消费输入
                rechargeCardInput(key);
            }
            else if ($scope.payMode === "record") {
                //记次卡消费输入
                recordCardInput(key);
            }
            else {
                //现金输入
                cashInput(key);
            }
        };

        //实收输入
        function cashInput(key) {
            if (key !== $scope.numKeyboard.key[11]) {
                if (parseFloat($scope.temp.realPayMoney).toFixed(2).toString().length > 9) {
                    return;
                }
            }
            var realPayTemp = parseFloat(clickKeyboard(key));
            //NaN
            if (realPayTemp !== realPayTemp) {
                $scope.temp.realPayMoney = 0;
                $scope.numKeyboard.keyStack = [];//出现NaN将键盘还原
            }
            else {
                $scope.temp.realPayMoney = realPayTemp;
            }
            $scope.temp.changeMoney = $scope.temp.realPayMoney - $scope.incomeStatus.paidMoney;
        }

        function rechargeCardInput(key) {

        }

        function recordCardInput(key) {
            var boardValueStr = clickKeyboard(key);
            var realPayTemp = parseInt(boardValueStr);

            if (realPayTemp !== parseFloat(boardValueStr)) {
                $scope.numKeyboard.keyStack = [];//出现输入小数点后将键盘还原
            }

            //NaN
            if (realPayTemp !== realPayTemp) {
                $scope.pay.cardTimes = 0;
                $scope.numKeyboard.keyStack = [];//出现NaN将键盘还原
            }
            else if (realPayTemp > $scope.pay.timesMax) {
                //考虑到扣次大部分情况小于10、当输入的值大于最大次数时、尝试取当前输入的值
                $scope.numKeyboard.keyStack = [];
                var secondInput = parseInt(clickKeyboard(key));
                if (secondInput !== secondInput) {
                    $scope.pay.cardTimes = 0;
                    $scope.numKeyboard.keyStack = [];//出现NaN将键盘还原
                }
                else if (secondInput <= $scope.pay.timesMax) {
                    $scope.pay.cardTimes = secondInput;
                }
                else {
                    $scope.pay.cardTimes = $scope.pay.timesMax;
                    $scope.numKeyboard.keyStack = [];
                }
            }
            else {
                $scope.pay.cardTimes = realPayTemp;
            }

            //记次卡次数不足
            if ($scope.pay.cardTimes > $scope.memberSelected.currentMoney) {
                $scope.pay.cardTimes = $scope.memberSelected.currentMoney;
            }
            indexCountCost();//重新计算金额信息
        }

        //虚拟数字键盘
        function clickKeyboard(key) {
            //回退键
            if (key === $scope.numKeyboard.key[11]) {
                $scope.numKeyboard.keyStack.splice($scope.numKeyboard.keyStack.length - 1, 1);
            }
            else if (key === "." && $scope.numKeyboard.keyStack.indexOf(".") !== -1) {
                //第二个"."忽略
            }
            else {
                $scope.numKeyboard.keyStack.push(key);
            }

            $scope.numKeyboard.value = $scope.numKeyboard.keyStack.join("");
            return $scope.numKeyboard.value;
        }

        //折扣弹出框
        $scope.showDiscountConfirm = function () {
            $scope.temp.globalDis = "";
            $scope.numKeyboard.value = "";
            $scope.numKeyboard.keyStack = [];
            $.fancybox.open({href: "#m-pos-change-discount-popup"},
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
        };

        //折扣输入
        $scope.discountInput = function (key) {
            var keyValueTemp = clickKeyboard(key);
            //以"."开始
            if (keyValueTemp.indexOf(".") === 0) {
                keyValueTemp = "0" + keyValueTemp;
            }
            $scope.temp.globalDis = keyValueTemp;
        };

        $scope.discountSave = function () {
            var discount = parseFloat($scope.temp.globalDis);

            //NaN
            if (discount !== discount || discount > 10) {
                $scope.globalDis = 10;
            }
            else {
                $scope.globalDis = discount;
            }
            $scope.temp.globalDis = "";
            indexCountCost();
            $scope.modalDialogClose();
        };

        //显示隐藏的挂单项
        $scope.showHiddenPend = function () {
            $("#m-pos-hide-pend").toggle();
        };

        //计算挂单的显示与隐藏
        $scope.countPendShow = function () {
            //通过顶部宽度计算出大概显示多少项
            var count;
            if ($(document).width() <= 768) {
                count = 3;
            }
            else if ($(document).width() <= 960) {
                count = 4;
            }
            else {
                count = 5;
            }

            moduleScope.pendShowList = moduleScope.pendList.slice(0, count);
            if (count < moduleScope.pendList.length) {
                $("#m-pos-more-pend").show();
                moduleScope.pendHiddenList = moduleScope.pendList.slice(count);
            }
            else {
                $("#m-pos-more-pend").hide();
                $("#m-pos-hide-pend").hide();
            }
            moduleScope.digestScope();
        };

        //记次卡是否足够支付
        $scope.isRecordEnough = function () {
            return ($scope.memberSelected
                && !_.isEmpty($scope.memberSelected)
                && $scope.memberSelected.baseInfo_type === 'recordTimeCard'
                && $scope.incomeStatus.paidMoney > 0);
        };

        //添加消费商品
        //count:添加的数量、不传递默认为1
        function addProductRecord(product, count) {
            //如果有价格改动标示
            if($scope.temp.changed_price_tempMap
                && $scope.temp.changed_price_tempMap[product.id]){
                product.prices_salesPrice =   $scope.temp.changed_price_tempMap[product.id];
            }


            var proIsExist = false;         //商品是否已在购买列表中
            _.each($scope.buyProductRecords, function (item, index) {
                if (item.id === product.id) {
                    proIsExist = true;
                    item.saleNum++;
                    item.money += product.prices_salesPrice;
                    self.pos_order_listScroll.scrollToElement(document.querySelector('#pos-order-list .scroller li:nth-child(' + (index + 1) + ')'));
                }
            });
            if (!proIsExist) {
                $scope.buyProductRecords.push({
                    id: product.id,
                    saleNum: count ? count : 1,
                    name: product.name,
                    money: product.prices_salesPrice * (count ? count : 1),
                    unitPrice: product.prices_salesPrice,
                    baseInfo_image: product.baseInfo_image,
                    cate_id: product.c_id,
                    cate_name: product.c_name
                });
                if (self.pos_order_listScroll) {
                    self.pos_order_listScroll.refresh();
                }
                else {
                    self.pos_order_listScroll = new IScroll('#pos-order-list', {
                        offsetHeight: 0,
                        mouseWheel: true,
                        click: true
                    });
                }
            }
            indexCountCost();
        }

        //区分记次卡消费计算和其他计算
        function indexCountCost() {
            //记次卡会员消费计算
            if ($scope.memberSelected && !_.isEmpty($scope.memberSelected) && $scope.memberSelected.baseInfo_type === "recordTimeCard") {
                countCostRecord();
            }
            else {
                countCost();
            }
        }

        //根据选购商品列表、计算消费金额
        function countCost() {
            var cost = 0;
            var paid = 0;
            var discount;
            var productRecord = _.clone($scope.buyProductRecords);

            //记次卡上下文中有未结算商品
            if ($scope.recordContext.overProduct) {
                productRecord = _.clone($scope.recordContext.overProduct);
            }

            _.each(productRecord, function (item) {
                cost += item.money;
            });
            //全局折扣信息优先
            if ($scope.globalDis !== "") {
                paid = parseFloat((parseFloat($scope.globalDis) * cost / 10).toFixed(2));
                if (Math.abs(parseFloat($scope.globalDis) - 10) < 0.000001) {
                    $scope.temp.discountDisplay = "无";
                }
                else {
                    $scope.temp.discountDisplay = $scope.globalDis.toFixed(2) + "折";
                }
            }
            //会员卡折扣优先级低于全局折扣信息
            else if (!_.isEmpty($scope.memberSelected) && $scope.memberSelected.baseInfo_type !== "recordTimeCard") {
                paid = parseFloat((parseFloat($scope.memberSelected.discounts_serviceDiscount) * cost / 10).toFixed(2));
                if (Math.abs(parseFloat($scope.memberSelected.discounts_serviceDiscount) - 10) < 0.000001) {
                    $scope.temp.discountDisplay = "无";
                }
                else {
                    $scope.temp.discountDisplay = $scope.memberSelected.discounts_serviceDiscount + "折";
                }
            }
            //无折扣信息
            else {
                paid = cost;
                $scope.temp.discountDisplay = "无";
            }
            discount = cost - paid;
            $scope.incomeStatus.totalMoney = parseFloat(cost.toFixed(2));
            $scope.incomeStatus.discountMoney = parseFloat(discount.toFixed(2));
            $scope.incomeStatus.paidMoney = parseFloat(paid.toFixed(2));
        }
    }

    function init() {

    }

    function afterPageLoaded() {
        var app = {
            initialize: function () {
                this.bindEvents();
            },
            bindEvents: function () {
                document.addEventListener('deviceready', this.onDeviceReady, false);
            },
            onDeviceReady: function () {
                app.receivedEvent('deviceready');
                setTimeout(function () {
                    adjustLicence();
                }, 1000);
            },
            receivedEvent: function (id) {
            }
        };
        app.initialize();
        adjustHeight();
        moduleScope.countPendShow();
        //adjustLicence();

        global.eventEmitter.addListener("setting.service.service.change", function () {
            moduleScope.needReload = true;
        });
        global.eventEmitter.addListener("setting.service.servicecate.change", function () {
            moduleScope.needReload = true;
        });

        global.eventEmitter.addListener("member.member.change", function (memberId) {
            if (moduleScope.memberSelected && moduleScope.memberSelected.id === memberId) {
                moduleScope.needReloadMemberInfo = true;
            }
        });

        //会员类型发生变化、重新初始化会员类型、当选中记次卡时服务项正确性
        global.eventEmitter.addListener("m-setting.member.change", function () {
            initCateServiceList(moduleScope, function () {
                moduleScope.digestScope();
            });
        });

        //监听测试数据完成触发事件、重新加载服务项
        global.eventEmitter.addListener("mockData.checkout.finish", function () {
            cache.clear("service.category.map", true);
            cache.clear("service.itemList", true);
            cache.clear("service.productCategories", true);
            //show缓存
            cache.clear("show.category.map", true);
            cache.clear("show.itemList", true);
            cache.clear("show.productCategories", true);
            initPageData(moduleScope, function () {
                moduleScope.digestScope();
                adjustHeight();
            });
        });

        global.eventEmitter.addListener("m-setting.employee.change", function () {
            if (moduleScope) {
                initEmployeeData(moduleScope, function () {
                    moduleScope.digestScope();
                });
            }
        });

        //监听用例数据完成触发事件、重新加载服务项
        global.eventEmitter.addListener("guideData.checkout.finish", function () {
            //服务缓存
            cache.clear("service.category.map", true);
            cache.clear("service.itemList", true);
            cache.clear("service.productCategories", true);

            //show缓存
            cache.clear("show.category.map", true);
            cache.clear("show.itemList", true);
            cache.clear("show.productCategories", true);
            initPageData(moduleScope, function () {
                moduleScope.digestScope();
                adjustHeight();
            });
        });
    }

    function adjustHeight() {
        $("#main-container").height($(window).height() - $("#header-container").outerHeight());
        var main_container_h = $("#main-container").outerHeight();
        var operation_area_h = $(".operation-area").outerHeight();
        var permanentMenuKeyHeight = 0;
        if (window.LosNailActivity && !window.LosNailActivity.hasPermanentMenuKey()) {
            permanentMenuKeyHeight = 60
        }
        var productCategoryMinwidth = $("#main-container").outerWidth() - $(".pos-order").outerWidth() - 15;

        var productCategorieMapLen = _.pairs(moduleScope.productCategorieMap).length + 2;

        if (!$("#m-pos-checkout-area").is(":hidden")) {
            if ($(document).width() <= 800) {
                $(".pos-order-list").height(main_container_h - (operation_area_h + $(".pos-checkout").outerHeight() + $(".pos-order-title").outerHeight() + 2));
                $(".product-list").height(main_container_h - (operation_area_h + $(".product-category").outerHeight() + 20));
                $(".pos-product>div").width($("#main-container").outerWidth() - $(".pos-order").outerWidth() - 15);
                $(".product-category").css("width", productCategorieMapLen * 9 + "rem");
                $(".product-category").css("min-width", productCategoryMinwidth + "px");
            } else {
                $(".pos-order-list").height(main_container_h - (operation_area_h + $(".pos-checkout").outerHeight() + $(".pos-order-title").outerHeight() + permanentMenuKeyHeight)-10);
                $(".product-list").height(main_container_h - (operation_area_h + $(".product-category").outerHeight() + permanentMenuKeyHeight+20));
                $(".pos-product>div").width($("#main-container").outerWidth() - $(".pos-order").outerWidth() - 15);
                $(".product-category").css("width", productCategorieMapLen * 9 + "rem");
                $(".product-category").css("min-width", productCategoryMinwidth + "px");
            }
        }
    }

    function adjustLicence() {
        if (cordova && cordova.platformId == "ios" && window.LosNailActivity) {
            window.LosNailActivity.getLicenseInfo(
                function (license) {
                    doCheck(license);
                }
            );
        } else {
            var license = window.LosNailActivity.getLicenseInfo();
            doCheck(license);
        }
        function doCheck(licenseInfo) {
            if (licenseInfo) {
                licenseInfo = JSON.parse(licenseInfo);
            }
            var day = licenseInfo.expire_day;
            if (day < 7) {
                $("#m-pos-checkout-licence-content").html("当前账号使用期限还剩余" + "<span style='color: red; font-size: 2rem;'>" + day + "</span>" + "天。");
                $.fancybox.open({href: "#m-pos-checkout-licence-popup" },
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
        }
    }

    function switchMenu(params) {
        if (moduleScope.needReload) {
            initServiceData(moduleScope, function () {
                adjustHeight();
                moduleScope.digestScope();
            });
            //服务项更改、记次卡对应显示的服务名称可能需要变化
            initCateServiceList(moduleScope, function () {
            });
        }

        //会员发生改变
        if (moduleScope.needReloadMemberInfo && moduleScope.memberSelected) {
            featureDataI.queryMember(moduleScope.memberSelected.id, function (error, member) {
                if (error) {
                    utils.log("m-pos checkout.js switchMenu.queryMember", error);
                    return;
                }
                moduleScope.memberSelected = _.clone(member);
                //重新查找会员、选择会员、选择会员保存不弹出结算框
                moduleScope.selectMember(moduleScope.memberSelected);
                moduleScope.selMemberSaveNotCheckout();
                moduleScope.needReloadMemberInfo = false;
            });
        }

        if (self.pos_order_listScroll) {
            self.pos_order_listScroll.refresh();
        }
    }

    function paramsChange(params) {
    }
});
