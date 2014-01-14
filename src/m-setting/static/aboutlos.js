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
    var utils = require("mframework/package").utils, 			        //全局公共函数
        database = require("mframework/package").database,		//数据操作服务
        db = null,		//数据操作服务
        cache = utils.getCache();


    var moduleScope;
    //$.t('setting.aboutlos')
    function loadModelAsync(params, callback) {
        db = database.getDBInstance();
        var model = {
            productCategories: [],
            productCategorySelected: "",
            productViewArray: {},
            newProductRecord: {},
            newServiceCateRecord: {},
            action: "index",
            feedback: ""

        };

        model.memberList = [];
        model.condition = "";

        model.action = "aboutlos";
        if (params["action"]) {
            model.action = params["action"];
            model.prevHref = "#/m-setting/setting";
        }
        model.versionName = "";
        model.shearch = {
            keyWord: ""
        };
        if (window.LosNailActivity) {
            var versionName = window.LosNailActivity.getVersion();
            model.versionName = versionName;

        }

        if (YILOS.onDeviceReady) {
            initData(model, callback)
        } else {
            global.eventEmitter.addListener("data-init-success", function () {
                initData(model, callback)
            });
        }
        callback(model);


    }

    function initData(model, callback) {

    }

    function initContoller($scope, $parse, $q, $http, $location) {
        moduleScope = $scope;

        $scope.suggestion = function () {
            $scope.action = "suggestion";
        }
        $scope.backIndex = function () {
            if ($scope.prevHref) {
                $location.path($scope.prevHref);
            } else {
                $scope.action = "aboutlos";
            }
        }

        $scope.checkNewVersion = function () {
            if (window.LosNailActivity) {
                window.LosNailActivity.checkNewVersion();
            }
        }
        $scope.back_setting = function () {
            $location.path("#/m-setting/setting");
        };
        $scope.sendFeedback = function () {
            if ("" == $scope.feedback.replace(/(^\s*)|(\s*$)/g, "")) {
                utils.showAreaFailMsg("#m-aboutlos-suggestion", "尚未输入任何内容");
                return;
            }
            $.ajax({
                type: "post",
                async: true,
                url: global["_g_server"].serviceurl + "/nail/addFeedback",
                data: {
                    username: YILOS.USERNAME,
                    enterpriseId: YILOS.ENTERPRISEID,
                    feedback: $scope.feedback
                },
                dataType: "json",
                success: function (data) {
                    if (data && data.code == "0") {
                        utils.showAreaSuccessMsg("#m-aboutlos-suggestion", "意见反馈成功");
                        $scope.feedback = "";
                        $scope.$digest();
                    } else {
                        utils.showAreaFailMsg("#m-aboutlos-suggestion", "意见反馈失败");
                    }
                },
                error: function (error) {
                    utils.showAreaFailMsg("#m-aboutlos-suggestion", "意见反馈失败");
                    utils.log("m-setting aboutlos.js sendFeedback", error);
                }
            });
            // 调用接口，上传日志文件
            if(window.LosNailActivity){
                window.LosNailActivity.userFeedback();
            }
        }
    }

    function init() {

    }


    function afterPageLoaded() {
        $("#m-setting-aboutlos-area").height($(window).height());
        $(".m-aboutlos-content").height($(window).height() - $(".m-setting-title").outerHeight() - $("#suggestion-feed").outerHeight() - 100);
    }


    function switchMenu(params) {
        if (params["action"]) {
            moduleScope.action = params["action"];
            moduleScope.prevHref = "#/m-setting/setting";
        } else {
            moduleScope.action = "aboutlos";
            moduleScope.prevHref = "";
        }
    }

    function paramsChange(params) {

    }
});
