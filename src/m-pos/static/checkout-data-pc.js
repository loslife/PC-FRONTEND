/**
 * Created with JetBrains WebStorm.
 * User: huangzhi
 * Date: 14-1-15
 * Time: 上午9:58
 * To change this template use File | Settings | File Templates.
 */
//会员类型模块对应的数据接口
define(function (require, exports, module) {
    var database = require("mframework/static/package").database;
    var dataUtils = require("mframework/static/package").dataUtils;
    var utils = require("mframework/static/package").utils;
    var cache = utils.getCache();
    var dbInstance = database.getDBInstance();

    exports.initPendOrderList = initPendOrderList;
    exports.initEmployeeList = initEmployeeList;
    exports.initServiceList = initServiceList;
    exports.pendOrder = pendOrder;
    exports.deletePend = deletePend;
    exports.checkout = checkout;
    exports.fillIdCode = fillIdCode;
    exports.queryMember = queryMember;
    exports.queryPendingOrder = queryPendingOrder;
    exports.searchMember = searchMember;
    exports.queryLastRecharge = queryLastRecharge;
    exports.initCateServiceList = initCateServiceList;

    function initPendOrderList(model, callback) {
    }

    function initEmployeeList(model, callback) {
    }

    function initServiceList(model, callback) {
    }

    function initCateServiceList(model, callback) {
    }

    //挂单、order单、serviceList产品列表
    function pendOrder(order, serviceList, callback) {
    }

    //删除挂单
    function deletePend(delPendId, callback) {
    }

    function checkout(bill, billProject, memberCard, empBonus, callback) {
    }

    //流水单、服务列表、会员卡、员工提成
    function fillIdCode(serviceBill, projectList, memberCard, empBonus, callback) {
    }

    //查询会员
    function queryMember(memberId, callback) {
    }

    //插叙挂单信息
    function queryPendingOrder(pendId, callback) {
    }

    //搜索会员，keyword搜索关键字，cursorStart记录起始位置，amount查询数量，返回搜索到的会员列表
    function searchMember(keyword, cursorStart, amount, callback) {
    }

    //查询会员最后消费日期
    function queryLastRecharge(cardId, callback) {
    }

});