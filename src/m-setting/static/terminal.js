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

    //基础服务
    var utils = require("mframework/static/package").utils, 			        //全局公共函数
        database = require("mframework/static/package").database;		//数据操作服务
    var dataUtils = require("mframework/static/package").dataUtils;		//数据操作服务
    var dbInstance;
    var moduleScope;

    var CONSTANT = {
        tb_enterprise: "tb_enterprise",
        tb_printer: "tb_printer",
        tb_smallTicket: "tb_smallTicket",
        smallTicket: "smallTicket",
        terminal: "terminal"
    };


    function loadModelAsync(params, callback) {
        dbInstance = database.getDBInstance();
        var model = {
            selectedStyle: "terminal",
            printer: {},
            ticketSwitch: {},
            storeInfo: {},
            tips: {
                printerNameError: ""
            }
        };
        initData(model, callback);
    }

    function initData(model, callback) {
        async.waterfall([transferModel, initPrinter, initTicketSwitch, initStoreInfo], function (error) {
            if (error) {
                utils.log("m-setting terminal.js initDate", error);
            }
            callback(model);
        });

        //将Model往下传
        function transferModel(callback) {
            callback(null, model);
        }
    }

    //初始化打印设置
    function initPrinter(model, callback) {
        model.printer = {};
        var queryStatement = "select id,printer_name,printer_address,bluetooth_name,bluetooth_pwd,print_density,print_number,use_flag from tb_printer where use_flag = ?;";
        dbInstance.transaction(function (trans) {
            trans.executeSql(queryStatement, [1], function (trans, result) {
                if (result.rows.length !== 0) {
                    model.printer = _.clone(result.rows.item(0));
                }
                else {
                    model.printer = {
                        print_number: "1"
                    };
                }
                callback(null, model);
            }, function (trans, error) {
                callback(error);
            });
        });
    }

    //初始化小票格式开关
    function initTicketSwitch(model, callback) {
        utils.getTicketSwitch(function (error, ticketSwitch) {
            if (error) {
                callback(error);
                return;
            }
            model.ticketSwitch = _.clone(ticketSwitch);
            callback(null, model);
        });
    }

    //初始化店铺信息
    function initStoreInfo(model, callback) {
        utils.getStoreInfo(function (error, storeInfo) {
            if (error) {
                callback(error);
                return;
            }
            model.storeInfo = storeInfo;
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

        $scope.back_setting = function () {
            $location.path("#/m-setting/setting");
        };

        $scope.setSmallTicket = function () {
            $scope.selectedStyle = CONSTANT.smallTicket;
        };

        $scope.terminalMgr = function () {
            $scope.selectedStyle = CONSTANT.terminal;
        };

        $scope.searchBluetoothPrinter = function () {
            if (window.plugins.BluetoothPrinter) {
                window.plugins.BluetoothPrinter.searchBluetoothPrinter({}, function (successResult) {
                    $scope.printer.printer_name = successResult.printer_name;
                    $scope.printer.printer_address = successResult.printer_address;
                    savePrinter($scope.printer, function (error) {
                        if (error) {
                            utils.log("m-setting terminal.js searchBluetoothPrinter.savePrinter", error);
                            utils.showGlobalMsg("打印机信息保存失败");
                            return;
                        }
                        utils.showGlobalSuccessMsg("打印机信息保存成功");
                        $scope.digestScope();
                    });
                }, function (errorResult) {
                    utils.showGlobalMsg("连接蓝牙打印机失败，请稍后重试");
                });
            }
        };

        $scope.history = function () {
            if (window.plugins.BluetoothPrinter) {
                window.plugins.BluetoothPrinter.history();
            }
        };
        $scope.testPrinter = function () {
            var printData = [
                {//现金收银打印
                    ticket_type: 0,
                    //名称，单号，时间
                    header: {store_name: "乐斯美甲四季花城店1",
                        date: "2013-12-31 21：31：49", consume_no: "07886588981"
                    },
                    body: [
                        { name: "OPI甲胶油1", amount: "100", sum: "￥130.50"},
                        { name: "手部护理加OPI甲胶油1", amount: "90", sum: "￥900.50"},
                        { name: "上钻颗粒1", amount: "90", sum: "￥900.50"}
                    ],
                    summary: {
                        //小计，折后，实收，找零
                        subtotal: "￥200", discount: "￥160", paid: "￥160", change: "￥0"
                    },
                    config_item: {
                        //优惠金额
                        discount_amount: "￥40"
                    },
                    footer: {
                        address: "深圳市龙岗区坂田四季花城1", phone: "0755-88886666"
                    }
                },
                {//会员卡收银打印
                    ticket_type: 1,
                    header: {store_name: "乐斯美甲四季花城店2", consume_no: "07886588981",
                        date: "2013-12-31 21：31：49", card_no: "07886588982"
                    },
                    body: [
                        { name: "OPI甲胶油2", amount: "1", sum: "￥130.50"},
                        { name: "手部护理加OPI甲胶油2", amount: "1", sum: "￥20.50"},
                        { name: "上钻颗粒2", amount: "2", sum: "￥50.50"}
                    ],
                    summary: {
                        //小计，折后，实收
                        subtotal: "￥200", discount: "￥160", paid: "￥160"
                    },
                    config_item: {
                        //优惠金额，余额
                        discount_amount: "￥40", balance: "￥2300"
                    },
                    footer: {address: "深圳市龙岗区坂田四季花城2", phone: "0755-88886666"}
                },
                { //计次卡收银打印
                    ticket_type: 2,
                    header: {store_name: "乐斯美甲四季花城店3", consume_no: "07886588981",
                        date: "2013-12-31 21:31:49", card_no: "07886588983"},
                    body: [
                        { name: "OPI甲胶油3", amount: "1", sum: "￥25.50"},
                        { name: "手部护理加OPI甲胶油3", amount: "1", sum: "￥20.50"}
                    ],
                    summary: {
                        //小计，扣次，实收
                        subtotal: "￥200", buckle_times: "2次", paid: "2次"
                    },
                    config_item: {
                        //优惠金额，余额
                        discount_amount: "￥15", balance: "5次"
                    },
                    footer: {address: "深圳市龙岗区坂田四季花城3", phone: "0755-88886666"}
                },
                {//充值打印
                    ticket_type: 3,
                    header: {store_name: "乐斯美甲四季花城店4", consume_no: "07886588981",
                        date: "2013-12-31 21:31:49", card_no: "07886588984"},
                    body: [
                        { name: "银卡充值", amount: "1", sum: "￥500.00"}
                    ],
                    summary: {
                    },
                    config_item: {
                    },
                    //小计，折后，扣卡，优惠金额，卡内余额，地址，电话
                    footer: {address: "深圳市龙岗区坂田四季花城", phone: "0755-88886666"}
                },
                {//办理会员卡收银打印
                    ticket_type: 4,
                    header: {store_name: "乐斯美甲四季花城店", consume_no: "07886588981",
                        date: "2013-12-31 21:31:49", card_no: "07886588985"},
                    body: [
                        { name: "办理银卡", amount: "1", sum: "￥1500.00"}
                    ],
                    summary: {
                    },
                    config_item: {
                    },
                    //小计，折后，扣卡，优惠金额，卡内余额，地址，电话
                    footer: {address: "深圳市龙岗区坂田四季花城", phone: "0755-88886666"}
                },
                {//办理计次卡打印
                    ticket_type: 5,
                    header: {store_name: "乐斯美甲四季花城店", consume_no: "07886588981",
                        date: "2013-12-31 21:31:49", card_no: "07886588986"},
                    body: [
                        { name: "办理手部护理卡", amount: "1", sum: "￥800.00"}
                    ],
                    summary: {
                    },
                    config_item: {
                    },
                    //小计，折后，扣卡，优惠金额，卡内余额，地址，电话
                    footer: {address: "深圳市龙岗区坂田四季花城", phone: "0755-88886666"}
                },
                {//会员现金消费打印
                    ticket_type: 6,
                    header: {store_name: "乐斯美甲四季花城店2", consume_no: "07886588981",
                        date: "2013-12-31 21：31：49", card_no: "07886588982"
                    },
                    body: [
                        { name: "OPI甲胶油2", amount: "1", sum: "￥130.50"},
                        { name: "手部护理加OPI甲胶油2", amount: "1", sum: "￥20.50"},
                        { name: "上钻颗粒2", amount: "2", sum: "￥50.50"}
                    ],
                    summary: {
                        //小计，折后，实收，找零
                        subtotal: "￥200", discount: "￥160", paid: "￥160", change: "￥0"
                    },
                    config_item: {
                        //优惠金额，余额
                        discount_amount: "￥40", balance: "￥2300"
                    },
                    footer: {address: "深圳市龙岗区坂田四季花城2", phone: "0755-88886666"}
                }
            ];
            utils.printTicket(printData[6], function (error) {

            });

//            if (window.plugins && window.plugins.BluetoothPrinter) {
//                window.plugins.BluetoothPrinter.print(printData[6], function (successResult) {
//
//                }, function (errorResult) {
//
//                });
//            }
        };

        function savePrinter(printer, callback) {
            var time = new Date().getTime() + "";

            // 先判断该蓝牙打印机的记录是否在数据库中已经存在了
            // 如果存在的话，修改该条记录
            // 如果不存在的话，则新增一条蓝牙打印机配置记录
            addOrUpdatePrinter(function (error) {
                if (error) {
                    callback(error);
                    return;
                }
                if (window.plugins && window.plugins.BluetoothPrinter) {
                    //打印份数
                    var result = {
                        id: printer.id,
                        printer_address: printer.printer_address ? printer.printer_address : "",
                        printer_name: printer.printer_name ? printer.printer_name : "",
                        print_number: printer.print_number
                    };

                    window.plugins.BluetoothPrinter.loadPrinter(result, function (successResult) {
                        callback(null);
                    }, function (errorResult) {
                        callback(errorResult)
                    });
                }
                else {
                    callback(null);
                }
            });

            function addOrUpdatePrinter(callback) {
                //有id无蓝牙地址、空记录
                var oldId = printer.id;
                if (printer.id && !printer.printer_address) {
                    updatePrinterInfo(oldId, callback);
                }
                else {
                    dbInstance.transaction(function (trans) {
                        var oldPrinterSel = "select id from tb_printer where printer_address = ?;";
                        trans.executeSql(oldPrinterSel, [printer.printer_address], function (trans, result) {
                            if (result.rows.length == 0) {
                                addPrinterInfo(callback);
                            }
                            else {
                                oldId = result.rows.item(0).id;
                                updatePrinterInfo(oldId, callback);
                            }
                        }, function (trans, error) {
                            callback(error);
                        });
                    });
                }
            }

            /**
             * 新增打印机记录
             */
            function addPrinterInfo(callback) {
                var sqlArray = [];
                $scope.printer.id = time;//更新保持模型中的id、
                printer.id = time;
                printer.use_flag = 1;
                sqlArray.push(dataUtils.getInsertSqlOfObj("tb_printer", printer));
                sqlArray.push({
                    statement: "update tb_printer set use_flag = ? where id != ?;",
                    value: [0, printer.id]
                });
                dataUtils.batchExecuteSql(sqlArray, callback);
            }

            /**
             * 修改打印机信息
             */
            function updatePrinterInfo(oldId, callback) {
                var sqlArray = [];
                printer.id = oldId;
                printer.use_flag = 1;
                sqlArray.push(dataUtils.getUpdateSqlOfObjId("tb_printer", printer));
                sqlArray.push({
                    statement: "update tb_printer set use_flag = ? where id != ?;",
                    value: [0, printer.id]
                });
                dataUtils.batchExecuteSql(sqlArray, callback);
            }
        }

        $scope.switchTicket = function (switchName) {
            var ticketStatus = Math.abs(parseInt($scope.ticketSwitch[switchName]) - 1) + "";
            updateSwitchFlag(switchName, ticketStatus, function (error) {
                if (error) {
                    utils.log("m-setting messageCenter.js switchTicket.updateSwitchFlag", error);
                    return;
                }
                $scope.ticketSwitch[switchName] = ticketStatus;
                utils.setTicketSwitch($scope.ticketSwitch);//开关状态改变
                if (switchName == "discount_amount" || switchName == "balance") {
                    if (window.plugins && window.plugins.BluetoothPrinter) {
                        var options = {
                            discount_amount: $scope.ticketSwitch.discount_amount,
                            balance: $scope.ticketSwitch.balance
                        };

                        window.plugins.BluetoothPrinter.loadSmallTicket(options, function (successResult) {

                        }, function (errorResult) {

                        });
                    }
                }
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

        $scope.minusPrintNumber = function () {
            var printNumber = parseInt($scope.printer.print_number);
            var printer = _.clone($scope.printer);
            if (printNumber >= 2) {
                printer.print_number = --printNumber + "";
                savePrinter(printer, function (error) {
                    if (error) {
                        utils.log("m-setting terminal.js minusPrintNumber.savePrinter", error);
                        utils.showGlobalMsg("打印机信息更改失败");
                        return;
                    }
                    $scope.printer.print_number = printer.print_number;
                });
            }
        };
        $scope.addPrintNumber = function () {
            var printerNumber = parseInt($scope.printer.print_number);
            var printer = _.clone($scope.printer);
            printer.print_number = ++printerNumber + "";
            savePrinter(printer, function (error) {
                if (error) {
                    utils.log("m-setting terminal.js addPrintNumber.savePrinter", error);
                    utils.showGlobalMsg("打印机信息更改失败");
                    return;
                }
                $scope.printer.print_number = printer.print_number;
            });
        };

        //跳转至消费详情页面
        $scope.toStorePage = function () {
            $location.path("#/m-setting/store");
        };
    }

    function init() {

    }

    function afterPageLoaded() {
        $(".m-newGuide-content").height($(window).height() - $(".m-setting-title").outerHeight());
    }

    function switchMenu(params) {
        //菜单切换后，重新查询数据，防止企业信息更改后，再次进入到终端设置界面时，界面上的店名，电话，地址等信息没有更新
    }

    function paramsChange(params) {

    }
});