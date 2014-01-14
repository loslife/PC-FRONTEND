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
    require("./setting.css")

    //基础服务
    var utils = require("mframework/package").utils, 			        //全局公共函数
        database = require("mframework/package").database,		//数据操作服务
        db = null,		//数据操作服务
        cache = utils.getCache();


    var moduleScope;

    function loadModelAsync(params, callback) {
        db = database.getDBInstance();
        var model = {
            productCategories:[],
            productCategorySelected:"",
            productViewArray:{},
            newProductRecord:{},
            newServiceCateRecord:{},
            action:"index",
            feedback:""

        };

        model.memberList = [];
        model.condition = "";

        if(YILOS.onDeviceReady){
            initData(model,callback)
        }else{
            global.eventEmitter.addListener("data-init-success",function(){
                initData(model,callback)
            });
        }


        callback(model);
    }

    function initData(model,callback){


    }
    function initContoller($scope, $parse, $q, $http,$location) {
        moduleScope = $scope;
        $scope.back_setting = function () {
            $location.path("#/m-setting/setting");
        };
    }

    function init() {

    }


    function afterPageLoaded() {
      /*  $("#m-setting-aboutlos-area").height($(window).height());
        $(".m-aboutlos-content").height($(window).height() - $(".m-setting-title").outerHeight()-$("#suggestion-feed").outerHeight()-100);*/
        $(".m-newGuide-content").height($(window).height() - $(".m-setting-title").outerHeight());
    }


    function switchMenu(params) {

    }

    function paramsChange(params) {

    }
});
