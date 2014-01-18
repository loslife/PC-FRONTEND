/**
 * Created with JetBrains WebStorm.
 * User: huangzhi
 * Date: 14-1-18
 * Time: 上午11:28
 * To change this template use File | Settings | File Templates.
 */

define(function (require, exports, module) {
    var database = require("mframework/static/package").database;
    var dataUtils = require("mframework/static/package").dataUtils;
    var utils = require("mframework/static/package").utils;
    var datas = require("mframework/static/package").datas.instance;
    var cache = utils.getCache();
    var dbInstance = database.getDBInstance();
    var featureDataI = require("./employee-dataI.js");


    exports.initJobList = initJobList;
    exports.initEmployeeList = initEmployeeList;
    exports.initCateFlag = initCateFlag;
    exports.newEmployee = newEmployee;
    exports.updateEmployee = updateEmployee;
    exports.deleteEmployee = deleteEmployee;
    exports.newJob = newJob;
    exports.updateJob = updateJob;
    exports.deleteJob = deleteJob;
    exports.countEmployeeOfJob = countEmployeeOfJob;
    exports.countEmployeeAmount = countEmployeeAmount;
    exports.getSalaryOfHistory = getSalaryOfHistory;
    exports.getSalaryOfEmpBonus = getSalaryOfEmpBonus;
    exports.newSalaryRecord = newSalaryRecord;
    exports.updateSalaryAppend = updateSalaryAppend;//更新工资记录
    exports.manualAppend = manualAppend;//手工添加
    exports.queryEmpBonus = queryEmpBonus;
    exports.queryEmpSalary = queryEmpSalary;
    var cacheInvalid = true;



    //一期
    function initJobList(model, callback) {
        if(cacheInvalid){
            async.waterfall([
                queryServerData
                ,initLocalData
                ,queryLocalData],function(error,result){
                callback(error, model)
            });
        }else{
            queryLocalData(function(error){
                callback(error, model)
            });
        }
        function queryServerData(callback){
            datas.getResource("employee/queryAllEmployeeJob/"+YILOS.ENTERPRISEID)
                .then(function (result) {
                    if(result.errorCode == 0){
                        if(result.jobList.length>0){
                            callback(null,result.jobList);
                        }
                    }else{
                        callback(result);
                    }
                },function(error){
                    callback(error);
                }
            );
        }
        function initLocalData(recordList,callback){
            async.each(recordList,function(record,sub_callback){
                featureDataI.newJob(record,function(error){
                    //主键冲突失败不处理
                    sub_callback(null);
                });
            },function(error){
                callback(error);
            });
        }
        function queryLocalData(callback){
            featureDataI.initJobList(model, function (error, data) {
                if (error) {
                    utils.log("query Local DataBase fail. queryLocalData", error);
                    callback(error);
                }else{
                    callback(null,data);
                }
            });
        }
    }

    //一期
    function initEmployeeList(model, callback) {
        if(cacheInvalid){
            async.waterfall([
                queryServerData
                ,initLocalData
                ,queryLocalData],function(error,result){
                callback(error, model)
            });
        }else{
            queryLocalData(function(error){
                callback(error, model)
            });
        }
        function queryServerData(callback){
            datas.getResource("employee/queryAllEmployee/"+YILOS.ENTERPRISEID)
                .then(function (result) {
                    if(result.errorCode == 0){
                        if(result.employeeList.length>0){
                            callback(null,result.employeeList);
                        }
                    }else{
                        callback(result);
                    }
                },function(error){
                    callback(error);
                }
            );
        }
        function initLocalData(recordList,callback){
            async.each(recordList,function(record,sub_callback){
                featureDataI.newEmployee(record,function(error){
                    //主键冲突失败不处理
                    sub_callback(null);
                });
            },function(error){
                callback(error);
            });
        }
        function queryLocalData(callback){
            featureDataI.initEmployeeList(model, function (error, data) {
                if (error) {
                    utils.log("query Local DataBase fail. queryLocalData", error);
                    callback(error);
                }else{
                    callback(null,data);
                }
            });
        }
    }
    //一期
    function initCateFlag(model, callback) {
        featureDataI.initCateFlag.apply(featureDataI,arguments);
    }

    function newEmployee(employee, callback) {
    }

    function updateEmployee(employee, callback) {
    }

    function deleteEmployee(employeeId, callback) {
    }

    function newJob(job, callback) {
    }

    function updateJob(job, callback) {
    }

    function deleteJob(jobId, callback) {
    }

    //统计岗位下的员工数量
    function countEmployeeOfJob(jobId, callback) {
        featureDataI.countEmployeeOfJob.apply(featureDataI,arguments);

    }

    //统计所有员工数
    function countEmployeeAmount(callback) {
        featureDataI.countEmployeeAmount.apply(featureDataI,arguments);

    }

    //获取历史工资
    function getSalaryOfHistory(startTime, endTime, callback) {
        featureDataI.getSalaryOfHistory.apply(featureDataI,arguments);

    }

    //从员工提成计算工资
    function getSalaryOfEmpBonus(startTime, endTime, callback) {
        featureDataI.getSalaryOfEmpBonus.apply(featureDataI,arguments);

    }

    //新增工资记录
    function newSalaryRecord(salaryList, callback) {
    }

    //手工调整更新工资记录
    function updateSalaryAppend(salaryId, appendMoney, modifyDate, callback) {
    }

    //手工调整
    function manualAppend(append, callback) {
    }

    //查询员工提成信息
    function queryEmpBonus(employeeId, startTime, endTime, callback) {
        featureDataI.queryEmpBonus.apply(featureDataI,arguments);

    }

    //查询某员工某员的工资
    function queryEmpSalary(employeeId, startTime, endTime, callback) {
        featureDataI.queryEmpSalary.apply(featureDataI,arguments);

    }

});