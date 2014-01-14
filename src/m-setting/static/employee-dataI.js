//会员类型模块对应的数据接口
define(function (require, exports, module) {
    var database = require("mframework/static/package").database;
    var dataUtils = require("mframework/static/package").dataUtils;
    var dbInstance = database.getDBInstance();

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


    function initJobList(model, callback) {
        model.jobList = [];
        var selectJob = "select id,name,bonus_newCard,bonus_recharge,bonus_cash,bonus_memberCard,bonus_recordCardConsume,bonus_newRecordCard,baseSalary from tb_job;";
        dbInstance.execQuery(selectJob, [], function (result) {
            for (var i = 0, len = result.rows.length; i < len; i++) {
                model.jobList.push(_.clone(result.rows.item(i)));
            }
            callback(null, model);
        }, function (error) {
            callback(error, model);
        });
    }

    function initEmployeeList(model, callback) {
        model.employeeList = [];
        var selectEmployee = "select a.id,a.name,a.nickname,a.baseInfo_sex,a.baseInfo_image,a.baseInfo_birthday,a.contact_phoneMobile,a.baseInfo_beginDate,b.name as jobName,b.baseSalary,b.id as baseInfo_jobId from tb_employee a,tb_job b where a.baseInfo_jobId = b.id;";
        dbInstance.execQuery(selectEmployee, [], function (result) {
            for (var i = 0, len = result.rows.length; i < len; i++) {
                model.employeeList.push(_.clone(result.rows.item(i)));
            }
            callback(null, model);
        }, function (error) {
            callback(error, model);
        });
    }

    function initCateFlag(model, callback) {
        model.cateFlag = {};
        dbInstance.transaction(function (trans) {
            var selectCate = "select baseInfo_type from tb_memberCardCategory group by baseInfo_type;";
            trans.executeSql(selectCate, [], function (trans, result) {
                var cateFlag = {
                    rechargeFlag: true,
                    recordFlag: true
                };
                var len = result.rows.length;
                if (len === 2) {
                    cateFlag.rechargeFlag = false;
                    cateFlag.recordFlag = false;
                }
                if (len === 1) {
                    var temp = result.rows.item(0);
                    if (temp.baseInfo_type === "recordTimeCard") {
                        cateFlag.recordFlag = false;
                    }
                    else {
                        cateFlag.rechargeFlag = false;
                    }
                }
                model.cateFlag = cateFlag;
                callback(null, model);
            }, function (trans, error) {
                callback(error, model);
            });
        });
    }

    function newEmployee(employee, callback) {
        database.getUniqueId(YILOS.ENTERPRISEID, function (error, trans, id) {
            if (error) {
                callback(error);
                return;
            }
            employee.id = id;
            dataUtils.insertRecord("tb_employee", employee, null, callback);
        });
    }

    function updateEmployee(employee, callback) {
        dataUtils.updateRecordById("tb_employee", employee, null, callback);
    }

    function deleteEmployee(employeeId, callback) {
        dataUtils.deleteRecordById("tb_employee", employeeId, callback);
    }

    function newJob(job, callback) {
        database.getUniqueId(YILOS.ENTERPRISEID, function (error, trans, id) {
            if (error) {
                callback(error);
                return;
            }
            job.id = id;
            dataUtils.insertRecord("tb_job", job, null, callback);
        });
    }

    function updateJob(job, callback) {
        dataUtils.updateRecordById("tb_job", job, null, callback);
    }

    function deleteJob(jobId, callback) {
        dataUtils.deleteRecordById("tb_job", jobId, callback);
    }

    //统计岗位下的员工数量
    function countEmployeeOfJob(jobId, callback) {
        var statement = "select count(*) as count from tb_employee where baseInfo_jobId = ?;";
        dbInstance.execQuery(statement, [jobId], function (result) {
            if (result.rows.length !== 0) {
                callback(null, result.rows.item(0).count)
            }
            else {
                callback(statement + jobId + "执行出错");
            }
        }, function (error) {
            callback(error);
        });
    }

    //统计所有员工数
    function countEmployeeAmount(callback) {
        var selectEmployee = "select count(*) as count from tb_employee;";
        dbInstance.execQuery(selectEmployee, [], function (result) {
            if (result.rows.length !== 0) {
                callback(null, result.rows.item(0).count);
            }
            else {
                callback(selectEmployee + "执行出错");
            }
        }, function (error) {
            callback(error);
        });
    }

    //获取历史工资
    function getSalaryOfHistory(startTime, endTime, callback) {
        var salaryList = [];
        var selectEmpSalary = "select id,employee_id,baseSalary,bonusMoney,totalMoney,create_date,appendMoney from tb_empSalary where create_date between ? and ?;";
        dbInstance.execQuery(selectEmpSalary, [startTime, endTime], function (result) {
            for (var i = 0; i < result.rows.length; i++) {
                salaryList.push(_.clone(result.rows.item(i)));
            }
            callback(null, salaryList);
        }, function (error) {
            callback(error);
        });
    }

    //从员工提成计算工资
    function getSalaryOfEmpBonus(startTime, endTime, callback) {
        var salaryList = [];
        var selectBonus = "select a.employee_id,a.dateTime,sum(case a.type when 16 then 0 else a.bonusMoney end) as bonusMoney,sum(case a.type when 16 then a.bonusMoney else 0 end) as appendMoney,b.name,c.baseSalary"
            + " from tb_empBonus a,tb_employee b,tb_job c"
            + " where a.employee_id = b.id and b.baseInfo_jobId = c.id and a.dateTime between ? and ?"
            + " group by employee_id;";
        dbInstance.execQuery(selectBonus, [startTime, endTime], function (result) {
            //取月中旬、作为工资的插入时间
            var createDate = parseInt((startTime + endTime) / 2);
            var temp;
            for (var i = 0, len = result.rows.length; i < len; i++) {
                temp = result.rows.item(i);
                salaryList.push({
                    employee_id: temp.employee_id,
                    baseSalary: temp.baseSalary,
                    bonusMoney: temp.bonusMoney,
                    appendMoney: temp.appendMoney,
                    totalMoney: temp.baseSalary + temp.bonusMoney + temp.appendMoney,
                    dateTime: temp.dateTime,
                    create_date: createDate,
                    enterprise_id: YILOS.ENTERPRISEID
                });
            }
            callback(null, salaryList);
        }, function (error) {
            callback(error);
        });
    }

    //新增工资记录
    function newSalaryRecord(salaryList, callback) {
        fillSalaryId(function (error) {
            if (error) {
                callback(error);
                return;
            }
            var sqlArray = [];
            _.each(salaryList, function (item) {
                sqlArray.push(dataUtils.getInsertSqlOfObj("tb_empSalary", item));
            });
            dataUtils.batchExecuteSql(sqlArray, callback);
        });

        function fillSalaryId(callback) {
            async.each(salaryList, function (item, callback) {
                database.getUniqueId(YILOS.ENTERPRISEID, function (error, trans, id) {
                    if (error) {
                        callback(error);
                        return;
                    }
                    item.id = id;
                    callback(null);
                });
            }, function (error) {
                callback(error);
            });
        }
    }

    //手工调整更新工资记录
    function updateSalaryAppend(salaryId, appendMoney, modifyDate, callback) {
        var updateSql = {
            statement: "update tb_empSalary set totalMoney = totalMoney + ?, appendMoney = appendMoney + ?,modify_date = ? where id = ?;",
            value: [appendMoney, appendMoney, modifyDate, salaryId]
        };
        dataUtils.execOneSql(updateSql, callback);
    }

    //手工调整
    function manualAppend(append, callback) {
        database.getUniqueId(YILOS.ENTERPRISEID, function (error, trans, id) {
            if (error) {
                callback(error);
                return;
            }
            append.id = id;
            dataUtils.insertRecord("tb_empBonus", append, null, callback);
        });
    }

    //查询员工提成信息
    function queryEmpBonus(employeeId, startTime, endTime, callback) {
        var empBonusList = [];
        var selectBonus = "select type,member_name,cardNo,cardCate,billDetail,befDisMoney,discount,totalMoney,bonusMoney,create_date from tb_empBonus"
            + " where employee_id = ? and dateTime between ? and ? order by dateTime desc;";
        dbInstance.execQuery(selectBonus, [employeeId, startTime, endTime], function (result) {
            for (var i = 0, len = result.rows.length; i < len; i++) {
                empBonusList.push(result.rows.item(i));
            }
            callback(null, empBonusList);
        }, function (error) {
            callback(error)
        });
    }

    //查询某员工某员的工资
    function queryEmpSalary(employeeId, startTime, endTime, callback) {
        querySalaryFromHistory(function (error, empSalary) {
            if (error) {
                callback(error);
                return;
            }
            if (_.isEmpty(empSalary)) {
                querySalaryFromBonus(function (error, empSalary) {
                    if (error) {
                        callback(error);
                        return;
                    }
                    callback(null, empSalary);
                });
            }
            else {
                callback(null, empSalary);
            }
        });


        //从历史工资记录中查询
        function querySalaryFromHistory(callback) {
            var empSalary = {};
            var selectSalary = "select id,baseSalary,bonusMoney,appendMoney,totalMoney"
                + " from tb_empSalary"
                + " where employee_id = ? and dateTime between ? and ?;";
            dbInstance.execQuery(selectSalary, [employeeId, startTime, endTime], function (result) {
                if (result.rows.length !== 0) {
                    var temp = result.rows.item(0);
                    empSalary.id = temp.id;
                    empSalary.baseSalary = temp.baseSalary;
                    empSalary.bonusMoney = temp.bonusMoney;
                    empSalary.appendMoney = temp.appendMoney;
                    empSalary.totalMoney = temp.totalMoney;
                }
                callback(null, empSalary);
            }, function (error) {
                callback(error);
            });
        }

        //从提成中统计
        function querySalaryFromBonus(callback) {
            var empSalary = {};
            var selectSalary = "select sum(case a.type when 16 then 0 else a.bonusMoney end) as bonusMoney,sum(case a.type when 16 then a.bonusMoney else 0 end) as appendMoney,c.baseSalary"
                + " from tb_empBonus a,tb_employee b,tb_job c"
                + " where a.employee_id = b.id and b.baseInfo_jobId = c.id  and employee_id = ? and a.dateTime between ? and ?;";
            dbInstance.execQuery(selectSalary, [employeeId, startTime, endTime], function (result) {
                if (result.rows.length !== 0) {
                    var temp = result.rows.item(0);
                    empSalary.baseSalary = temp.baseSalary;
                    empSalary.bonusMoney = temp.bonusMoney;
                    empSalary.appendMoney = temp.appendMoney;
                    empSalary.totalMoney = temp.baseSalary + temp.bonusMoney + temp.appendMoney;
                }
                else {
                    empSalary.baseSalary = 0;
                    empSalary.bonusMoney = 0;
                    empSalary.appendMoney = 0;
                    empSalary.totalMoney = 0;
                }
                callback(null, empSalary)
            }, function (error) {
                callback(error);
            });
        }
    }
});
