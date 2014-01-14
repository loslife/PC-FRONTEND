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
    require("./show.css");
    if(cordova && cordova.platformId == "ios"){
        require.async("./show_ios.css", function(b) {})
    }
    //基础服务
    var utils = require("mframework/static/package").utils, 			//全局公共函数
        widgets = require("m-widgets/static/package"), 			//全局公共函数
        database = require("mframework/static/package").database,		//数据操作服务
        db = null,		//数据操作服务
        cache = utils.getCache();
    //模块angular模型引用,方便非angular方法调用angular内部方法
    var moduleScope;
    var Pull =  widgets.WIDGETS["pull"];
    var self = this;
    /**
     * 初始化模块模型数据
     * 主要要在模型初始完成后调用callback(model);
     * @param  {[type]}   params   [地址栏请求参数]
     * @param  {Function} callback [页面加载回调]
     * @return {[type]}            [无返回值]
     */
    function loadModelAsync(params, callback) {
        db = database.getDBInstance();
        var model = {
            w_width:0,
            items:[],
            pages:[],
            cateSelected:"",
            categories:{},
            showViewArray:[],
            showSelected:{
                name:"",
                img:"",
                desc:""
            },
            categoryMap:{},
            pageSize:27,
            pageNo:1,
            action:"index"
        };
        initPageModel(model,callback);
    }

    //页面模型数据初始化
    function initPageModel(model,callback){
        if(!_.isEmpty(model.categories)){
            async.waterfall([_queryItems],function(error){
                if(error){
                    //TODO 错误处理
                    utils.showGlobalMsg("获取记录失败",2000);
                    callback(model);
                }
                else{
                    model.needReload = false;
                    callback(model);
                }
            })
        }else{
            async.waterfall([queryCate,_queryItems],function(error){
                if(error){
                    utils.showGlobalMsg("获取记录失败",2000);
                    //TODO 错误处理
                    callback(model);
                }
                else{
                    model.needReload = false;
                    callback(model);
                }
            })
        }

        function _queryItems(callback){
            queryItems(model,callback)
        }
        function queryCate(callback){
            db.transaction(function(tx) {
                tx.executeSql("select a.id ,a.name,a.img from tb_showitem_cate a",[],function(tx,result){
                    var len = result.rows.length;
                    for(var i=0;i<len;i++) {
                        var tmp =   result.rows.item(i);
                        if(i==0 && !model.productCategorySelected){
                            tmp.selected =true;
                            model.productCategorySelected = tmp.id;
                        }
                        model.categories[tmp.id] = tmp;
                    }
                    cache.set("show.productCategories",model.categories,true);
                    callback(null);

                },function(tx,error){
                    console.log("error");
                    console.log(error);
                    callback(error);
                })
            });
        }
    }

    function queryItems(model,callback){
        var pageArrayView = [];
        db.transaction(function(tx) {
            tx.executeSql("select a.categoryId c_id,a.img c_img,a.id,a.name,a.img,a.like,a.share,a.create_date,a.desc " +
                "from tb_showitem a where a.categoryId like '%"+model.productCategorySelected+"%' limit "+(model.pageNo-1)*model.pageSize+","+model.pageSize,[],function(tx,result){
                var len = result.rows.length;
                if(len<model.pageSize){
                    setTimeout(function(){
                        $("#m-nail-show-show-area #wrapper .p-up").hide();
                    },100);
                }else{
                    $("#m-nail-show-show-area #wrapper .p-up").show();
                }

                if(len>0){

                    for(var i=0;i<len;i++) {
                        var tmp =   result.rows.item(i);
                        tmp.pageNo = model.pageNo;
                        if(i==0 & !model.productSelected){
                            tmp.selected = true;
                            model.productSelected = tmp;
                            convertItemCate(model.categories,model.productSelected);
                        }
                        if(!tmp.c_id){
                            continue;
                        }
                        pageArrayView.push(tmp);
                    }
                    showItemView(model,pageArrayView);
                    model.showViewArray.push(pageArrayView);
                    model.pageNo++;
                }
                callback(null,len);

            },function(tx,error){
                console.log("error");
                console.log(error);
                callback(error);
            })
        });
    }

    function convertItemCate(productCategories,product){
        var cates = [];
        if(product && product.c_id){
            var cateIds = product.c_id.split(",");
            _.each(cateIds,function(id){
                if(productCategories[id]){
                    cates.push({
                        id:id,
                        name:productCategories[id].name
                    })
                }
            })
            product.cateList = cates;
        }
    }

    function showItemView(model,items){
        var tmp = {};
        tmp = _.clone(items);
        model.w_width = $(window).width()-24;
        var unit_width  = ($("#f-workspace").width()-24) /12;
        model.page_height = unit_width*8;


        var width_1 = unit_width;
        var height_1 = unit_width;
        var width_2 = 2*unit_width;
        var width_3 = 3*unit_width;

        var height_2 = 2*unit_width;
        var height_3 = 3*unit_width;

        var offset_left = 0;
        for(var i=0;i<items.length;i++){
            oneItem(i,items[i]);
        }

        return tmp;

        function oneItem(i,item){
            switch(i){
                case 0: item.__position ={top:0,left:offset_left+0,width:width_2,height:height_2};break;
                case 1: item.__position ={top:0,left:offset_left+width_2,width:width_2,height:height_2};break;
                case 2: item.__position ={top:0,left:offset_left+4*unit_width,width:width_1,height:height_1};break;
                case 3: item.__position ={top:unit_width,left:offset_left+4*unit_width,width:width_1,height:width_1};break;
                case 4: item.__position ={top:0,left:offset_left+5*unit_width,width:width_2,height:height_2};break;
                case 5: item.__position ={top:0,left:offset_left+7*unit_width,width:width_2,height:height_2};break;
                case 6: item.__position ={top:0,left:offset_left+9*unit_width,width:width_2,height:height_2};break;
                case 7: item.__position ={top:0,left:offset_left+11*unit_width,width:width_1,height:height_1};break;
                case 8: item.__position ={top:unit_width,left:offset_left+11*unit_width,width:width_1,height:height_1};break;
                case 9: item.__position ={top:2*unit_width,left:offset_left+0,width:width_3,height:height_3};break;
                case 10: item.__position ={top:2*unit_width,left:offset_left+3*unit_width,width:width_2,height:height_2};break;
                case 11: item.__position ={top:2*unit_width,left:offset_left+5*unit_width,width:width_2,height:height_2};break;
                case 12: item.__position ={top:2*unit_width,left:offset_left+7*unit_width,width:width_2,height:height_2};break;
                case 13: item.__position ={top:2*unit_width,left:offset_left+9*unit_width,width:width_2,height:height_2};break;
                case 14: item.__position ={top:2*unit_width,left:offset_left+11*unit_width,width:width_1,height:height_1};break;
                case 15: item.__position ={top:3*unit_width,left:offset_left+11*unit_width,width:width_1,height:height_1};break;
                case 16: item.__position ={top:5*unit_width,left:offset_left+0,width:width_3,height:height_3};break;
                case 17: item.__position ={top:4*unit_width,left:offset_left+3*unit_width,width:width_3,height:height_3};break;
                case 18: item.__position ={top:4*unit_width,left:offset_left+6*unit_width,width:width_2,height:height_2};break;
                case 19: item.__position ={top:4*unit_width,left:offset_left+8*unit_width,width:width_2,height:height_2};break;
                case 20: item.__position ={top:4*unit_width,left:offset_left+10*unit_width,width:width_2,height:height_2};break;
                case 21: item.__position ={top:7*unit_width,left:offset_left+3*unit_width,width:width_1,height:height_1};break;
                case 22: item.__position ={top:7*unit_width,left:offset_left+4*unit_width,width:width_1,height:height_1};break;
                case 23: item.__position ={top:7*unit_width,left:offset_left+5*unit_width,width:width_1,height:height_1};break;
                case 24: item.__position ={top:6*unit_width,left:offset_left+6*unit_width,width:width_2,height:height_2};break;
                case 25: item.__position ={top:6*unit_width,left:offset_left+8*unit_width,width:width_2,height:height_2};break;
                case 26: item.__position ={top:6*unit_width,left:offset_left+10*unit_width,width:width_2,height:height_2};break;
                default: return;
            }
            return item
        }
    }


    /**
     * 初始化模块内部控制器
     * 参数为angular服务引用，各模块可以按需使用
     * @param  {[type]} $scope  [description]
     * @param  {[type]} $parse  [description]
     * @param  {[type]} $dialog [description]
     * @param  {[type]} $q      [description]
     * @param  {[type]} $http   [description]
     * @return {[type]}         [无]
     */
    function initContoller($scope, $parse, $q, $http) {
        //保存当前上下文到模块级别，方便非angular代码调用
        moduleScope = $scope;

        $scope.modalDialogClose = function () {
            $.fancybox.close();
        };

        $scope.choiceAllCate = function(cate,key){
            $scope.productViewArray = $scope.allproductArray;
            $scope.productCategorySelected = "all";
        }


        $scope.selectCate = function(cate,$index){
            $("#m-nail-show-show-area .pos-product-nav").css("left",$index*9+"rem")
            $scope.pageNo = 1;
            $scope.productCategorySelected = cate.id;
            $scope.showViewArray = [];
            initPageModel($scope,function(model){
                model.$digest();
                self.s.getScrollObj().refresh();
            })
        }

        $scope.showImageStyle = function(product){
            var main_container_height = $("#main-container").height();
            if($scope.showImageStyle.main_container_height){
                main_container_height = $scope.showImageStyle.main_container_height;
            }else{
                main_container_height = $("#main-container").height();
            }

            var L_CONST = 36;
            if(cordova && cordova.platformId == "ios"){
                L_CONST = 108;
            }
            var tmp_img_size =  (main_container_height-L_CONST)+"px "+(main_container_height-L_CONST)+"px";
            $("#show-detail-img").height(main_container_height-L_CONST);
            $("#show-detail-img").width(main_container_height-L_CONST);
            $("#show-detail-img .scroll-out-result-list").height(main_container_height-L_CONST);
            $("#show-detail-img .scroll-out-result-list").width(main_container_height-L_CONST);
            $("#show-detail-img .scroll-inner-list").width((main_container_height-L_CONST)+1);

            if(!product){
                return {};
            }
            var img = product.img;
            return {
                "background-image": "url("+img+")",
                "background-size":tmp_img_size,
                "width":main_container_height-L_CONST,
                "height":main_container_height-L_CONST
            }
        }
        $scope.backIndex = function(){
            $scope.action = "index";
        }

        $scope.choiceShow = function(show,index){
            $scope.showSelected = show;
            if($("#m-show-info").is(":visible")==false){
                $.fancybox.open( {href:"#m-show-info" },
                    {
                        openEffect  : 'none',
                        closeEffect : 'none',
                        closeBtn:false,
                        closeClick:false,
                        autoSize:false,
                        autoHeight:true,
                        autoWidth:true,
                        fitToView:true,
                        padding:0,
                        margin:0,
                        helpers: {
                            overlay : {
                                closeClick : false
                            }
                        }
                    });
                setTimeout(function(){
                    if(!self.popscroll){
                        var main_container_height = $("#main-container").height();
                        if($scope.showImageStyle.main_container_height){
                            main_container_height = $scope.showImageStyle.main_container_height;
                        }else{
                            main_container_height = $("#main-container").height();
                        }

                        var tmp_img_size =  (main_container_height-36)+"px "+(main_container_height-36)+"px";
                        self.popscroll= new IScroll("#show-detail-scroll",{
                            probeType: 2,
                            scrollX: true,
                            bounce:true,
                            bounceTime:10,
                            bounceEasing: {
                                style: '',	// Not properly "circular" but this looks better, it should be (0.075, 0.82, 0.165, 1)
                                fn: function (k) {
                                }
                            },
                            scrollY:  false,
                            hScrollbar: false,
                            vScrollbar: false,//垂直滚动条
                            snap: false,
                            momentum: false,
                            checkDOMChanges: false});

                        self.popscroll.scrollTempIndex = index;
                        self.popscroll.on("refresh",function(){
                        });

                        self.popscroll.on("scrollStart",function(){
                            self.popscroll.scrollStartX = this.x;
                            $("#show-detail-scroll .prevImage").remove();
                            $("#show-detail-scroll .nextImage").remove();
                        });
                        self.popscroll.on("scroll",function(){
                            if((this.x-self.popscroll.scrollStartX)>1){
                                if($("#show-detail-scroll .prevImage").length==0){
                                    var url = "";
                                    if(self.popscroll.scrollTempIndex == 0 && $scope.showSelected.pageNo ==1){
                                         return;
                                    }else if(self.popscroll.scrollTempIndex == 0 && $scope.showSelected.pageNo > 1){
                                        url = $scope.showViewArray[$scope.showSelected.pageNo-2][26].img;
                                    }else{
                                        url = $scope.showViewArray[$scope.showSelected.pageNo-1][self.popscroll.scrollTempIndex-1].img;
                                    }


                                    var imgdom = $("<li class=\"prevImage\"></li>");
                                    imgdom.css({
                                        "background-image": "url("+url+")",
                                        "background-size":tmp_img_size,
                                        "width":main_container_height-36,
                                        "height":main_container_height-36
                                    })

                                    $("#show-detail-scroll .scroll-inner-list").prepend(imgdom);
                                }
                                $("#show-detail-scroll .prevImage").css("right",main_container_height-24-(this.x-self.popscroll.scrollStartX));
                                $("#show-detail-scroll .img").css("left",(this.x-self.popscroll.scrollStartX));
                            }else if((this.x-self.popscroll.scrollStartX) < -1){
                                if($("#show-detail-scroll .nextImage").length==0){

                                    var url = "";
                                    if(self.popscroll.scrollTempIndex == 26 && !$scope.showViewArray[$scope.showSelected.pageNo]){
                                        return;
                                    }else if(self.popscroll.scrollTempIndex < 26 && !$scope.showViewArray[$scope.showSelected.pageNo-1][self.popscroll.scrollTempIndex+1]){
                                        return;
                                    }else if(self.popscroll.scrollTempIndex == 26 && $scope.showViewArray[$scope.showSelected.pageNo]){
                                        url = $scope.showViewArray[$scope.showSelected.pageNo][0].img;
                                    }else{
                                        if($scope.showViewArray[$scope.showSelected.pageNo-1][self.popscroll.scrollTempIndex+1]){
                                            url = $scope.showViewArray[$scope.showSelected.pageNo-1][self.popscroll.scrollTempIndex+1].img;
                                        }
                                    }


                                    var imgdom = $("<li class=\"nextImage\"></li>");
                                    imgdom.css({
                                        "background-image": "url("+url+")",
                                        "background-size":tmp_img_size,
                                        "width":main_container_height-36,
                                        "height":main_container_height-36
                                    })
                                    $("#show-detail-scroll .scroll-inner-list").prepend(imgdom);
                                }
                                $("#show-detail-scroll .nextImage").css("left",main_container_height-30-(self.popscroll.scrollStartX-this.x));
                                $("#show-detail-scroll .img").css("right",(self.popscroll.scrollStartX-this.x));
                            }

                            if((this.x-self.popscroll.scrollStartX)>5){
                                self.popscroll.scrollToPrev = true;
                                //判断前一张图片是否已经加载，如果未加载，插入前一张图片，同时删除后一张图片
                            }else if((this.x-self.popscroll.scrollStartX) < -5){
                                //判断后一张图片是否已经加载，如果未加载，插入后一张图片，同时删除前一张图片
                                self.popscroll.scrollToNext = true;
                            }else{
                                self.popscroll.scrollToNext = false;
                                self.popscroll.scrollToPrev = false;
                            }
                        });
                        //监测scroll结束
                        self.popscroll.on("scrollEnd", function(){
                            var firstOne=false ,lastOne= false;

                            if(self.popscroll.scrollToPrev){
                                self.popscroll.scrollTempIndex --;
                                if(self.popscroll.scrollTempIndex > -1){
                                    if($scope.showViewArray[$scope.showSelected.pageNo-1][self.popscroll.scrollTempIndex]){
                                        $scope.showSelected = $scope.showViewArray[$scope.showSelected.pageNo-1][self.popscroll.scrollTempIndex];
                                    }else{
                                        self.popscroll.scrollTempIndex ++;
                                        firstOne = true;
                                    }
                                }else{
                                    if($scope.showViewArray[$scope.showSelected.pageNo-2]){
                                        $scope.showSelected = $scope.showViewArray[$scope.showSelected.pageNo-2][26];
                                        self.popscroll.scrollTempIndex  = 26;
                                    }else{
                                        firstOne = true;
                                        self.popscroll.scrollTempIndex ++;
                                    }
                                }
                                try{
                                    if(firstOne ){
                                        return;
                                    }

                                    $("#show-detail-scroll .prevImage").addClass("img-transition");
                                    $("#show-detail-scroll .img").addClass("img-transition");
                                    $("#show-detail-scroll .prevImage").css("right",0);
                                    $("#show-detail-scroll .img").css("left",main_container_height-30);
                                    $("#show-detail-scroll .img").removeClass("img-transition");
                                    $scope.$digest();
                                    setTimeout(
                                        function(){
                                            $("#show-detail-scroll .img").css("left","");
                                        }
                                        ,200
                                    );
                                }catch(e){
                                    console.log(e);
                                }
                            }
                            if(self.popscroll.scrollToNext){
                                //查询下一张图片
                                self.popscroll.scrollTempIndex ++;
                                if(self.popscroll.scrollTempIndex<27){
                                    if($scope.showViewArray[$scope.showSelected.pageNo-1][self.popscroll.scrollTempIndex]){
                                        $scope.showSelected = $scope.showViewArray[$scope.showSelected.pageNo-1][self.popscroll.scrollTempIndex];
                                    }else{
                                        self.popscroll.scrollTempIndex --;
                                        lastOne = true;
                                    }
                                }else{
                                    if($scope.showViewArray[$scope.showSelected.pageNo]){
                                        $scope.showSelected = $scope.showViewArray[$scope.showSelected.pageNo][0];
                                        self.popscroll.scrollTempIndex  = 0;
                                    }else{
                                        self.popscroll.scrollTempIndex --;
                                        lastOne = true;
                                    }
                                }
                                try{
                                    if(lastOne){
                                       return;
                                    }

                                    $("#show-detail-scroll .nextImage").addClass("img-transition");
                                    $("#show-detail-scroll .img").addClass("img-transition");
                                    $("#show-detail-scroll .nextImage").css("left",0);
                                    $("#show-detail-scroll .img").css("right",main_container_height-30);
                                    $("#show-detail-scroll .img").removeClass("img-transition");

                                    $scope.$digest();
                                    setTimeout(
                                        function(){
                                            $("#show-detail-scroll .img").css("right","");
                                        }
                                        ,200
                                    );
                                }catch(e){
                                    console.log(e);

                                }

                            }
                        });
                    }else{
                        self.popscroll.scrollTempIndex = index;
                        self.popscroll.refresh();
                    }
                    }
                    ,50);

            }

        }
        $scope.shareToWeixin = function(){
            if(window.LosNailActivity){
                if(0  == window.LosNailActivity.getNetworkState()){
                    window.LosNailActivity.showMsg("无法连接到网络，请检查网络配置");
                    return;
                }
            }
            if (cordova && cordova.platformId == "ios" && window.plugins.weixin) {
                //IPAD不支持分享功能，微信没有IPAD版本
            }else if(window.plugins.weixin){
                window.plugins.weixin.send({type: 'image',
                    imageType: 'path',//you can also use 'url' to send image.
                    desc: $scope.showSelected.name+":"+$scope.showSelected.desc?$scope.showSelected.desc:"",//you can also use 'url' to send image.
                    data: $scope.showSelected.img,//SD card path or Url
                    isSendToTimeline: true
                }, function(){

                }, function(e){
                    utils.showAreaFailMsg("分享失败");
                });
            }
        }
        $scope.shareToSinaWeibo = function(){
            if(window.LosNailActivity){
                if(0  == window.LosNailActivity.getNetworkState()){
                    window.LosNailActivity.showMsg("无法连接到网络，请检查网络配置");
                    return;
                }
            }
            if(window.plugins.sinaWeibo){
                window.plugins.sinaWeibo.send({type: 'image',
                    desc: $scope.showSelected.name+":"+$scope.showSelected.desc?$scope.showSelected.desc:"",//you can also use 'url' to send image.
                    imageType: 'path',//you can also use 'url' to send image.
                    data: $scope.showSelected.img
                }, function(){
                }, function(){
                    utils.showAreaFailMsg("分享失败");
                });
            }
        }

    }

    //模块级别初始化，可以做一些模块级别的初始化
    function init() {

    }
    /**
     * 模块页面加载完成后处理
     * @return {[type]} [description]
     */
    function afterPageLoaded() {
        var app = {
            initialize: function() {
                this.bindEvents();
            },
            bindEvents: function() {
                document.addEventListener('deviceready', this.onDeviceReady, false);
            },
            onDeviceReady: function() {
                app.receivedEvent('deviceready');
            },
            receivedEvent: function(id) {
            }
        };
        app.initialize();

        var content_h = $(window).outerHeight()-$("#header-container").outerHeight();
        $("#m-nail-show-show-area #wrapper").height(content_h-$("#m-nail-show-show-area .show-table").outerHeight()-8);

        adjustWidth();


        setTimeout(function(){
            self.s =  new Pull.initialize('#m-nail-show-show-area #wrapper',{
                upGuideCon: '向上拉动获取更多',
                reverseCon: '松开即可获取',
                bindPullUp: true,
                hScroll: false,
                vScroll: true,
                loading: '正在加载...',
                upAct: function(){
                    queryItems(moduleScope,function(error,len){
                        if(error){
                            utils.showGlobalMsg("获取记录失败",2000);
                            return;
                        }
                        if( len>0 ){
                            moduleScope.$digest();
                        }
                    });
                    self.s.getScrollObj().refresh();
                }
            });
        },50);
        global.eventEmitter.addListener("setting.show.showItem.change", function () {
            moduleScope.needReload = true;
        });
        global.eventEmitter.addListener("setting.show.showCate.change", function () {
            moduleScope.needReload = true;
        });


    }


    function adjustWidth(){
        var showCategorieMapLen = _.pairs(moduleScope.categories).length;
        $(".show-cate").css("width",showCategorieMapLen*9+"rem");
        $(".show-cate").css("min-width","100%");
    }


    /**
     * 顶层一级菜单切换回调，每次切换时需要各模块做响应
     * @param  {[type]} params [description]
     * @return {[type]}        [description]
     */
    function switchMenu(params) {
        if (moduleScope.needReload) {
            moduleScope.categories = {};
            moduleScope.showViewArray = [];
            moduleScope.pageNo = 1;
            initPageModel(moduleScope, function () {
                    try {
                        moduleScope.$digest();
                        adjustWidth();
                        self.s.getScrollObj().refresh();
                    }
                    catch (error) {
                        console.log(error);
                    }
            })
        }
    }
    /**
     * 地址栏参数变化回调，如果当前模块对应的URL中参数发生变化，则会调用此回调
     * @param  {[type]} params [description]
     * @return {[type]}        [description]
     */
    function paramsChange(params) {
        if (moduleScope) {
            moduleScope.params = params;
        }
    }
});
