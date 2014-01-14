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

    //基础服务
    var utils = require("mframework/static/package").utils, 			        //全局公共函数

        CONSTANT = {										    //模块私有常量
            "_abbr": "mmcl",                                    //模块私有ID前缀，全局唯一
            "moduleId": "member",                               //模块ID，全局唯一
            "featureId": "memberCardList",                      //模块特性ID，模块内部唯一，用以标示当前模块，多数用此ID区分多个特性

            "dbName": "member",
            "tableName": "memberCard",
            "resourceId": "memberCard",

            "member_dbName": "member",
            "member_tableName": "member",
            "member_resourceId": "member",

            "crBill_dbName": "workspace",
            "crBill_tableName": "serviceBill",
            "crBill_resourceId": "serviceBill",

            "rrBill_dbName": "workspace",
            "rrBill_tableName": "rechargeMemberBill",
            "rrBill_resourceId": "rechargeMemberBill"
        };

    var moduleScope;

    function loadModelAsync(params, callback) {
        var model = {};

        model.memberCardList = [];
        model.rechargeRecordList = [];
        model.consumerRecordList = [];

        model.params = params;
        model.search = {
            keyWord: ""
        };

        model.condition = params.category === "all" ? "" : ("{\"memberCardCategoryId\":\"" + params.category + "\"}");
        model.condition = encodeURIComponent(model.condition);

        datas.queryPageData(CONSTANT.dbName, CONSTANT.tableName, utils.global.graphPath + "/" + utils.global.enterpriseId + "/" + CONSTANT.resourceId + "?q=" + model.condition, 1, 10, null)
            .then(function (records) {
                if (records.length != 0) {
                    model.memberCardList = records;
                }
                else {
                    //没有查询到记录
                }
                callback(model);
            },
            function (error) {
                //错误处理
                console.log(error);
                callback(model);
            });
    }


    function initContoller($scope, $parse, $q, $http) {
        moduleScope = $scope;

        var operation_div = '<ul class="tbl-opeation"> \
            <li class="inline"><a ng-click="showMemberDetail(row.getProperty(col.field))" href=""><i class="icon-trash"></i>会员详情</a></li> \
            <li class="inline"><a ng-click="consumerRecord(row.getProperty(col.field))" href=""><i class="icon-trash"></i>消费记录</a></li> \
            <li class="inline"><a ng-click="rechargeRecord(row.getProperty(col.field))" href=""><i class="icon-trash"></i>充值记录</a></li> \
            </ul>';


        var dateTimeTemplate = '<p>{{convertTime(row.getProperty(col.field))}}</p>';

        $scope.convertTime = function (key) {
            if (_.isNumber(parseInt(key))) {
                var dateTemp = new Date(parseInt(key));
                return dateTemp.getFullYear() + "-" + (dateTemp.getMonth() + 1) + "-" + dateTemp.getDate();
            }
            return key;
        };

        $scope.getPagedDataAsync = function (pageSize, page) {
            datas.queryPageData(CONSTANT.dbName, CONSTANT.tableName, utils.global.graphPath + "/" + utils.global.enterpriseId + "/" + CONSTANT.resourceId + "?q=" + $scope.condition, page, pageSize, null)
                .then(function (records) {
                    $scope.memberCardList = records;
                    $scope.$digest();
                },
                function (error) {
                    //错误处理
                });
        };
        $scope.$watch('pagingOptions', function (newVal, oldVal) {
            if (newVal !== oldVal && (newVal.currentPage !== oldVal.currentPage || newVal.pageSize !== oldVal.pageSize)) {
                $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
            }
        }, true);


        $scope.pagingOptions = {
            pageSizes: [10, 30, 60],
            pageSize: 10,
            currentPage: 1
        };
        $scope.tblDefs = [
            {field: "cardNo", displayName: "会员卡号", width: '11%'},
            {field: "memberCardCategoryName", displayName: "卡类型", width: '11%'},
            {field: "startDate", displayName: "开卡时间", width: '11%', cellTemplate: dateTimeTemplate},
            {field: "lastUsedDate", displayName: "最后使用日期", width: '11%', cellTemplate: dateTimeTemplate},
            {field: "phoneMobile", displayName: "手机号码", width: '11%'},
            {field: "totalMoney", displayName: "余额", width: '11%'},
            {field: "totalScore", displayName: "积分", width: '11%'},
            {field: "totalConsumption", displayName: "累计消费", width: '11%'},
            {field: 'id', displayName: '查看', cellTemplate: operation_div}
        ];
        $scope.gridOptions = {
            data: 'memberCardList',
            enablePaging: true,
            showFooter: true,
            footerRowHeight: 36,
            columnDefs: 'tblDefs',
            pagingOptions: $scope.pagingOptions
        };

        $scope.search_keypress = function ($event) {
            if ($event.keyCode == 13) {
                $scope.searchMember();
            }
        };

        $scope.searchMember = function () {
            if ($scope.search.keyWord !== "") {
                if ($scope.params.category !== "all") {
                    $scope.condition = '{"memberCardCategoryId":"' + $scope.params.category +
                        '","$or":[{"memberCardCategoryName":{"$regex":"^.*' + this.search.keyWord + '.*$"}},' +
                        '{"phoneMobile":{"$regex":"^.*' + this.search.keyWord + '.*$"}},' +
                        '{"totalMoney":{"$regex":"^.*' + this.search.keyWord + '.*$"}},' +
                        '{"cardNo":{"$regex":"^.*' + this.search.keyWord + '.*$"}}]}';
                }
                else {
                    $scope.condition = '{"$or":[{"memberCardCategoryName":{"$regex":"^.*' + this.search.keyWord + '.*$"}},' +
                        '{"phoneMobile":{"$regex":"^.*' + this.search.keyWord + '.*$"}},' +
                        '{"totalMoney":{"$regex":"^.*' + this.search.keyWord + '.*$"}},' +
                        '{"cardNo":{"$regex":"^.*' + this.search.keyWord + '.*$"}}]}';
                }
                $scope.condition = encodeURIComponent($scope.condition);
                $scope.pagingOptions.currentPage = 1;
                $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
            }
            else {
                if ($scope.params.category !== "all") {
                    $scope.condition = '{"memberCardCategoryId":"' + $scope.params.category + '"}';
                }
                else {
                    $scope.condition = "";
                }
                $scope.condition = encodeURIComponent($scope.condition);
                $scope.pagingOptions.currentPage = 1;
                $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
            }
        };

        $scope.rrCondition = "";
        $scope.getRrPagedDataAsync = function (pageSize, page) {
            datas.queryPageData(CONSTANT.rrBill_dbName, CONSTANT.rrBill_tableName, utils.global.graphPath + "/" + utils.global.enterpriseId + "/" + CONSTANT.rrBill_resourceId + "?q=" + $scope.rrCondition, page, pageSize, null)
                .then(function (records) {
                    $scope.rechargeRecordList = records;
                    $scope.$digest();
                },
                function (error) {
                    //错误处理
                });
        };
        $scope.$watch('rrpagingOptions', function (newVal, oldVal) {
            if (newVal !== oldVal && (newVal.currentPage !== oldVal.currentPage || newVal.pageSize !== oldVal.pageSize)) {
                $scope.getRrPagedDataAsync($scope.rrpagingOptions.pageSize, $scope.rrpagingOptions.currentPage);
            }
        }, true);
        $scope.rrpagingOptions = {
            pageSizes: [10, 30, 60],
            pageSize: 10,
            currentPage: 1
        };
        var totalMoney = '<p>{{(row.getProperty(col.field)).totalMoney}}</p>';
        var rechargeMoney = '<p>{{(row.getProperty(col.field)).cash}}</p>';
        $scope.rrTabHead = [
            {field: "rechargeTime", displayName: "充值时间", width: "25%", cellTemplate: dateTimeTemplate},
            {field: "pay", displayName: "充值金额", width: "25%", cellTemplate: rechargeMoney},
            {field: "memberCard", displayName: "剩余总额", width: '25%', cellTemplate: totalMoney},
            {field: "employeeName", displayName: "办理人"}
        ];
        $scope.rrGridOptions = {
            data: 'rechargeRecordList',
            columnDefs: 'rrTabHead',
            enablePaging: true,
            showFooter: true,
            footerRowHeight: 36,
            pagingOptions: $scope.rrpagingOptions
        };


        $scope.crCondition = "";
        $scope.getCrPagedDataAsync = function (pageSize, page) {
            datas.queryPageData(CONSTANT.crBill_dbName, CONSTANT.crBill_tableName, utils.global.graphPath + "/" + utils.global.enterpriseId + "/" + CONSTANT.crBill_resourceId + "?q=" + $scope.crCondition, page, pageSize, null)
                .then(function (records) {
                    $scope.consumerRecordList = records;
                    $scope.$digest();
                },
                function (error) {
                    //错误处理
                });
        };
        $scope.$watch('crpagingOptions', function (newVal, oldVal) {
            if (newVal !== oldVal && (newVal.currentPage !== oldVal.currentPage || newVal.pageSize !== oldVal.pageSize)) {
                $scope.getCrPagedDataAsync($scope.crpagingOptions.pageSize, $scope.crpagingOptions.currentPage);
            }
        }, true);
        $scope.crpagingOptions = {
            pageSizes: [10, 30, 60],
            pageSize: 10,
            currentPage: 1
        };
        var productTemplate = '<p>{{getProductStr(row.getProperty(col.field))}}</p>';

        $scope.getProductStr = function (productList) {
            var proStr = "";
            if (_.isArray(productList)) {
                _.each(productList, function (product) {
                    proStr += product.name + ",";
                });
            }
            proStr = proStr.slice(0, proStr.length - 1);
            return proStr;
        };

        $scope.crTabHead = [
            {field: "date", displayName: "消费时间", width: "20%", cellTemplate: dateTimeTemplate},
            {field: "productRecords", displayName: "消费项目", width: "35%", cellTemplate: productTemplate},
            {field: "amount", displayName: "消费金额", width: '20%'},
            {field: "username", displayName: "服务人员"}
        ];
        $scope.crGridOptions = {
            data: 'consumerRecordList',
            columnDefs: 'crTabHead',
            enablePaging: true,
            showFooter: true,
            footerRowHeight: 36,
            pagingOptions: $scope.crpagingOptions
        };

        $scope.consumerRecord = function (serviceId) {
            $scope.crCondition = '{"memberCardId":"' + serviceId + '"}';
            $scope.crpagingOptions.currentPage = 1;
            $scope.getCrPagedDataAsync($scope.crpagingOptions.pageSize, $scope.crpagingOptions.currentPage);
            $("#pmcl_cr_dialog").modal("show");
        };

        $scope.rechargeRecord = function (serviceId) {
            $scope.rrCondition = '{"memberCardId":"' + serviceId + '"}';
            $scope.rrCondition = encodeURIComponent($scope.rrCondition);
            $scope.rrpagingOptions.currentPage = 1;
            $scope.getRrPagedDataAsync($scope.rrpagingOptions.pageSize, $scope.rrpagingOptions.currentPage);
            $("#pmcl_rr_dialog").modal("show");
        };

        $scope.showMemberDetail = function (serviceId) {
            var that = this;
            var cardData = null;
            _.each(this.memberCardList, function (item) {
                if (item.id == serviceId) {
                    cardData = _.clone(item);
                }
            });
            $scope.cardNo = cardData.cardNo;
            var condition = "{\"id\":\"" + cardData.memberId + "\"}";

            condition = encodeURIComponent(condition);
            datas.getResource(utils.global.graphPath + "/" + utils.global.enterpriseId + "/" + CONSTANT.member_resourceId + "?q=" + condition, null)
                .then(function (result) {
                    if (result.length > 0) {
                        $scope.memberDeatilData = result[0];
                        $scope.$digest();
                    }
                });
        };
    }

    function init() {

    }


    function afterPageLoaded() {

    }


    function switchMenu(params) {
    }

    function paramsChange(params) {
        moduleScope.params = params;
        moduleScope.condition = params.category === "all" ? "" : ("{\"memberCardCategoryId\":\"" + params.category + "\"}");
        moduleScope.condition = encodeURIComponent(moduleScope.condition);

        datas.queryPageData(CONSTANT.dbName, CONSTANT.tableName, utils.global.graphPath + "/" + utils.global.enterpriseId + "/" + CONSTANT.resourceId + "?q=" + moduleScope.condition, 1, 10, null)
            .then(function (records) {
                if (records.length != 0) {
                    moduleScope.memberCardList = records;
                    moduleScope.$digest();
                }
                else {
                    moduleScope.memberCardList = [];
                    moduleScope.$digest();
                }
            },
            function (error) {
                //错误处理
            });
    }
});