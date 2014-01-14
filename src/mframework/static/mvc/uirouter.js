define(function (require,exports,module) {
    var framework = require("./framework"),
        urls =  require("../utils/urls"),
        defaultModuleId = "m-pos",
        defaultFeatureId="checkout";	 			//业务公共处理函数
    var self = this;
    exports.init = initModule;
    function initModule(moduleMap,options){
        self.moduleFactory =  moduleMap || moduleFactory;
        self._initSubmenu = _initSubmenu;
        self.defaultModuleId = defaultModuleId;
        self.defaultFeatureId = defaultFeatureId;

        if(options){
            self.options = options;
            self._initSubmenu = options.initSubmenuCallback || _initSubmenu;
            self._beforeInit = options.beforeInitCallback;
            self.defaultModuleId = options.defaultModuleId || defaultModuleId;
            self.defaultFeatureId = options.defaultFeatureId || defaultFeatureId;
        }
        var modules = urls.parseLocation2Pagelet(window.location.href);
        var moduleId = self.defaultModuleId;
        var featureId = self.defaultFeatureId;

        var params = "";
        if(modules.length>0){
            moduleId = modules[0].pageletName;
            featureId = modules[0].stateName;
            params = modules[0].queryParam;
        }
        if(self._beforeInit){
            self._beforeInit(function(){
                _init(moduleId,featureId);
            });
        }else{
            _init(moduleId,featureId);
        }

    }

    var _init = function(moduleId,featureId){
        var featureInstance = self.moduleFactory[moduleId][featureId];
        if(!framework.getAppModule()){
            var appModule = framework.initAppModule();
            //初始化location服务，监听地址栏url，加载不同视图
            var $location = framework.getAngularService("$location");
            if(!self.afterfirstLoad){
                loadLocation();
                framework.on('$locationChangeSuccess',function(event){
                    loadLocation();
                });
            }
            function loadLocation(){
                var params = {};
                var modules = urls.parseLocation2Pagelet($location.absUrl());
                //根据地址栏获取新的module
                if(modules.length>0){
                    moduleId = modules[0].pageletName;
                    featureId = modules[0].stateName;
                    params = modules[0].queryParam;
                }
                featureInstance = self.moduleFactory[moduleId][featureId];

                planx.viewMap.currentFeatureId = featureId;
                if(loadLocation.moduleId == moduleId && loadLocation.featureId == featureId){
                    if(params != loadLocation.params){
                        if(_.isFunction(self.moduleFactory[moduleId][featureId].paramsChange)){
                            self.moduleFactory[moduleId][featureId].paramsChange(params);
                        }
                    }
                    return;
                }
                //切换菜单选中
                $(".nav-collapse>ul>li").removeClass("active");
                $(".nav-collapse>ul>li[data-moduleid='"+moduleId+"']").addClass("active");
                planx.layout.showAll();

                $(".featureSpace").each(function(i){
                    var feature = $(this);
                    feature.hide();
                });
                var featureArea = getFeatureAreaObj(moduleId,featureId);

                if(featureArea.size()>0){
                    featureArea.show();
                    if(_.isFunction(featureInstance.switchMenu)){
                        featureInstance.switchMenu(params);
                        resizeLayout();
                    }

                }else{
                    loadFeatureContent("f-workspace", moduleId,featureId,featureInstance,function(){
                        loadFeaturePage(featureInstance,moduleId,featureId,params);
                        resizeLayout()
                    });
                }
                //缓存本次模块信息
                loadLocation.moduleId = moduleId;
                loadLocation.featureId = featureId;
                loadLocation.params = params;
            }
            loadLocation();

        }
        function resizeLayout(){
            if(!self.windowHeight){
                self.windowHeight = $(window).height();
            }
            if(featureInstance.fullscreen){
                $("#main-container").height(self.windowHeight);
                $(".f-workspace").css("padding-top",0);
                $("#main-container").css("top",0);
                $(".featureSpace .m-two-column-area").height(self.windowHeight - $(".featureSpace  .m-setting-title").outerHeight());
                $("#header-container").hide();
            }else{
                $("#header-container").show();
                $("#main-container").height(self.windowHeight - $("#header-container").outerHeight());
            }
        }
        function afterPageLoaded(){
            if(featureInstance && _.isFunction(featureInstance.afterPageLoaded)){
                featureInstance.afterPageLoaded();
            }
        }
        function loadFeaturePage(featureInstance,moduleId,featureId,params){
            getFeatureAreaObj(moduleId,featureId).hide();
            self.moduleFactory[moduleId][featureId].init(params);
            var moduleController = self.moduleFactory[moduleId][featureId].initContoller;
            if(!_.isFunction(moduleController)){
                moduleController = function($scope){};
            }
            var loadModel = self.moduleFactory[moduleId][featureId].loadModel;
            var loadModelAsync = self.moduleFactory[moduleId][featureId].loadModelAsync;


            if(_.isFunction(loadModel)){
                moduleModel = loadModel(params);
                _compileAngularFragment(featureInstance,$('#'+moduleId+"-"+featureId+"-area"),moduleModel,moduleId,featureId,moduleController,afterPageLoaded);

            }else if( _.isFunction(loadModelAsync)){
                loadModelAsync(params,function(moduleModel){
                    _compileAngularFragment(featureInstance,$('#'+moduleId+"-"+featureId+"-area"),moduleModel,moduleId,featureId,moduleController,afterPageLoaded);
                });

            }else{
                moduleModel = {};
            }
        }
        _initSubmenu();
    }
    /**
     * 加载每个二级子菜单对应的页面内容
     * @param  {[type]} argument [description]
     * @return {[type]}          [description]
     */
    function  loadFeatureContent(parentId,moduleId,featureId,featureInstance,callback) {
        var featureViewUrl = "";
        if (global["_g_env"] == "dev") {
            featureViewUrl = "/"+moduleId+"/"+featureId+"_zh_CN.html";
            if(featureInstance.featurePath){
                featureViewUrl =  "/"+moduleId+"/static/"+featureInstance.featurePath+"/"+featureId+"_zh_CN.html";
            }
        }
        // For production or image
        else {
            var language = self.options["LANGUAGE"];
            if(language){
                featureViewUrl = "/"+moduleId+"/static/"+featureId+"-min_"+language+".html";
                if(featureInstance.featurePath){
                    featureViewUrl =  "/"+moduleId+"/static/"+featureInstance.featurePath+"/"+featureId+"-min_"+language+".html";
                }
            }else{
                featureViewUrl = "/"+moduleId+"/static/"+featureId+"-min.html";
                if(featureInstance.featurePath){
                    featureViewUrl =  "/"+moduleId+"/static/"+featureInstance.featurePath+"/"+featureId+"-min.html";
                }
            }

        }
        featureViewUrl = "../.."+featureViewUrl;
        $.ajax({
	  			 type:"GET",
	  			 timeout:10000,
	  			 dataType: "html",
	  			 async: false,
	  			 cache: false,
	  			 url: featureViewUrl,
	  			 success: function(data) {
	                $('#'+parentId).append(data);
	                callback();
	  			 },
	  			 error: function(xhr,msg){
	  			   var msg = "Sorry but there was an error: ";
                	$("#error").html(msg + xhr.status + " " + xhr.statusText);
	  			 }
	  			});
	  

    }
    /**
     * 初始化各子模块的Angular编译和界面片段执行
     * @param  {[type]} moduleDom        [description]
     * @param  {[type]} moduleModel      [description]
     * @param  {[type]} moduleId         [description]
     * @param  {[type]} featureId        [description]
     * @param  {[type]} moduleController [description]
     * @return {[type]}                  [description]
     */
    function _compileAngularFragment(featureInstance,moduleDom,moduleModel,moduleId,featureId,moduleController,afterPageLoaded){
        var begin = new Date().getTime();
        var $compile = framework.getAngularService("$compile");
        var lastScope,locals={},
            link = $compile(moduleDom.contents()),
            current = {},
            controller;
        destroyLastScope();
        lastScope = current.scope = angular.extend(framework.getAngularService("$rootScope").$new(),moduleModel);
        if (moduleController) {
            locals.$scope = lastScope;
            controller = framework.getAngularService("$controller")(moduleController, locals);
            moduleDom.contents().data('$ngControllerController', controller);
        }
        link(lastScope);
        
        try{
            lastScope.$digest();
        }catch (e){

        }
        $("#index-loadding-area").remove();
        //初始化公共控件
        if(featureId == planx.viewMap.currentFeatureId){
            getFeatureAreaObj(moduleId,featureId).show();
        }else{
            getFeatureAreaObj(moduleId,featureId).remove();
        }
        afterPageLoaded();
        
        function destroyLastScope() {
            if (lastScope) {
                lastScope.$destroy();
                lastScope = null;
            }
        }
        function clearContent() {
            moduleDom.html('');
            destroyLastScope();
        }

    }
    /*
     初始化子菜单交互动作
     */
    function _initSubmenu() {
        var submenu = $("nav.submenu");
        submenu.on("click", "div.haschild", function() {
            var fa = $(this);
            if(fa.is(".opened"))
            {
                fa.removeClass("opened").addClass("closed");
                fa.next().hide();
            }
            else
            {
                fa.removeClass("closed").addClass("opened");
                fa.next().show();
            }
        });
    }

    function getFeatureAreaObj(moduleId,featureId){
        return  $("#"+moduleId+"-"+featureId+"-area");
    }
})
