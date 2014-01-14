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

    //基础服务
    var utils = require("mframework/static/package").utils, 			//全局公共函数
        widgets = require("m-widgets/static/package"), 			//全局公共函数
        database = require("mframework/static/package").database,		//数据操作服务
        dbInstance = null;		//数据操作服务

    //使用snap捕捉元素实现滚动条当前位置获取、导致滚动效果在pad上体验太差、出现回滚
    //通过绝对定位来获取当前滚动区域的第一个元素索引
    var CONSTANT = {
        new_recharge_height: 4 * 12 + 12,       //充值和开卡元素 height 4rem pt-1
        consume_height: 8 * 12 + 12,            //消费元素 height 8rem pt-1
        month_head_height: 3 * 12 + 2 * 12      //月提示 height 3rem mb-2
    };

    var moduleScope;
    var self = this;

    function loadModelAsync(params, callback) {
        dbInstance = database.getDBInstance();
        var model = {};

        initPageModel(params, model, callback);
    }

    //页面模型数据初始化
    function initPageModel(params, model, callback) {
        model.w_width = 0;
        model.historyList = [];
        model.action = "index";
        model.temp = {};
        model.consumeTimeLine = []; //所有时间菜单模型
        model.dateLiIndex = {};     //时间对应li中的滚动索引
        model.consumeItemAbsPosY = [];   //每一条消费记录在页面中对应的绝对位置
        async.waterfall([queryMemberInfo, queryRechargeHistory, queryConsumeHistory], function (error) {
            if (error) {
                utils.showGlobalMsg("获取消费记录失败", 2000);
                callback(model);
                return;
            }
            //排序
            model.historyList.sort(function (a, b) {
                    return (b.date - a.date) === 0 ? 1 : (b.date - a.date); //由于时间在数据库中的存储问题在此调节毫秒数相等BUG
                }
            );
            getTotalTimeMenu();
            countLiIndexAbsPosY();
            callback(model);

            //根据消费记录计算总时间轴
            function getTotalTimeMenu() {
                var date, year, month, nowYear, yearChange = false, temp = {};
                nowYear = new Date().getFullYear();

                for (var i = 0; i < model.historyList.length; i++) {
                    date = new Date(model.historyList[i].date);
                    year = date.getFullYear();
                    month = date.getMonth() + 1;

                    if (nowYear !== year) {
                        nowYear = year;
                        yearChange = true;
                    }

                    if (!temp[year + "-" + month]) {
                        temp[year + "-" + month] = true;
                        //date时间、type类型year|month
                        model.consumeTimeLine.push({
                            date: new Date(year + "/" + month + "/1"),
                            type: i === 0 ? "year" : (yearChange ? 'year' : 'month'),
                            display: i === 0 ? "现在" : (yearChange ? year + "年" : month + "月")
                        });
                        yearChange = false;
                    }
                }

                //往前推一年
                if (!yearChange && i !== 0) {
                    model.consumeTimeLine.push({
                        date: new Date((year - 1) + "/1/1"),
                        type: "year",
                        display: (year - 1) + "年"
                    });
                }
                else {
                    model.consumeTimeLine.push({
                        date: new Date((nowYear) + "/1/1"),
                        type: "year",
                        display: (nowYear) + "年"
                    });
                }
            }

            //添加月末标记、计算li的索引、以及绝对位置
            function countLiIndexAbsPosY() {
                var month, year, historyMonth, historyYear, i, absYSum;

                var monthCount = 0;//月份切换统计
                model.consumeItemAbsPosY.push(0);//li开始坐标存储
                for (i = 0; i < model.historyList.length; i++) {
                    model.historyList[i].lastMonth = false;
                    historyYear = new Date(model.historyList[i].date).getFullYear();
                    historyMonth = new Date(model.historyList[i].date).getMonth() + 1;

                    //月份发生切换
                    if (month !== historyMonth || year !== historyYear) {
                        model.dateLiIndex[historyYear + "-" + historyMonth] = i + monthCount;
                        model.historyList[i].lastMonth = true;              //月末、用于页面显示月与月之间的分割线
                        month = historyMonth;
                        year = historyYear;
                    }
                    monthCount++;//非月份切换时、无内容li也存在

                    //计算绝对Y值、开卡或者充值
                    if (model.historyList[i].lastMonth) {
                        model.consumeItemAbsPosY.push(CONSTANT.month_head_height);
                    }
                    else {
                        model.consumeItemAbsPosY.push(0);   //隐藏li无内容
                    }

                    if (model.historyList[i].item) {
                        model.consumeItemAbsPosY.push(CONSTANT.consume_height);
                    }
                    else {
                        model.consumeItemAbsPosY.push(CONSTANT.new_recharge_height);
                    }
                }
                //高度累加
                for (i = 0, absYSum = 0; i < model.consumeItemAbsPosY.length; i++) {
                    absYSum += model.consumeItemAbsPosY[i];
                    model.consumeItemAbsPosY[i] = absYSum;
                }
            }
        });

        //查询会员信息
        function queryMemberInfo(callback) {
            dbInstance.transaction(function (trans) {
                var selMember = "select a.id,a.name,b.cardNo,c.baseInfo_type from tb_member a,tb_memberCard b,tb_memberCardCategory c where b.memberId = a.id and b.memberCardCategoryId = c.id and b.id = ?;";
                trans.executeSql(selMember, [params.memberCard_id], function (trans, result) {
                    if (result.rows.length !== 0) {
                        model.member = result.rows.item(0);
                    }
                    callback(null);
                }, function (trans, error) {
                    console.log(error);
                    callback(null);
                });
            });
        }


        function queryRechargeHistory(callback) {
            dbInstance.transaction(function (trans) {
                trans.executeSql("select a.id,a.type,a.dateTime,a.amount,a.member_currentBalance,a.pay_cash from tb_rechargeMemberBill a where a.memberCard_id = ?", [params.memberCard_id], function (tx, result) {
                    var len = result.rows.length;
                    for (var i = 0; i < len; i++) {
                        var tmp = result.rows.item(i);
                        model.historyList.push({
                            date: tmp["dateTime"],
                            type: (tmp["type"] == 1) ? "充值" : "开卡",
                            typeDetail: (tmp["type"] == 1) ? "充值金额" : "开卡金额",
                            item: "",
                            money: tmp["amount"],
                            balance: tmp["member_currentBalance"]
                        });
                    }
                    callback(null);
                }, function (trans, error) {
                    console.log(error);
                    callback(error);
                })
            });
        }

        function queryConsumeHistory(callback) {
            dbInstance.transaction(function (trans) {
                var selHistory = "select a.serviceBill_id,b.pay_cash,b.amount,b.def_int1 as times,b.member_currentBalance,b.dateTime,a.project_id,a.project_name,a.sumMoney,a.saleNum from tb_billProject a , tb_serviceBill b where a.serviceBill_id=b.id and b.memberCard_id = ?";
                trans.executeSql(selHistory, [params.memberCard_id], function (trans, result) {
                    var len = result.rows.length;
                    var billMap = {};
                    for (var i = 0; i < len; i++) {
                        var tmp = result.rows.item(i);
                        if (!billMap[tmp["serviceBill_id"]]) {
                            billMap[tmp["serviceBill_id"]] = {
                                date: tmp["dateTime"],
                                type: (tmp["pay_cash"] == 0) ? "会员卡消费" : "现金消费",
                                typeDetail: model.member.baseInfo_type === "recordTimeCard" ? "消费次数" : "消费金额",
                                item: "",
                                money: tmp["amount"],
                                times: tmp["times"],
                                balance: tmp["member_currentBalance"]
                            };
                        }
                        billMap[tmp["serviceBill_id"]].item += "," + tmp["project_name"];
                    }
                    _.each(billMap, function (value, key) {
                        value.item = value.item.substring(1);
                        model.historyList.push(value);
                    });
                    callback(null);
                }, function (trans, error) {
                    console.log(error);
                    callback(error);
                })
            });
        }
    }

    function initContoller($scope, $parse, $q, $http) {
        //保存当前上下文到模块级别，方便非angular代码调用
        moduleScope = $scope;

        //选取时间轴上的年份菜单、展开该年份中有消费的月份、列表滚动至所选年最后一个消费月
        $scope.selYearMenu = function (timePoint) {
            var year = timePoint.date.getFullYear();
            //移除先前选中效果
            if ($scope.temp.selTimePoint) {
                $("#" + $scope.temp.selTimePoint.date.getTime()).removeClass("consume-record-item-selected");
            }
            $("#" + timePoint.date.getTime()).addClass("consume-record-item-selected");

            //第一次点击或者点击和已展开不同的年份
            if (!$scope.temp.selYear || $scope.temp.selYear !== year) {
                $(".month-" + $scope.temp.selYear).hide();
                $scope.temp.selTimePoint = timePoint;       //选中的时间点
                $scope.temp.selYear = year;
                $(".month-" + year).show();
                $scope.selMonthMenu(timePoint);
            }
            else {
                //在展开之间的月份之间选择
                $scope.temp.selTimePoint = timePoint;
                $scope.selMonthMenu(timePoint);
            }
        };

        //选取时间轴上的月份菜单、列表滚动至所选月
        $scope.selMonthMenu = function (timePoint) {
            $("#" + $scope.temp.selTimePoint.date.getTime()).removeClass("consume-record-item-selected");
            $("#" + timePoint.date.getTime()).addClass("consume-record-item-selected");
            $scope.temp.selTimePoint = timePoint;
            var date = timePoint.date.getFullYear() + "-" + (timePoint.date.getMonth() + 1);
            if (_.isNumber($scope.dateLiIndex[date])) {
                //由于计算了每一个li的绝对Y坐标、使用scrollTo进行滚动、(解决滚动元素和title之间没有间隙的问题);
                self.consumeListScroll.scrollTo(0, -($scope.consumeItemAbsPosY[$scope.dateLiIndex[date]]), 1000);
//                self.consumeListScroll.scrollToElement(document.querySelector("#consumeList-scroll-warp li:nth-child(" + $scope.dateLiIndex[date] + ")"));
            }
        };

        $scope.getYearMonth = function (dateTime) {
            var date = new Date(dateTime);
            return date.getFullYear() + "-" + (date.getMonth() + 1);
        };
    }

    function init() {

    }

    function afterPageLoaded() {
        var contentHeight = $(window).outerHeight() - $("#m-setting-consumeList-title").outerHeight();
        $("#m-member-consumeList-content").height(contentHeight);
        $("#m-member-wait-tip").height(contentHeight);
        $("#m-member-right-consumeList .mid-line").height(contentHeight);

        //使用捕捉元素实现位置获取、在手机上经常出现乱滚动效果、
        self.consumeListScroll = new IScroll('#consumeList-scroll-warp', {useTransition: true});

        //选中现在
        if (moduleScope.consumeTimeLine.length != 0) {
            moduleScope.selYearMenu(moduleScope.consumeTimeLine[0]);
        }

        //监听滚动结束、改变时间选中
        self.consumeListScroll.on("scrollEnd", function () {
            var currentIndex;
            for (var i = 0; i < moduleScope.consumeItemAbsPosY.length; i++) {
                if (Math.abs(self.consumeListScroll.y) < moduleScope.consumeItemAbsPosY[i]) {          //2rem -24px作为偏差
                    currentIndex = i;
                    break;
                }
            }

            var preKey = new Date().getFullYear() + "/" + (new Date().getMonth() + 1);
            for (var key in moduleScope.dateLiIndex) {
                if (moduleScope.dateLiIndex.hasOwnProperty(key)) {
                    if (currentIndex <= moduleScope.dateLiIndex[key]) {
                        var date;
                        //滚动临界处理、
                        if (currentIndex === moduleScope.dateLiIndex[key]) {
                            date = new Date(key + "/1");
                        }
                        else {
                            date = new Date(preKey + "/1")
                        }
                        for (var j = 0; j < moduleScope.consumeTimeLine.length; j++) {
                            if (moduleScope.consumeTimeLine[j].date.getTime() === date.getTime()) {
                                switchTimePoint(moduleScope.consumeTimeLine[j]);
                                break;
                            }
                        }
                        break;
                    }
                }
                preKey = key;
            }
        });

        //内容滚动、切换时间菜单
        function switchTimePoint(timePoint) {
            async.waterfall([switchYear, switchMonth], function (error) {
                if (error) {
                    console.log(error);
                }
            });

            //切换年份
            function switchYear(callback) {
                var year = timePoint.date.getFullYear();
                //移除先前选中效果
                if (moduleScope.temp.selTimePoint) {
                    $("#" + moduleScope.temp.selTimePoint.date.getTime()).removeClass("consume-record-item-selected");
                }
                $("#" + timePoint.date.getTime()).addClass("consume-record-item-selected");

                //第一次点击或者点击和已展开不同的年份
                if (!moduleScope.temp.selYear || moduleScope.temp.selYear !== year) {
                    $(".month-" + moduleScope.temp.selYear).hide();
                    moduleScope.temp.selTimePoint = timePoint;       //选中的时间点
                    moduleScope.temp.selYear = year;
                    $(".month-" + year).show();
                }
                else {
                    //在展开之间的月份之间选择
                    moduleScope.temp.selTimePoint = timePoint;
                }
                callback(null);
            }

            //切换月份
            function switchMonth(callback) {
                $("#" + moduleScope.temp.selTimePoint.date.getTime()).removeClass("consume-record-item-selected");
                $("#" + timePoint.date.getTime()).addClass("consume-record-item-selected");
                moduleScope.temp.selTimePoint = timePoint;
                callback(null);
            }
        }
    }

    function switchMenu(params) {
        var waitTip = $("#m-member-wait-tip").show();
        moduleScope.historyList = [];
        moduleScope.temp = {};
        moduleScope.consumeTimeLine = [];
        moduleScope.dateLiIndex = {};

        initPageModel(params, moduleScope, function () {
            setTimeout(function () {
                waitTip.hide();
                moduleScope.$digest();
                self.consumeListScroll.refresh();
                if (moduleScope.consumeTimeLine.length != 0) {
                    moduleScope.selYearMenu(moduleScope.consumeTimeLine[0]);
                }
            }, 100);
        });
    }


    function paramsChange(params) {
        if (moduleScope) {
            moduleScope.params = params;
        }
    }
});
