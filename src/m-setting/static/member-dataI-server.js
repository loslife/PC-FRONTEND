//会员类型模块对应的数据接口
define(function (require, exports, module) {
    var database = require("mframework/static/package").database;
    var dataUtils = require("mframework/static/package").dataUtils;
    var utils = require("mframework/static/package").utils;
    var datas = require("mframework/static/package").datas.instance;
    var cache = utils.getCache();
    var dbInstance = database.getDBInstance();
    var featureDataI = require("./member-dataI.js");


    exports.isCateHaveMember = isCateHaveMember;//根据类型id判断是否存在会员
    exports.deleteRechargeCate = deleteRechargeCate;//删除充值卡
    exports.deleteRecordCate = deleteRecordCate;//删除记次卡

    exports.newRechargeCate = newRechargeCate;//新增充值卡
    exports.updateRechargeCate = updateRechargeCate;//修改充值卡

    exports.newRecordCate = newRecordCate;//新增记次卡
    exports.updateRecordCate = updateRecordCate;//修改记次卡

    exports.initServiceList = initServiceList;//初始化服务数据
    exports.initCateServiceList = initCateServiceList;//初始化记次卡关联的服务数据
    exports.initCateList = initCateList;//初始化会员卡类型
    exports.cateMemberCount = cateMemberCount;//统计会员类型下的会员数
    exports.reInitServiceList = reInitServiceList;


    //根据类型id判断是否存在会员
    function isCateHaveMember(cateId, callback) {
        featureDataI.isCateHaveMember.apply(featureDataI,arguments);
    }
    function initServiceList(model, callback) {
        featureDataI.initServiceList.apply(featureDataI,arguments);
    }

    function reInitServiceList(model, callback) {
        featureDataI.reInitServiceList.apply(featureDataI,arguments);
    }

    function initCateServiceList(model, callback) {
        featureDataI.initCateServiceList.apply(featureDataI,arguments);
    }

    function initCateList(model, callback) {
        featureDataI.initCateList.apply(featureDataI,arguments);
    }

    function cateMemberCount(model, callback) {
        featureDataI.cateMemberCount.apply(featureDataI,arguments);
    }


    //新增充值卡
    function newRechargeCate(rechargeCate, callback) {
        var org_arguments = arguments;
        //提交服务器成功后，更新本地数据库
        var form = {
            "rechargeCate":rechargeCate
        }
        datas.postResource("memberCard/newRechargeCate/" + utils.global.enterpriseId,form)
            .then(function (result) {
                if(result.errorCode == 0){
                    featureDataI.newRechargeCate.apply(featureDataI,org_arguments);
                }else{
                    callback(result);
                }
            },function(error){
                callback(error);
            });
    }

    function newRecordCate(recordCate, serviceList, callback) {

        var org_arguments = arguments;
        //提交服务器成功后，更新本地数据库
        var form = {
            "recordCate":recordCate,
            "serviceList":serviceList
        }
        datas.postResource("memberCard/newRecordCate/" + utils.global.enterpriseId,form)
            .then(function (result) {
                if(result.errorCode == 0){
                    featureDataI.newRechargeCate.apply(featureDataI,org_arguments);
                }else{
                    callback(result);
                }
            },function(error){
                callback(error);
            });

    }

    function updateRechargeCate(rechargeCate, callback) {
        var org_arguments = arguments;
        var form = {
            "rechargeCate":rechargeCate
        }
        datas.postResource("member/updateRechargeCate/" + utils.global.enterpriseId,form)
            .then(function (result) {
                if(result.errorCode == 0){
                    featureDataI.updateRechargeCate.apply(featureDataI,org_arguments);
                }else{
                    callback(result);
                }
            },function(error){
                callback(error);
            });
    }

    //更新记次卡
    function updateRecordCate(recordCate, serviceList, callback) {
        var org_arguments = arguments;
        var form = {
            "recordCate":recordCate
        }
        datas.postResource("member/updateRecordCate/" + utils.global.enterpriseId,form)
            .then(function (result) {
                if(result.errorCode == 0){
                    featureDataI.updateRecordCate.apply(featureDataI,org_arguments);
                }else{
                    callback(result);
                }
            },function(error){
                callback(error);
            });
    }


    //根据类型id删除卡类型，返回影响记录条数
    function deleteRechargeCate(rechargeCate, callback) {
        var org_arguments = arguments;
        var form = {
            "rechargeCate":rechargeCate
        }
        datas.postResource("member/deleteRechargeCate/" + utils.global.enterpriseId,form)
            .then(function (result) {
                if(result.errorCode == 0){
                    featureDataI.deleteRechargeCate.apply(featureDataI,org_arguments);
                }else{
                    callback(result);
                }
            },function(error){
                callback(error);
            });
    }

    function deleteRecordCate(recordCate, callback) {
        var org_arguments = arguments;
        var form = {
            "recordCate":recordCate
        }
        datas.postResource("member/deleteRecordCate/" + utils.global.enterpriseId,form)
            .then(function (result) {
                if(result.errorCode == 0){
                    featureDataI.deleteRecordCate.apply(featureDataI,org_arguments);
                }else{
                    callback(result);
                }
            },function(error){
                callback(error);
            });
    }
});