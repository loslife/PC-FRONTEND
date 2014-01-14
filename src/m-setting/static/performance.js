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

    var self = this,
        utils = require("mframework/static/package").utils, 			        //全局公共函数
        database = require("mframework/static/package").database,		        //数据操作服务
        db = null,		                                        //数据操作服务
        cache = utils.getCache(),
        performance_data = require("./performance-data"),
        reportService = new ReportDrawService(),
        utils = require("mframework/static/package").utils, 			        //全局公共函数
        CONSTANT = {
        };
    var moduleScope;

    function loadModelAsync(params, callback) {
        db = database.getDBInstance();
        var date = new Date();
        self.currentDate = new Date();
        var currentweek_start = utils.getWeekStartDate(new Date());
        var currentweek_end = utils.getWeekEndDate(new Date());

        var model = {
            needReload: false,
            dayCondition: {
                currentDate: date,
                year: (date.getFullYear()),
                month: (date.getMonth()),
                date: (date.getDate())
            },
            weekCondition: {
                currentDate: new Date(),
                year_weekStart: (currentweek_start.getFullYear()),
                year_weekEnd: (currentweek_end.getFullYear()),
                month_weekStart: (currentweek_start.getMonth()),
                month_weekEnd: (currentweek_end.getMonth()),
                date_weekStart: (currentweek_start.getDate()),
                date_weekEnd: (currentweek_end.getDate())
            },
            monthCondition: {
                currentDate: new Date(),
                year: (date.getFullYear()),
                month: (date.getMonth())
            },
            viewData: {
                report_service: {},
                report_operate: {},
                report_consumer: {},
                report_employee: {}
            },
            report_total_service: {
                top_1: {name: "", value: "", img: ""},
                top_2: {name: "", value: "", img: ""},
                top_3: {name: "", value: "", img: ""}
            },
            report_total_employee: {
                top_1: {name: "", value: "", img: ""},
                top_2: {name: "", value: "", img: ""},
                top_3: {name: "", value: "", img: ""}
            },
            chartMenuType: "day",
            performanceType: "operate"
        };
        callback(model);
    }

    function initContoller($scope, $parse, $q, $http) {
        moduleScope = $scope;

        $scope.toFixed = function (value) {
            return value.toFixed(2);
        }

        $scope.clickNavMenu = function (feature, event) {
            $("#m-setting-performance-area .left-nav>li").removeClass("selected");
            $(event.target).closest("li").addClass("selected");
            $scope.chartMenuType = feature;
            global.eventEmitter.emitEvent('setting.performance.' + feature + '.refresh');

            //更新报表数据

        }

        $scope.switchReportType = function (chartType) {
            //根据类型更新页面模型，重画图形
            slidfast.ui.slideTo('report-' + chartType);
            $scope.performanceType = chartType;
            $(".report-item-summary").removeClass("selected");
            $("#report-menu-" + chartType).addClass("selected");

            global.eventEmitter.emitEvent('setting.performance.' + $scope.chartMenuType + '.refresh');
        }


        $scope.prevDay = function () {
            $(".time-condition .setting-day .next").removeClass("disable");
            var preDate = new Date($scope.dayCondition.currentDate.getTime() - 24 * 60 * 60 * 1000);  //前一天var
            $scope.dayCondition.currentDate = preDate;
            $scope.dayCondition.year = preDate.getFullYear();
            $scope.dayCondition.month = preDate.getMonth();
            $scope.dayCondition.date = preDate.getDate();
            global.eventEmitter.emitEvent('setting.performance.' + $scope.chartMenuType + '.refresh');
        }
        $scope.nextDay = function (event) {
            var nextDate = new Date($scope.dayCondition.currentDate.getTime() + 24 * 60 * 60 * 1000);//后一天

            if (nextDate.getTime() > (self.currentDate.getTime() + 1000)) {
                $(event.target).closest("span").addClass("disable");
                return;
            }

            $scope.dayCondition.currentDate = nextDate;

            $scope.dayCondition.year = nextDate.getFullYear();
            $scope.dayCondition.month = nextDate.getMonth();
            $scope.dayCondition.date = nextDate.getDate();
            global.eventEmitter.emitEvent('setting.performance.' + $scope.chartMenuType + '.refresh');

        }

        $scope.prevWeek = function () {
            $(".time-condition .setting-week .next").removeClass("disable");

            var prevWeek_start = utils.getLastWeekStartDate($scope.weekCondition.currentDate);
            var prevWeek_end = utils.getLastWeekEndDate($scope.weekCondition.currentDate);
            $scope.weekCondition.currentDate = prevWeek_start;
            $scope.weekCondition.year_weekStart = prevWeek_start.getFullYear();
            $scope.weekCondition.year_weekEnd = prevWeek_end.getFullYear();
            $scope.weekCondition.month_weekStart = prevWeek_start.getMonth();
            $scope.weekCondition.month_weekEnd = prevWeek_end.getMonth();
            $scope.weekCondition.date_weekStart = prevWeek_start.getDate();
            $scope.weekCondition.date_weekEnd = prevWeek_end.getDate();

            global.eventEmitter.emitEvent('setting.performance.' + $scope.chartMenuType + '.refresh');
        }


        $scope.nextWeek = function (event) {
            var nextWeek_start = utils.getNextWeekStartDate($scope.weekCondition.currentDate);
            var nextWeek_end = utils.getNextWeekEndDate($scope.weekCondition.currentDate);
            if (nextWeek_start.getTime() > (self.currentDate.getTime() + 1000)) {
                $(event.target).closest("span").addClass("disable");
                return;
            }
            $scope.weekCondition.currentDate = nextWeek_start;

            $scope.weekCondition.year_weekStart = nextWeek_start.getFullYear();
            $scope.weekCondition.year_weekEnd = nextWeek_end.getFullYear();

            $scope.weekCondition.month_weekStart = nextWeek_start.getMonth();
            $scope.weekCondition.month_weekEnd = nextWeek_end.getMonth();

            $scope.weekCondition.date_weekStart = nextWeek_start.getDate();
            $scope.weekCondition.date_weekEnd = nextWeek_end.getDate();

            global.eventEmitter.emitEvent('setting.performance.' + $scope.chartMenuType + '.refresh');
        }

        $scope.prevMonth = function () {
            $(".time-condition .setting-month .next").removeClass("disable");
            var preMonth = $scope.monthCondition.currentDate.prevMonth();
            $scope.monthCondition.currentDate = preMonth;

            $scope.monthCondition.year = preMonth.getFullYear();
            $scope.monthCondition.month = preMonth.getMonth();

            global.eventEmitter.emitEvent('setting.performance.' + $scope.chartMenuType + '.refresh');
        }
        $scope.nextMonth = function (event) {
            var nextMonth = $scope.monthCondition.currentDate.nextMonth();
            if (nextMonth.getTime() > (self.currentDate.getTime() + 60 * 1000)) {
                $(event.target).closest("span").addClass("disable");
                return;
            }
            $scope.monthCondition.currentDate = nextMonth;

            $scope.monthCondition.year = nextMonth.getFullYear();
            $scope.monthCondition.month = nextMonth.getMonth();

            global.eventEmitter.emitEvent('setting.performance.' + $scope.chartMenuType + '.refresh');
        }


        $scope.goToPrevMonth = function () {
            if ($scope.month == 1) {
                $scope.month = 12;
                $scope.year--;
            } else {
                $scope.month--;
            }
        }

        $scope.goToNextMonth = function () {
            if ($scope.month == self.currentMonth && $scope.year == self.currentYear) {
                return;
            }
            if ($scope.month == 12) {
                $scope.month = 1;
                $scope.year++;
            } else {
                $scope.month++;
            }
        }
    }

    function init() {

    }

    function afterPageLoaded() {
        var date;
        global.eventEmitter.addListener("pos.checkout.servicebill.add", function () {
            moduleScope.needReload = true;
            date = new Date();
            cache.clear("report.data.month." + date.getFullYear() + "_" + date.getMonth(), true);
            cache.clear("report.data.week." + date.getFullYear() + "_" + date.getWeekOfYear(), true);

        });
        global.eventEmitter.addListener("member.member.change", function () {
            moduleScope.needReload = true;
            date = new Date();
            cache.clear("report.data.month." + date.getFullYear() + "_" + date.getMonth(), true);
            cache.clear("report.data.week." + date.getFullYear() + "_" + date.getWeekOfYear(), true);

        });

        global.eventEmitter.addListener("setting.performance.day.refresh", function () {
            drawDayPageChart();
        });
        global.eventEmitter.addListener("setting.performance.week.refresh", function () {
            drawWeekPageChart();
        });
        global.eventEmitter.addListener("setting.performance.month.refresh", function () {
            drawMonthPageChart();
        });


        slidfast({
            defaultPageID: 'report-operate',
            touchEnabled: false,
            singlePageModel: true,
            optimizeNetwork: true
        }).start();

        date = new Date();
        global.eventEmitter.emitEvent('pos.checkout.servicebill.add');

        global.eventEmitter.emitEvent('setting.performance.day.refresh');
    }

    function calcTop() {
        //计算员工业绩TOP
        if ("employee" == moduleScope.performanceType) {
            moduleScope.viewData.report_employee.employee = _.sortBy(moduleScope.viewData.report_employee.employee, function (item) {
                return item.value;
            });

            moduleScope.report_total_employee.top_1 = {};
            moduleScope.report_total_employee.top_2 = {};
            moduleScope.report_total_employee.top_3 = {};

            var len = moduleScope.viewData.report_employee.employee.length;
            if (len > 0) {
                moduleScope.report_total_employee.top_1 = {name: moduleScope.viewData.report_employee.employee[len - 1].name, value: moduleScope.viewData.report_employee.employee[len - 1].value, img: ""};
            }
            if (len > 1) {
                moduleScope.report_total_employee.top_2 = {name: moduleScope.viewData.report_employee.employee[len - 2].name, value: moduleScope.viewData.report_employee.employee[len - 2].value, img: ""};
            }
            if (len > 2) {
                moduleScope.report_total_employee.top_3 = {name: moduleScope.viewData.report_employee.employee[len - 3].name, value: moduleScope.viewData.report_employee.employee[len - 3].value, img: ""};
            }
        }

        //计算服务业绩TOP
        if ("service" == moduleScope.performanceType) {
            moduleScope.report_total_service.top_1 = {};
            moduleScope.report_total_service.top_2 = {};
            moduleScope.report_total_service.top_3 = {};

            moduleScope.viewData.report_service.cate_static = _.sortBy(moduleScope.viewData.report_service.cate_static, function (item) {
                return item.sumMoney;
            });
            var len = moduleScope.viewData.report_service.cate_static.length;
            if (len > 0) {
                moduleScope.report_total_service.top_1 = {name: moduleScope.viewData.report_service.cate_static[len - 1].project_cateName, value: moduleScope.viewData.report_service.cate_static[len - 1].sumMoney, img: ""};
            }
            if (len > 1) {
                moduleScope.report_total_service.top_2 = {name: moduleScope.viewData.report_service.cate_static[len - 2].project_cateName, value: moduleScope.viewData.report_service.cate_static[len - 2].sumMoney, img: ""};
            }
            if (len > 2) {
                moduleScope.report_total_service.top_3 = {name: moduleScope.viewData.report_service.cate_static[len - 3].project_cateName, value: moduleScope.viewData.report_service.cate_static[len - 3].sumMoney, img: ""};
            }
        }
    }

    function drawDayPageChart() {
        performance_data.buildMonthReportData(moduleScope.dayCondition.year, moduleScope.dayCondition.month, function (error, reportData) {
            if (error) {
                utils.log("m-setting performance.js drawDayPageChart", error);
                utils.showGlobalMsg("获取数据失败");
                return;
            }
            moduleScope.reportData = reportData;
            //设置选中日期的报表数据
            if (reportData.year == moduleScope.dayCondition.year && reportData.month == moduleScope.dayCondition.month) {
                moduleScope.viewData = _.extend(moduleScope.viewData, {
                    report_service: reportData.report_service["day_statistics"][moduleScope.dayCondition.date - 1],
                    report_operate: reportData.report_operate["day_statistics"][moduleScope.dayCondition.date - 1],
                    report_consumer: reportData.report_consumer["day_statistics"][moduleScope.dayCondition.date - 1],
                    report_employee: reportData.report_employee["day_statistics"][moduleScope.dayCondition.date - 1]
                });
            }

            var chartDatas = [reportData.report_operate, reportData.report_service, reportData.report_consumer, reportData.report_employee];
            async.each(chartDatas,
                function (chartData, callback) {
                    performance_data.comparePrevDay(moduleScope.dayCondition.year, moduleScope.dayCondition.month, moduleScope.dayCondition.date, chartData, function (error, compare_result) {
                        if (error) {
                            callback(error);
                            return;
                        } else {
                            moduleScope.viewData["report_" + chartData.type].compare_prev = compare_result;
                            callback(null);
                        }
                    });
                },
                function (error) {
                    if (error) {
                        utils.log("m-setting performance.js drawDayPageChart", error);
                        utils.showGlobalMsg("获取周数据失败");
                        return;
                    }
                    calcTop();
                    drawChart();
                });
        });
    }

    function drawWeekPageChart() {
        performance_data.buildWeekReportData(moduleScope.weekCondition.currentDate.getFullYear(), moduleScope.weekCondition.currentDate, function (error, reportData) {
            if (error) {
                utils.log("m-setting performance.js drawWeekPageChart", error);
                utils.showGlobalMsg("获取数据失败");
                return;
            }
            moduleScope.reportData = reportData;

            moduleScope.viewData = _.extend(moduleScope.viewData, {
                report_service: reportData.report_service["period_statistics"],
                report_operate: reportData.report_operate["period_statistics"],
                report_consumer: reportData.report_consumer["period_statistics"],
                report_employee: reportData.report_employee["period_statistics"]
            });
            calcTop();
            drawChart();
        });
    }

    function drawMonthPageChart() {

        performance_data.buildMonthReportData(moduleScope.monthCondition.year, moduleScope.monthCondition.month, function (error, reportData) {
            if (error) {
                utils.log("m-setting performance.js drawMonthPageChart", error);
                utils.showGlobalMsg("获取数据失败");
                return;
            }
            moduleScope.reportData = reportData;
            moduleScope.viewData = _.extend(moduleScope.viewData, {
                report_service: reportData.report_service["period_statistics"],
                report_operate: reportData.report_operate["period_statistics"],
                report_consumer: reportData.report_consumer["period_statistics"],
                report_employee: reportData.report_employee["period_statistics"]
            });
            calcTop();
            drawChart();
        });
    }

    function drawChart() {
        var operate_chart_height = $("#report-operate .report-total").height();
        var employee_chart_height = $("#report-employee .report-total").height();
        var consumer_chart_height = $("#report-consumer").height() - $("#report-consumer .report-total").height();
        var service_chart_height = $("#report-service .report-total").height();
        //判断当前选中指标类型，画出指定的指标图标
        var kpi = $(".report-item-summary.selected")[0].dataset["kpi"];


        if (kpi == "operate") {
            reportService.drawOperateViewChart(moduleScope.viewData.report_operate, operate_chart_height);
        }
        if (kpi == "employee") {
            reportService.drawEmployeeViewChart(moduleScope.viewData.report_employee, employee_chart_height);
        }
        if (kpi == "service") {
            reportService.drawServiceViewChart(moduleScope.viewData.report_service, service_chart_height);
        }
        if (kpi == "consumer") {
            reportService.drawConsumerViewChart(moduleScope.viewData.report_consumer, consumer_chart_height);
        }
        moduleScope.$digest();
    }

    function switchMenu(params) {
        var today = new Date();
        if (moduleScope.chartMenuType == "day" && moduleScope.needReload && moduleScope.dayCondition.year == today.getFullYear() && moduleScope.dayCondition.date == today.getDate()) {
            global.eventEmitter.emitEvent('setting.performance.day.refresh');
        }

        if (moduleScope.chartMenuType == "week" && moduleScope.needReload && moduleScope.weekCondition.year == today.getFullYear() && moduleScope.weekCondition.currentDate.getWeekOfYear() == today.getWeekOfYear()) {
            global.eventEmitter.emitEvent('setting.performance.week.refresh');
        }

        if (moduleScope.chartMenuType == "month" && moduleScope.needReload && moduleScope.monthCondition.year == today.getFullYear() && moduleScope.monthCondition.month == today.getMonth()) {
            global.eventEmitter.emitEvent('setting.performance.month.refresh');
        }

    }

    function paramsChange(params) {

    }

    function ReportDrawService() {
        ReportDrawService.prototype = _.extend(ReportDrawService.prototype, {
            drawServiceViewChart: drawServiceViewChart,
            drawOperateViewChart: drawOperateViewChart,
            drawEmployeeViewChart: drawEmployeeViewChart,
            drawConsumerViewChart: drawConsumerViewChart
        });

        function drawServiceViewChart(service_data, height) {
            if (!service_data) {
                //显示空图
                return;
            }
            var datas = [], colors = Highcharts.getOptions().colors

            if (_.pairs(service_data.cate_static).length > 0) {
                _.each(service_data.cate_static, function (value, key) {
                    var tmp = parseFloat((value.sumMoney / service_data.total.all).toFixed(2))
                    datas.push({
                        name: value.project_cateName,
                        y: tmp
                    });
                });
            } else {
                datas.push({
                    name: "暂无数据",
                    dataLabels: {
                        enabled: true,
                        format: "暂无数据 0%"
                    },
                    color: "#eeeeee",
                    y: 100
                });
            }

            $('#report-service .report-chart').highcharts({
                chart: {
                    height: height,
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false
                },
                title: {
                    text: ''
                },
                tooltip: {
                    enabled: false
                },
                plotOptions: {
                    pie: {
                        center: ['50%', '50%'],
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            color: '#398acb',
                            connectorColor: '#000000',
                            format: '<b>{point.name}</b>: {point.percentage:.1f} %'
                        }
                    }
                },
                series: [
                    {
                        type: 'pie',
                        name: '',
                        size: '70%',
                        dataLabels: {
                            style: {
                                fontSize: '1.2rem'
                            }
                        },
                        data: datas
                    }
                ]
            });

        }

        function drawOperateViewChart(report_operate, height) {
            if (!report_operate) {
                //显示空图
                return;
            }
            var datas = [], colors = Highcharts.getOptions().colors;

            var cash_consume = (report_operate.total.all != 0) ? (report_operate.total_detail.cash_consume / report_operate.total.all) * 100 : 25;
            var card_consume = (report_operate.total.all != 0) ? (report_operate.total_detail.card_consume / report_operate.total.all) * 100 : 25;
            var card_new = (report_operate.total.all != 0) ? (report_operate.total_detail.card_new / report_operate.total.all) * 100 : 25;
            var card_recharge = (report_operate.total.all != 0) ? (report_operate.total_detail.card_recharge / report_operate.total.all) * 100 : 25;

            if (report_operate.total.all == 0) {
                datas.push({
                    name: "暂无数据",
                    y: 100,
                    dataLabels: {
                        enabled: true,
                        format: "暂无数据 0%"
                    },
                    color: "#eeeeee"
                });
            } else {
                datas.push({
                    name: "现金消费",
                    y: parseFloat(cash_consume.toFixed(2)),
                    color: Highcharts.Color(colors[0]).get()
                });
                datas.push({
                    name: "划卡消费",
                    y: parseFloat(card_consume.toFixed(2)),
                    color: Highcharts.Color(colors[1]).get()
                });
                datas.push({
                    name: "办卡",
                    y: parseFloat(card_new.toFixed(2)),
                    color: Highcharts.Color(colors[2]).get()
                });
                datas.push({
                    name: "充卡",
                    y: parseFloat(card_recharge.toFixed(2)),
                    color: Highcharts.Color(colors[3]).get()
                });
            }


            $('#report-operate .report-chart').highcharts({
                chart: {
                    height: height,
                    type: 'pie'
                },
                title: {
                    text: ''
                },
                yAxis: {
                    title: {
                        text: ''
                    }
                },
                plotOptions: {
                    pie: {
                        shadow: false,
                        center: ['50%', '50%'],
                        dataLabels: {
                            enabled: true,
                            color: '#398acb',
                            connectorColor: '#000000'
                        }
                    }
                },
                tooltip: {
                    enabled: false
                },
                series: [
                    {
                        name: 'operate',
                        data: datas,
                        size: '80%',
                        innerSize: '50%',
                        dataLabels: {
                            formatter: function () {
                                // display only if larger than 1
                                return this.y > 1 ? '<b>' + this.point.name + ':</b> ' + this.y + '%' : null;
                            },
                            style: {
                                fontSize: '1.4rem'
                            }
                        }
                    }
                ]
            });
        }

        function drawEmployeeViewChart(employeeData, height) {
            var colors = Highcharts.getOptions().colors;
            var datas = {
                    name: "员工业绩",
                    dataLabels: {
                        enabled: true,
                        rotation: 0,
                        color: "#398acb",
                        align: 'right',
                        x: 4,
                        y: 0,
                        formatter: function () {
                            return  '￥' + this.point.y;
                        },
                        style: {
                            fontSize: '1.4rem'
                        }
                    },
                    data: []
                },
                plotOptions = {
                    column: {
                        pointWidth: 30,
                        color: "#1688fa"

                    }
                },
                categories = [];

            if (_.pairs(employeeData.employee).length > 0) {
                _.each(employeeData.employee, function (item) {
                    datas.data.push(item.value);
                    categories.push(item.name);
                })
            } else {
                datas.dataLabels.color = "#fff";
                plotOptions.column.color = "#eeeeee";
                datas.data.push(100);
                categories.push("暂无数据");
            }


            $('#report-employee .report-chart').highcharts({
                chart: {
                    type: 'column',
                    height: height,
                    margin: [ 20, 30, 40, 50]
                },
                title: {
                    text: ''
                },
                plotOptions: plotOptions,
                xAxis: {
                    categories: categories,
                    labels: {
                        rotation: -45,
                        align: 'right',
                        style: {
                            fontSize: '13px',
                            fontFamily: 'Verdana, sans-serif'
                        }
                    }
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: ''
                    }
                },
                legend: {
                    enabled: false
                },
                tooltip: {
                    enabled: false
                },
                series: [datas]
            });

        }

        function drawConsumerViewChart(consumerData, height) {
            var colors = Highcharts.getOptions().colors;

            var datas = [], xAxis = [];

            datas[0] = {
                name: "",
                color: "#1688fa",
                dataLabels: {
                    enabled: true,
                    rotation: 0,
                    color: "#398acb",
                    align: 'right',
                    x: 4,
                    y: 0,
                    formatter: function () {
                        if (this.point.y > 0) {
                            return  this.point.y + '人';
                        } else {
                            return  '';
                        }
                    },
                    style: {
                        fontSize: '1.4rem'
                    }
                },
                data: []
            };
            if (consumerData.consumer.memberNo + consumerData.consumer.tempNo > 0) {
                _.each(consumerData.consumer.xaxis_points, function (item) {
                    datas[0].data.push(item.memberNo + item.tempNo);
                    xAxis.push(item.title);
                })
            } else {
                datas[0].data.push(0);
                datas[0].color = "#eeeeee";
                xAxis.push("暂无数据");
            }

            $('#report-consumer .report-chart').highcharts({
                chart: {
                    height: height,
                    type: 'line'
                },
                title: {
                    text: ''
                },
                subtitle: {
                    text: ''
                },
                legend: {
                    enabled: false
                },
                xAxis: {
                    categories: xAxis
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: '人次'
                    }
                },
                tooltip: {
                    enabled: false
                },
                plotOptions: {
                    line: {
                        dataLabels: {
                            enabled: true
                        },
                        enableMouseTracking: false
                    }
                },
                series: datas
            });

        }
    }

})
;