/**
 * Created with JetBrains WebStorm.
 * User: huangzhi
 * Date: 13-9-23
 * Time: 上午10:13
 * To change this template use File | Settings | File Templates.
 */
define(function (require, exports, module) {
    var datas = require("mframework/static/package").datas.instance;

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
    var database = require("mframework/static/package").database;
    var dbInstance = null;

    //基础服务
    var utils = require("mframework/static/package").utils, 			        //全局公共函数
        cache = utils.getCache(),
        CONSTANT = {
        };

    var moduleScope;

    function loadModelAsync(params, callback) {
        dbInstance = database.getDBInstance();

        var model = {};
        model.memberList = [];
        model.condition = "";
        model.shearch = {
            keyWord: ""
        };
        model.backup = backup;
        model.resume = resume;
        model.tips = "";
        callback(model);
        updateBackupTips();
    }

    function initContoller($scope, $parse, $q, $http) {
        moduleScope = $scope;
    }

    function init() {

    }

    function afterPageLoaded() {
        $("#m-setting-backup-area").height($(window).height());
    }

    function switchMenu(params) {
        updateBackupTips();
    }

    function updateBackupTips() {
        $.ajax({
            type: "get",
            url: global["_g_server"].serviceurl + "/backup/getEnterpriseBackupRecord?enterpriseId=" + YILOS.ENTERPRISEID,
            dataType: "json",
            success: function (data) {
                console.log("getEnterpriseBackupRecord success : " + data);
                if (data && data.code == "0") {
                    if (data.result && data.result.lastBackup_date) {
                        moduleScope.tips = "最近一次备份时间：" + formatDate(data.result.lastBackup_date);
                    } else {
                        moduleScope.tips = "还未备份过数据"
                    }
                } else {
                    moduleScope.tips = "";
                }
                try {
                    moduleScope.$digest();
                } catch (error) {
                    console.log(error);
                }
            },
            error: function (error) {
                moduleScope.tips = "";
                try {
                    moduleScope.$digest();
                } catch (error) {
                    console.log(error);
                }
            }
        });
    }

    function formatDate(milliSeconds) {
        var date = new Date(milliSeconds)
        return (date.getMonth() + 1) + "月" + date.getDate() + "日 " + date.getHours() + ":" + date.getMinutes();
    }

    function paramsChange(params) {

    }

    function backup() {
        datas.getResource("backup/buildResumeDataPkg?enterpriseId="+YILOS.ENTERPRISEID)
            .then(function (result) {
                utils.showGlobalSuccessMsg("备份成功!");
            },function(error){
            }
        );

//        if (cordova && cordova.platformId == "ios") {
//            backup_ios();
//        }else{
//            backup_android();
//        }
    }

    function resume() {
        if (cordova && cordova.platformId == "ios") {
            resume_ios();
        }else{
            resume_android();
        }
    }

    function backup_android() {
        if (window.plugins.BackupAndResume) {
            window.plugins.BackupAndResume.cloudBackup({}, function (successResult) {
                console.log("显示最近一次备份时间");
                //备份成功后，更新界面显示时间
                moduleScope.tips = "最近一次备份时间：" + formatDate(new Date().getTime());
                try {
                    moduleScope.$digest();
                } catch (error) {
                    console.log(error);
                }
            }, function (errorResult) {

            });
        }
    }

    function resume_android() {
        if (window.plugins.BackupAndResume) {
            window.plugins.BackupAndResume.cloudResume({}, function (successResult) {
                cache.clearAll();
            }, function (errorResult) {
                cache.clearAll();
            });
        }
    }

    function backup_ios() {
        if(backup_ios.doing){
            //提示正在备份
            return;
        }
        if (window.LosNailActivity) {
            backup_ios.doing = true;
            window.LosNailActivity.cloudBackup(function(){
                backup_ios.doing = false;
            },function(){
                backup_ios.doing = false;
            });
        }
    }

    function resume_ios() {
        if(resume_ios.doing){
            return;
        }
        resume_ios.doing = true;
        if (window.LosNailActivity) {
            window.LosNailActivity.cloudResume(function(){
                resume_ios.doing = false;
                cache.clearAll();
            },function(){
                resume_ios.doing = false;
                cache.clearAll();
            });
        }
    }

});