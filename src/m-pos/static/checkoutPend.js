define(function (require, exports, module) {
    var utils = require("mframework/static/package").utils;
    var database = require("mframework/static/package").database;
    var featureDataI = require("./checkout-dataI.js");

    exports.initScope = initScope;
    exports.pendingOrder = pendingOrder;
    exports.resumeOrder = resumeOrder;

    //angular的angScope对象
    var angScope = null;

    function initScope(scope) {
        angScope = scope;
    }

    function disPendBtn() {
        $("#pending-disable-cover").show();
    }

    function enPendBtn() {
        $("#pending-disable-cover").hide();
    }

    //挂单提交
    function pendingOrder() {
        disPendBtn();
        if (angScope.buyProductRecords.length === 0) {
            utils.showAreaFailMsg("#m-pos-checkout-hangup-popup", "挂单失败");
            enPendBtn();
            return;
        }
        //重新挂单
        if (!_.isEmpty(angScope.pendBill)) {
            featureDataI.deletePend(angScope.pendBill.id, function (error) {
                if (error) {
                    utils.showAreaFailMsg("#m-pos-checkout-hangup-popup", "挂单失败");
                    enPendBtn();
                    utils.log("m-pos checkout.js pendingOrder.featureDataI.deletePend", error);
                    return;
                }
                //将旧的收银单移除
                _.each(angScope.pendList, function (item, index) {
                    if (item.id === angScope.pendBill.id) {
                        angScope.pendList.splice(index, 1)
                    }
                });
                angScope.pendBill = {};
                pendNewOrder();
            });
        }
        else {
            pendNewOrder();
        }

        //挂一个新的收银单、
        function pendNewOrder() {
            var createDate = new Date().getTime();

            var pendOrder = {};
            var pendServiceList = [], service = {};

            pendOrder.amount = angScope.incomeStatus.paidMoney;
            pendOrder.dateTime = createDate;                //在此表示单的挂起时间
            pendOrder.create_date = createDate;
            pendOrder.enterprise_id = YILOS.ENTERPRISEID;
            if (!_.isEmpty(angScope.employeeSelected)) {
                pendOrder.employee_id = angScope.employeeSelected.id;
                pendOrder.employee_name = angScope.employeeSelected.name;
            }
            if (!_.isEmpty(angScope.memberSelected)) {
                pendOrder.member_id = angScope.memberSelected.id;
                pendOrder.memberCard_id = angScope.memberSelected.cardId;
            }

            _.each(angScope.buyProductRecords, function (item) {
                service.project_id = item.id;
                service.saleNum = item.saleNum;
                service.create_date = createDate;
                service.enterprise_id = YILOS.ENTERPRISEID;
                pendServiceList.push(_.clone(service));
            });

            featureDataI.pendOrder(pendOrder, pendServiceList, function (error) {
                if (error) {
                    utils.showAreaFailMsg("#m-pos-checkout-hangup-popup", "挂单失败");
                    enPendBtn();
                    utils.log("m-pos checkout.js pendingOrder.pendNewOrder.featureDataI.pendOrder", error);
                    return;
                }
                database.updateBackupFlag(createDate, YILOS_NAIL_MODULE.SERVICEBILL, null);
                angScope.pendList.splice(0, 0, pendOrder);
                enPendBtn();
                angScope.clearOrder();
                angScope.countPendShow();
                setTimeout(function () {
                    $.fancybox.close();
                    angScope.digestScope();
                }, 1000);
                utils.showAreaSuccessMsg("#m-pos-checkout-hangup-popup", "挂单成功");
            });
        }
    }

    //恢复单
    function resumeOrder(pendOrder) {
        if (!pendOrder) {
            return;
        }
        angScope.globalDis = "";
        $("#m-pos-hide-pend").hide();
        if (angScope.buyProductRecords.length !== 0) {
            angScope.clearOrder();
        }
        //填充pendBill模型在结算时区分
        angScope.pendBill.id = pendOrder.id;

        var pendId = pendOrder.id;
        var pendEmpId = pendOrder.employee_id;
        featureDataI.queryPendingOrder(pendId, function (error, result) {
            if (error) {
                utils.showGlobalMsg("恢复挂单失败，请稍后再试");
                utils.log("m-pos checkout.js resumePendingOrder.featureDataI.queryPendingOrder", error);
                return;
            }

            //添加所挂的产品
            _.each(result, function (item) {
                angScope.selectProduct(angScope.productList[item.project_id], item.saleNum);
            });

            angScope.employeeSelected = _.find(angScope.employeeList, function (item) {
                return item.id === pendEmpId;
            });

            //挂单员工在员工列表中不存在、
            if (_.isEmpty(angScope.employeeSelected)) {
                angScope.employeeSelected = angScope.employeeList[0];
            }

            if (pendOrder.member_id) {
                featureDataI.queryMember(pendOrder.member_id, function (error, member) {
                    if (error) {
                        utils.showGlobalMsg("恢复挂单失败，请稍后再试");
                        utils.log("m-pos checkout.js resumePendingOrder.featureDataI.queryMember", error);
                        return;
                    }
                    angScope.selectMember(member);
                    angScope.selMemberSaveNotCheckout();
                    angScope.digestScope();
                });
            }
            else {
                angScope.digestScope();
            }
        });
    }
});
