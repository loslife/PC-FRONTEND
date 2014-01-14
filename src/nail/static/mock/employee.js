//辅助生成随机员工数据数据
define(function (require, exports, module) {
    var mockTargets = require("./mockTargets").controlTargets;
    var database = require("mframework/static/package").database;
    var dbInstance = database.getDBInstance();
    var enterpriseId = YILOS.ENTERPRISEID;
    var createDate = mockTargets.startDate;
    var employeeInsert = "insert into tb_employee(name,nickname,contact_phoneMobile,baseInfo_image,baseInfo_sex,baseInfo_birthday,baseInfo_jobId,id,baseInfo_beginDate,create_date,enterprise_id)"
        + " values(?,?,?,?,?,?,?,?,'" + createDate + "','" + createDate + "','" + enterpriseId + "');";
    var jobList = [];

    var employeeData = [
        ["饶雪漫", "小雪", "13846858236", YILOS.DOCPATH + enterpriseId + "/images/userImage/employee001", 0, 492278400000],
        ["王思依", "小依", "13356918564", YILOS.DOCPATH + enterpriseId + "/images/userImage/employee002", 0, 586972800000],
        ["李小娟", "小娟", "13746855213", YILOS.DOCPATH + enterpriseId + "/images/userImage/employee003", 0, 650044800000],
        ["梅红", "小梅", "13744582168", YILOS.DOCPATH + enterpriseId + "/images/userImage/employee004", 0, 713203200000],
        ["尤兰", "小兰", "13622019874", YILOS.DOCPATH + enterpriseId + "/images/userImage/employee005", 0, 681580800000]
    ];

    //查询岗位
    function initJob(callback) {
        var jobSelect = "select id from tb_job;";
        dbInstance.execQuery(jobSelect, [], function (result) {
            for (var i = 0 , len = result.rows.length; i < len; i++) {
                jobList.push(result.rows.item(i));
            }
            callback(null);
        }, function (error) {
            callback(error);
        });
    }

    //生产id、与随机选择岗位
    function productJobId(callback) {
        async.each(employeeData, function (item, callback) {
            database.getUniqueId(enterpriseId, function (error, trans, id) {
                if (error) {
                    callback(error);
                    return;
                }
                item.push(jobList[parseInt(Math.random() * jobList.length)].id);
                item.push(id);
                callback(null);
            });
        }, function (error) {
            if (error) {
                callback(error);
                return;
            }
            callback(null);
        });
    }

    //存储员工
    function saveEmployee(callback) {
        dbInstance.transaction(function (trans) {
            async.each(employeeData, function (item, callback) {
                trans.executeSql(employeeInsert, item, function (trans, result) {
                    callback(null);
                }, function (trans, error) {
                    callback(error);
                });
            }, function (error) {
                if (error) {
                    callback(error);
                    return;
                }
                callback(null);
            });
        });
    }

    function init(callback) {
        async.waterfall([initJob, productJobId, saveEmployee], function (error) {
            if (error) {
                callback(error);
                return;
            }
            callback(null);
        });
    }

    exports.init = init;
});