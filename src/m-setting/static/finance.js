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
    if (cordova && cordova.platformId == "ios") {
        require.async("./setting_ios.css", function (b) {
        })
    }
    //基础服务
    var self = this,
        utils = require("mframework/static/package").utils, 			        //全局公共函数
        database = require("mframework/static/package").database,		//数据操作服务
        db = database.getDBInstance(),		//数据操作服务
        cache = utils.getCache();

    var moduleScope;

    function loadModelAsync(params, callback) {
        dbInstance = database.getDBInstance();
        var model = {
            revenueflowList:[]
        };
        var current = new Date();
        loadRevenueflow("month",current,function(error,datas){
            model.revenueflowList = datas;
            callback(model);
        });

    }


    function loadRevenueflow(type,day,callback){
        var flowDatas = [];
        var year = day.getFullYear()
            ,month = day.getMonth();
        var startDay,endDay;
        if(type == "day"){
            startDay = new Date(day.getFullYear(),day.getMonth(),day.getDate());
        }else if(type == "week"){
            startDay= utils.getWeekStartDate(day);
            //星期6凌晨+24小时毫秒数
            endDay =  new Date(utils.getWeekEndDate(day).getTime()+24*3600*1000);
        }else if(type == "month"){
            //为了获取一个月的天数，单月数据统计为前一月:最后一天:23:59:59 到当月:最后一天:23:59:59
            startDay= new Date(new Date(year, month, 1)-1);
            endDay = new Date(new Date(year, month + 1, 0).getTime()+24*3600*1000-1);
        }
        async.parallel([loadCheckoutList,loadCardList],function(error){
            if(error){
                utils.log("m-setting finance.js loadRevenueflow", error);
                callback(null,flowDatas);
                return;
            }
            flowDatas = _.sortBy(flowDatas,function(obj){
              return obj.dateTime*-1;
            });
            callback(null,flowDatas);
        });


        function loadCheckoutList(callback){
            var sql = "select a.id,a.amount,a.discount,a.billNo,a.member_id,a.member_name,a.memberCard_name,a.memberCard_id,a.employee_id,a.employee_name,a.dateTime,a.comment,a.enterprise_id,b.bonusMoney,b.cardNo,b.totalMoney "
                +"from  tb_serviceBill as a left join tb_empBonus as b  where a.dateTime>? and a.dateTime<?";
            db.transaction(function(tx) {
                tx.executeSql(sql,[startDay.getTime(),endDay.getTime()],function(tx,result){
                    var len = result.rows.length;
                    //获取当月每天的统计数据
                    if(len>0){
                        for(var i=0;i<len;i++) {
                            var tmp =   result.rows.item(i);
                            flowDatas.push(tmp);
                        }
                    }
                    callback(null);

                },function(tx,error){
                    console.log("error");
                    console.log(error);
                    callback(error);
                })
            });
        }

        function loadCardList(callback){

            var sql = "select a.id,a.amount,a.billNo,a.member_name,a.member_id,a.member_name,a.memberCard_name,a.memberCard_id,a.employee_id,a.employee_name,a.dateTime,a.comment,a.enterprise_id,b.bonusMoney,b.cardNo,b.totalMoney "
                     +"from  tb_rechargeMemberBill as a left join tb_empBonus as b  where a.dateTime>? and a.dateTime<?";

            db.transaction(function(tx) {
                tx.executeSql(sql,[startDay.getTime(),endDay.getTime()],function(tx,result){
                    var len = result.rows.length;
                    //获取当月每天的统计数据
                    if(len>0){
                        for(var i=0;i<len;i++) {
                            var tmp =   result.rows.item(i);
                            flowDatas.push(tmp);
                        }
                    }
                    callback(null);

                },function(tx,error){
                    console.log("error");
                    console.log(error);
                    callback(error);
                })
            });
        }

    }




    function initContoller($scope, $parse, $q, $http) {
        moduleScope = $scope;

    }

    function init() {

    }


    function afterPageLoaded() {

    }


    function switchMenu(params) {
    }

    function paramsChange(params) {

    }
});