//会员模块对应的数据接口
define(function (require, exports, module) {
    var database = require("mframework/static/package").database;
    var utils = require("mframework/static/package").utils;
    var dataUtils = require("mframework/static/package").dataUtils;
    var datas = require("mframework/static/package").datas.instance;
    var dbInstance = database.getDBInstance();
    var featureDataI = require("./allMemberList-dataI.js");

    exports.initEmployeeList = initEmployeeList;
    exports.initMemberList = initMemberList;
    exports.initMemberCateList = initMemberCateList;
    exports.newMemberFillIdCode = newMemberFillIdCode;//...
    exports.newMember = newMember;
    exports.updateMember = updateMember;
    exports.deleteMember = deleteMember;
    exports.rechargeFillIdCode = rechargeFillIdCode;
    exports.rechargeMember = rechargeMember;
    exports.searchMember = searchMember;
    exports.queryCardBalance = queryCardBalance;
    exports.queryLastRecharge = queryLastRecharge;
    exports.countMemberCost = countMemberCost;
    exports.queryMemberCount = queryMemberCount;
    var cacheInvalid = true;
    function initEmployeeList(model, callback) {
        featureDataI.initEmployeeList.apply(featureDataI,arguments);
    }

    function initMemberList(model, callback) {
        if(cacheInvalid){
            async.waterfall([
                 queryServerMemberData,initLocalMemberData
                ,queryServerMemberCardData,initLocalMemberCardData
                ,queryLocalData],function(error,result){
                callback(error, model)
            });
        }else{
            queryLocalData(function(error){
                callback(error, model)
            });
        }

        function queryLocalData(callback){
            featureDataI.initMemberList(model, function (error, data) {
                if (error) {
                    utils.log("m-member allMemberList.js initMemberList.featureDataI.initMemberList", error);
                    callback(error);
                }else{
                    callback(null,model);
                }
            });
        }

        function queryServerMemberData(callback){
            datas.getResource("member/queryMemberList/"+YILOS.ENTERPRISEID)
                .then(function (result) {
                    if(result.errorCode == 0){
                        model.memberList = result.memberList;
                        callback(null,result.memberList);
                    }else{
                        callback(result);
                    }
                },function(error){
                    callback(error);
                }
            );
        }
        function initLocalMemberData(memberList,callback){
            async.each(memberList,function(member,sub_callback){
                featureDataI.newMember(member, null, null, null, function(error){
                    //主键冲突失败不处理
                    sub_callback(null);
                });
            },function(error){
                callback(error);
            });
        }
        function queryServerMemberCardData(callback){
            datas.getResource("member/queryMemberCardList/"+YILOS.ENTERPRISEID)
                .then(function (result) {
                    if(result.errorCode == 0){
                        callback(null,result.memberList);
                    }else{
                        callback(result);
                    }
                },function(error){
                    callback(error);
                }
            );
        }
        function initLocalMemberCardData(memberCardList,callback){
            async.each(memberCardList,function(memberCard,sub_callback){
                featureDataI.newMember(null, memberCard, null, null, function(error){
                    //主键冲突失败不处理
                    sub_callback(null);
                });
            },function(error){
                callback(error);
            });
        }
    }

    function initMemberCateList(model, callback) {
        featureDataI.initMemberCateList.apply(featureDataI,arguments);
    }

    function newMember(member, memberCard, rechargeBill, empBonus, callback) {
        var org_arguments = arguments;
        //提交服务器成功后，更新本地数据库
        var form = {
           "memberCard":memberCard,
           "member":member,
           "rechargeBill":rechargeBill,
           "empBonus":empBonus
        }
        datas.postResource("member/newMember/" + utils.global.enterpriseId,form)
            .then(function (result) {
                if(result.errorCode == 0){
                    featureDataI.newMember.apply(featureDataI,org_arguments);
                }else{
                    callback(result);
                }
            },function(error){
                callback(error);
            });
        //如果本地更新失败，记录标志位，延迟同步服务器数据

    }

    function newMemberFillIdCode(member, memberCard, rechargeBill, empBonus, callback) {
        featureDataI.newMemberFillIdCode.apply(featureDataI,arguments);
    }

    function updateMember(member, memberCard, callback) {
        //提交服务器成功后，更新本地数据库
        //如果本地更新失败，记录标志位，延迟同步服务器数据
        var org_arguments = arguments;
        var form = {
            "memberCard":memberCard,
            "member":member
        }
        datas.postResource("member/updateMember/" + utils.global.enterpriseId,form)
            .then(function (result) {
                if(result.errorCode == 0){
                    featureDataI.updateMember.apply(featureDataI,org_arguments);
                }else{
                    callback(result);
                }
            },function(error){
                callback(error);
            });
    }

    //删除会员、
    function deleteMember(memberId, cardId, callback) {
        //提交服务器成功后，更新本地数据库
        //如果本地更新失败，记录标志位，延迟同步服务器数据
        var org_arguments = arguments;
        var form = {
            "memberId":memberId,
            "cardId":cardId
        }
        datas.postResource("member/deleteMember/" + utils.global.enterpriseId,form)
            .then(function (result) {
                if(result.errorCode == 0){
                    featureDataI.deleteMember.apply(featureDataI,org_arguments);
                }else{
                    callback(result);
                }
            },function(error){
                callback(error);
            });
    }

    function rechargeMember(memberCard, rechargeBill, empBonus, callback) {
        //提交服务器成功后，更新本地数据库
        //如果本地更新失败，记录标志位，延迟同步服务器数据
        var org_arguments = arguments;
        var form = {
            "memberCard":memberCard,
            "rechargeBill":rechargeBill,
            "empBonus":empBonus
        }
        datas.postResource("member/rechargeMember/" + utils.global.enterpriseId,form)
            .then(function (result) {
                if(result.errorCode == 0){
                    featureDataI.rechargeMember.apply(featureDataI,org_arguments);
                }else{
                    callback(result);
                }
            },function(error){
                callback(error);
            });
    }

    function rechargeFillIdCode(memberCard, rechargeBill, empBonus, callback) {
        featureDataI.rechargeFillIdCode.apply(featureDataI,arguments);
    }

    //搜索会员，keyword搜索关键字，cursorStart记录起始位置，amount查询数量，返回搜索到的会员列表
    function searchMember(keyword, cursorStart, amount, callback) {
        featureDataI.searchMember.apply(featureDataI,arguments);
    }

    //查询会员余额
    function queryCardBalance(cardId, callback) {
        featureDataI.queryCardBalance.apply(featureDataI,arguments);
    }

    //查询会员最后消费日期
    function queryLastRecharge(cardId, callback) {
        featureDataI.queryLastRecharge.apply(featureDataI,arguments);
    }

    //统计会员消费
    function countMemberCost(cardId, callback) {
        featureDataI.countMemberCost.apply(featureDataI,arguments);
    }

    //查询会员数量
    function queryMemberCount(callback) {
        featureDataI.queryMemberCount.apply(featureDataI,arguments);
    }
});