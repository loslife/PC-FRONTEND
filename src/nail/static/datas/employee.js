define(function (require, exports, module) {
    var delete_sql = "DROP TABLE tb_employee";

    var tb_employee_sql = "CREATE TABLE IF NOT EXISTS tb_employee("
        + "id varchar(64) NOT NULL primary key,"
        + "name varchar(32),"
        + "nickname varchar(32),"
        + "baseInfo_sex integer,"
        + "baseInfo_code varchar(32),"
        + "baseInfo_jobId varchar(64),"
        + "baseInfo_image varchar(128),"
        + "baseInfo_birthday REAL,"
        + "baseInfo_beginDate REAL,"
        + "create_date REAL,"
        + "modify_date REAL,"
        + "baseInfo_terminateDate NUMERIC,"
        + "baseInfo_idcard varchar(32),"
        + "salary_regularPay NUMERIC,"
        + "salary_bankNo varchar(32),"
        + "salary_bankName varchar(32),"
        + "contact_phoneMobile varchar(16),"
        + "contact_weixin varchar(32),"
        + "contact_email varchar(64),"
        + "enterprise_id varchar(64),"
        + "comment text,"
        + "bonus_newCard REAL,"
        + "bonus_recharge REAL,"
        + "bonus_cash REAL,"
        + "bonus_memberCard REAL,"
        + "def_str1 varchar(32),"
        + "def_str2 varchar(64),"
        + "def_str3 varchar(128),"
        + "def_int1 integer,"
        + "def_int2 integer,"
        + "def_int3 integer,"
        + "def_text1 text);";

    var tbl_job_sql = "CREATE TABLE IF NOT EXISTS tb_job("
        + "id varchar(64),"
        + "name varchar(32),"
        + "enterprise_id varchar(64),"
        + "create_date REAL,"
        + "modify_date REAL,"
        + "describe text,"
        + "baseSalary REAL,"
        + "bonus_newCard REAL,"
        + "bonus_recharge REAL,"
        + "bonus_cash REAL,"
        + "bonus_memberCard REAL,"
        + "def_str1 varchar(32),"
        + "def_str2 varchar(64),"
        + "def_str3 varchar(128),"
        + "def_int1 integer,"
        + "def_int2 integer,"
        + "def_int3 integer,"
        + "def_text1 text);";

    var tbl_bonus_sql = "CREATE TABLE IF NOT EXISTS tb_empBonus("
        + "id varchar(64),"
        + "employee_id varchar(64),"
        + "project_id varchar(64),"
        + "serviceBill_id varchar(64),"
        + "type integer,"
        + "isAppoint integer,"
        + "totalMoney REAL,"
        + "bonusMoney REAL,"
        + "dateTime REAL,"
        + "enterprise_id varchar(64),"
        + "create_date REAL,"
        + "modify_date REAL,"
        + "member_name varchar(64),"
        + "cardNo varchar(64),"
        + "cardCate varchar(64),"
        + "billDetail text,"
        + "befDisMoney REAL,"
        + "discount REAL,"
        + "comment text"
        + "def_str1 varchar(32),"
        + "def_str2 varchar(64),"
        + "def_str3 varchar(128),"
        + "def_int1 integer,"
        + "def_int2 integer,"
        + "def_int3 integer,"
        + "def_text1 text);";

    var tbl_empSalary_sql = "CREATE TABLE IF NOT EXISTS tb_empSalary("
        + "id varchar(64),"
        + "employee_id varchar(64),"
        + "baseSalary REAL,"
        + "bonusMoney REAL,"
        + "totalMoney REAL,"
        + "appendMoney REAL,"
        + "dateTime REAL,"
        + "enterprise_id varchar(64),"
        + "create_date REAL,"
        + "modify_date REAL,"
        + "def_str1 varchar(32),"
        + "def_str2 varchar(64),"
        + "def_str3 varchar(128),"
        + "def_int1 integer,"
        + "def_int2 integer,"
        + "def_int3 integer,"
        + "def_text1 text);";

    var job = [
        "insert into tb_job(id,name,bonus_newCard,bonus_recharge,bonus_cash,bonus_memberCard,baseSalary) values('00000000000000003485100','学徒','15','5','10','15','0');",
        "insert into tb_job(id,name,bonus_newCard,bonus_recharge,bonus_cash,bonus_memberCard,baseSalary) values('00000000000000003486100','美甲师','10','5','10','15','1500');"
    ];

    var employee = [
        "insert into tb_employee(id,name,nickname,contact_phoneMobile,baseInfo_sex,baseInfo_jobId,baseInfo_beginDate) values('00000000000000003487100','胡雪曼','小曼','18770059986','0','00000000000000003486100','1382061623046');",
        "insert into tb_employee(id,name,nickname,contact_phoneMobile,baseInfo_sex,baseInfo_jobId,baseInfo_beginDate) values('00000000000000003487200','冯雪琪','雪琪','15266943358','0','00000000000000003486100','1382061709987');",
        "insert into tb_employee(id,name,nickname,contact_phoneMobile,baseInfo_sex,baseInfo_jobId,baseInfo_beginDate) values('00000000000000003489100','曾莉','莉莉','13744698856','0','00000000000000003485100','1382061928157');",
        "insert into tb_employee(id,name,nickname,contact_phoneMobile,baseInfo_sex,baseInfo_jobId,baseInfo_beginDate) values('00000000000000003490100','马玉杰','璐璐','15222384465','0','00000000000000003485100','1382062024126');"
    ];

    exports.initData = function (callback) {
        var dbInstance = require("mframework/package").database.getDBInstance();
        dbInstance.transaction(function (trans) {
            var sqlArray = [tb_employee_sql, tbl_job_sql, tbl_bonus_sql, tbl_empSalary_sql];
            async.eachSeries(sqlArray, function (sql, callback) {
                trans.executeSql(sql, [], function (trans, result) {
                    callback(null);
                    //查询员工表示否有数据、无数据则插入、
                    initJobEmpData();
                }, function (trans, error) {
                    console.error("初始化员工表失败");
                    console.error(error);
                    callback(null);
                });
            }, function (error) {
                if (error) {
                    callback(error);
                    return;
                }
                console.info("初始化员工表成功");
                callback(null);
            });

            function initJobEmpData() {
                var selEmployee = "select count(*) as count from tb_employee;";
                dbInstance.transaction(function (trans) {
                    trans.executeSql(selEmployee, [], function (trans, result) {
                        if (result.rows.item(0).count <= 0) {
                            async.each(employee, function (insertEmp, callback) {
                                trans.executeSql(insertEmp, [], function (trans, result) {
                                    callback(null);
                                }, function (trans, error) {
                                    callback(error);
                                });
                            }, function (error) {
                                console.log(error);
                            });
                        }
                    });

                    var selJob = "select count(*) as count from tb_job;";
                    trans.executeSql(selJob, [], function (trans, result) {
                        if (result.rows.item(0).count <= 0) {
                            async.each(job, function (insertJob, callback) {
                                trans.executeSql(insertJob, [], function (trans, result) {
                                    callback(null);
                                }, function (trans, error) {
                                    callback(error);
                                });
                            }, function (error) {
                                console.log(error);
                            });
                        }
                    });
                });
            }
        });
    }
});