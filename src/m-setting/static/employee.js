define(function (require, exports, module) {
    exports.init = init;
    exports.switchMenu = switchMenu;
    exports.paramsChange = paramsChange;
    exports.afterPageLoaded = afterPageLoaded;
    exports.loadModelAsync = loadModelAsync;
    exports.initContoller = initContoller;
    require("./setting.css");
    exports.fullscreen = true;

    var widgets = require("m-widgets/static/package");
    var utils = require("mframework/static/package").utils;			        //全局公共函数
    var database = require("mframework/static/package").database;
    var featureDataI = require("./employee-dataI-server.js");
    var moduleScope;


    function loadModelAsync(params, callback) {
        var model = {
            employee: {},
            employeeList: [],
            action: "index",
            actionIndex: "index",
            selectedStyle: "index",
            job: {},
            jobList: [],
            temp: {
                selectMonth: new Date(),
                salaryTalMoney: 0,
                delImgs: [],
                selImgNotSave: []
            },
            empSalaryList: [],
            appendBonus: {
                reward: "",
                punish: "",
                comment: ""
            },
            licenseInfo: {}

        };
        initData(model, callback);
    }

    function initData(model, callback) {
        async.waterfall([transferModel, getMaxEmployeeCount, initJobList, initEmployeeList, initCateFlag], function (error) {
            if (error) {
                utils.log("", error);
                return;
            }
            callback(model);
        });

        //将Model往下传
        function transferModel(callback) {
            callback(null, model);
        }
    }

    //获取当前版本员工数目上限
    function getMaxEmployeeCount(model, callback) {
        utils.getUserData(function (error, data) {
            if (error) {
                utils.log("m-setting employee.js getMaxEmployeeCount.utils.getUserData", error);
                callback(error);
                return;
            }

            if (data.maxEmployeeCount) {
                model.licenseInfo.maxEmployeeCount = data.maxEmployeeCount;
            }
            else {
                model.licenseInfo.maxEmployeeCount = 8;//默认标准版的指标、针对前几个未做特性控制的版本
            }
            callback(null, model);
        });
    }

    function initJobList(model, callback) {
        featureDataI.initJobList(model, function (error, model) {
            if (error) {
                utils.log("m-setting employee.js initJobList.featureDataI.initJobList", error);
                callback(error);
                return;
            }
            callback(null, model);
        });
    }

    function initEmployeeList(model, callback) {
        featureDataI.initEmployeeList(model, function (error, model) {
            if (error) {
                utils.log("m-setting employee.js initEmployeeList.featureDataI.initEmployeeList", error);
                callback(error);
                return;
            }
            callback(null, model);
        });
    }

    function initCateFlag(model, callback) {
        featureDataI.initCateFlag(model, function (error, model) {
            if (error) {
                utils.log("m-setting employee.js initCateFlag.featureDataI.initCateFlag", error);
                callback(error);
                return;
            }
            callback(null, model);
        });
    }

    function initContoller($scope, $parse, $q, $http, $location) {
        moduleScope = $scope;

        function checkEmpInput() {
            $(".error-hint").hide();
            var nameCheck = $scope.checkName();
            var birCheck = $scope.checkBir();
            var phoneCheck = $scope.checkPhone();
            return (nameCheck && birCheck && phoneCheck);
        }

        //新增员工检查姓名
        $scope.checkName = function () {
            var nameErr = $(".error-hint-one").hide();
            var legal = utils.checkStrMinLen($scope.employee.name, 1);
            if (!legal) {
                nameErr.show();
            }
            return legal;
        };


        //检查手手机
        $scope.checkPhone = function () {
            var phoneErr = $(".error-hint-three").hide();
            var legal = true;
            if ($scope.employee.contact_phoneMobile) {
                legal = utils.isPhoneNumber($scope.employee.contact_phoneMobile);
                if (!legal) {
                    phoneErr.show();
                }
            }
            return legal;
        };

        //检查生日
        $scope.checkBir = function () {
            var flag = true;
            var birError = $("#emp-error-birthday").hide();
            if (!$scope.employee.baseInfo_birthday) {
                birError.show();
                flag = false;
            }
            return flag;
        };

        //员工模型初始化
        function emptyEmployee() {
            $scope.employee = {};
            $scope.employee.id = "";
            $scope.employee.name = "";
            $scope.employee.nickname = "";
            $scope.employee.baseInfo_sex = "0";
            $scope.employee.contact_phoneMobile = "";
            $scope.employee.baseInfo_image = "";
            if ($scope.jobList.length !== 0) {
                $scope.employee.job = $scope.jobList[0];
            }
        }

        function digestScope() {
            try {
                $scope.$digest();
            }
            catch (error) {
                console.log(error);
            }
        }

        //新增员工
        $scope.newEmployee = function () {
            if (!checkEmpInput()) {
                return;
            }

            var createDate = new Date().getTime();
            //根据$scope.employee模型重新构造一个employee、
            var employee = {
                name: $scope.employee.name,
                nickname: $scope.employee.nickname,
                contact_phoneMobile: $scope.employee.contact_phoneMobile,
                baseInfo_sex: $scope.employee.baseInfo_sex,
                baseInfo_jobId: $scope.employee.job.id,
                baseInfo_beginDate: createDate,
                baseInfo_image: $scope.employee.baseInfo_image,
                baseInfo_birthday: new Date($scope.employee.baseInfo_birthday).getTime(),
                create_date: createDate,
                enterprise_id: YILOS.ENTERPRISEID
            };

            featureDataI.newEmployee(employee, function (error, rowsAffect) {
                if (error) {
                    utils.showAreaFailMsg("#m-setting-employee-add", "新增失败");
                    utils.log("", error);
                    return;
                }
                database.updateBackupFlag(employee.create_date, YILOS_NAIL_MODULE.EMPLOYEE, null);
                //获取岗位名称、基本工资
                _.each($scope.jobList, function (item) {
                    if (item.id === employee.baseInfo_jobId) {
                        employee.jobName = item.name;
                        employee.baseSalary = item.baseSalary;
                        $scope.employeeList.push(employee);
                    }
                });
                //新增员工,当前数目+1,用于特性控制
                $scope.temp.currentEmployeeCount++;
                global.eventEmitter.emitEvent('m-setting.employee.change');
                //隐藏输入框再次失去焦点而显示的错误提示
                setTimeout(function () {
                    $(".error-hint").hide();
                }, 500);

                //删除多余的图片
                _.each($scope.temp.delImgs, function (item) {
                    if (item) {
                        utils.deleteFileByPath(item);
                    }
                });
                $scope.temp.delImgs = [];
                $scope.temp.selImgNotSave = [];
                emptyEmployee();
                //新增成功后2s后返回
                setTimeout(function () {
                    $scope.backIndex();
                    digestScope();
                }, 2000);
                utils.showAreaSuccessMsg("#m-setting-employee-add", "新增成功");
            });
        };

        $scope.getAgeByBir = function (birthday) {
            if (birthday) {
                var birthdayDate = new Date(birthday);
                var now = new Date();
                return (now.getFullYear() - birthdayDate.getFullYear() - ((now.getMonth() < birthdayDate.getMonth() || now.getMonth() == birthdayDate.getMonth() && now.getDate() < birthdayDate.getDate()) ? 1 : 0));
            }
            else {
                return 18;//永远十八岁
            }
        };

        //根据员工岗位分类、显示每个岗位的人数
        $scope.empSortByJobDisplay = function () {
            var displayTemp = {}, displayArray = [];
            _.each($scope.employeeList, function (item) {
                if (displayTemp[item.jobName]) {
                    displayTemp[item.jobName]++;
                }
                else {
                    displayTemp[item.jobName] = 1;
                }
            });

            for (var key in displayTemp) {
                if (displayTemp.hasOwnProperty(key)) {
                    displayArray.push(key + displayTemp[key] + "人");
                }
            }

            return displayArray.join("，");
        };

        //修改员工
        $scope.updateEmployee = function () {
            if (!checkEmpInput()) {
                return;
            }

            var updateDate = new Date().getTime();

            var employee = {
                id: $scope.employee.id,
                name: $scope.employee.name,
                nickname: $scope.employee.nickname,
                contact_phoneMobile: $scope.employee.contact_phoneMobile,
                baseInfo_sex: $scope.employee.baseInfo_sex,
                baseInfo_jobId: $scope.employee.job.id,
                baseInfo_image: $scope.employee.baseInfo_image,
                baseInfo_birthday: new Date($scope.employee.baseInfo_birthday).getTime(),
                modify_date: updateDate
            };

            featureDataI.updateEmployee(employee, function (error, rowsAffected) {
                if (error) {
                    utils.showAreaFailMsg("#m-setting-employee-editpopup", "修改失败");
                    utils.log("", error);
                    return;
                }
                // 更新备份表
                database.updateBackupFlag(employee.modify_date, YILOS_NAIL_MODULE.EMPLOYEE, null);
                _.each($scope.employeeList, function (item, index) {
                    if (item.id === employee.id) {
                        employee.jobName = $scope.employee.job.name;
                        employee.baseInfo_beginDate = $scope.employee.baseInfo_beginDate;
                        employee.baseSalary = $scope.employee.job.baseSalary;
                        $scope.employeeList.splice(index, 1, employee);
                    }
                });
                global.eventEmitter.emitEvent('m-setting.employee.change');
                //删除多余的图片
                _.each($scope.temp.delImgs, function (item) {
                    if (item) {
                        utils.deleteFileByPath(item);
                    }
                });
                $scope.temp.delImgs = [];
                $scope.temp.selImgNotSave = [];

                //修改成功后2s后返回
                setTimeout(function () {
                    $scope.backIndex();
                    digestScope();
                }, 2000);
                utils.showAreaSuccessMsg("#m-setting-employee-editpopup", "修改成功");
            });
        };

        $scope.delEmployee = function () {
            //连续点击时直接返回
            if (!$scope.employee.id) {
                utils.showAreaFailMsg("#m-setting-employee-delete", "删除失败");
                return;
            }
            featureDataI.deleteEmployee($scope.employee.id, function (error, rowsAffected) {
                if (error) {
                    utils.showAreaFailMsg("#m-setting-employee-delete", "删除失败");
                    utils.log("", error);
                    return;
                }

                // 更新备份表
                database.updateBackupFlag(new Date().getTime(), YILOS_NAIL_MODULE.EMPLOYEE, null);
                _.each($scope.employeeList, function (item, index) {
                    if (item.id === $scope.employee.id) {
                        $scope.employeeList.splice(index, 1);
                    }
                });
                if ($scope.employee.baseInfo_image) {
                    utils.deleteFileByPath($scope.employee.baseInfo_image.substring(7));//remove file://
                }
                $scope.employee = {};
                utils.showAreaSuccessMsg("#m-setting-employee-delete", "删除成功");
                //注销员工,当前数目-1
                if ($scope.temp.currentEmployeeCount) {
                    $scope.temp.currentEmployeeCount--;
                }
                global.eventEmitter.emitEvent('m-setting.employee.change');
                setTimeout(function () {
                    $scope.modalDialogClose();
                }, 2000);
            });
        };

        function emptyJob() {
            $scope.job = {
                name: "",
                bonus_newCard: "",
                bonus_recharge: "",
                bonus_cash: "",
                bonus_memberCard: "",
                baseSalary: "",
                bonus_recordCardConsume: "",
                bonus_newRecordCard: ""
            };
        }

        $scope.newJob = function () {
            if (!checkJobInput()) {
                return;
            }
            var createDate = new Date().getTime();
            var job = {
                name: $scope.job.name,
                bonus_newCard: $scope.job.bonus_newCard ? $scope.job.bonus_newCard : 0,
                bonus_recharge: $scope.job.bonus_recharge ? $scope.job.bonus_recharge : 0,
                bonus_cash: $scope.job.bonus_cash ? $scope.job.bonus_cash : 0,
                bonus_memberCard: $scope.job.bonus_memberCard ? $scope.job.bonus_memberCard : 0,
                baseSalary: $scope.job.baseSalary ? $scope.job.baseSalary : $scope.job.baseSalary,
                bonus_recordCardConsume: $scope.job.bonus_recordCardConsume ? $scope.job.bonus_recordCardConsume : 0,
                bonus_newRecordCard: $scope.job.bonus_newRecordCard ? $scope.job.bonus_newRecordCard : 0,
                create_date: createDate,
                enterprise_id: YILOS.ENTERPRISEID
            };

            featureDataI.newJob(job, function (error, rowsAffected) {
                if (error) {
                    utils.log("", error);
                    utils.showAreaFailMsg("#m-setting-employee-post-add", "新增失败");
                    return;
                }
                // 更新备份表
                database.updateBackupFlag(createDate, YILOS_NAIL_MODULE.EMPLOYEE, null);
                $scope.jobList.push(job);
                emptyJob();
                //新增成功后2s后返回
                setTimeout(function () {
                    $scope.backPostAdmin();
                    digestScope();
                }, 2000);
                utils.showAreaSuccessMsg("#m-setting-employee-post-add", "新增成功");
            });
        };

        //检查名字
        $scope.checkJobName = function () {
            var editNameErr = $("#edit-job-error-name").hide();
            var newNameErr = $("#new-job-error-name").hide();
            var legal = utils.checkStrMinLen($scope.job.name, 1);
            if (!legal) {
                editNameErr.show();
                newNameErr.show();
            }
            return legal;
        };

        $scope.checkJobBaseSalary = function () {
            var editBaseSalaryErr = $("#edit-job-error-baseSalary").hide();
            var newBaseSalaryErr = $("#new-job-error-baseSalary").hide();
            var legal = true;

            if ($scope.job.baseSalary || $scope.job.baseSalary === 0) {
                legal = utils.checkNum($scope.job.baseSalary, 0, 1000000);
            }

            if (!legal) {
                editBaseSalaryErr.show();
                newBaseSalaryErr.show();
            }
            return legal;
        };

        $scope.checkJobBonus_cash = function () {
            var editBonus_cashErr = $("#edit-job-error-bonus_cash").hide();
            var newBonus_cashErr = $("#new-job-error-bonus_cash").hide();
            var legal = true;

            if ($scope.job.bonus_cash || $scope.job.bonus_cash === 0) {
                legal = utils.checkNum($scope.job.bonus_cash, 0, 100);//0-100包括0和100
            }

            if (!legal) {
                editBonus_cashErr.show();
                newBonus_cashErr.show();
            }
            return legal;
        };

        $scope.checkJobBonus_memberCard = function () {
            var editBonus_memberCardErr = $("#edit-job-error-bonus_memberCard").hide();
            var newBonus_memberCardErr = $("#new-job-error-bonus_memberCard").hide();
            var legal = true;

            if ($scope.job.bonus_memberCard || $scope.job.bonus_memberCard) {
                legal = utils.checkNum($scope.job.bonus_memberCard, 0, 100);//0-100包括0和100
            }

            if (!legal) {
                editBonus_memberCardErr.show();
                newBonus_memberCardErr.show();
            }
            return legal;
        };

        $scope.checkJobBonus_newCard = function () {
            var editBonus_newCardErr = $("#edit-job-error-bonus_newCard").hide();
            var newBonus_newCardErr = $("#new-job-error-bonus_newCard").hide();
            var legal = true;

            if ($scope.job.bonus_newCard || $scope.job.bonus_newCard) {
                legal = utils.checkNum($scope.job.bonus_newCard, 0, 100);//0-100包括0和100
            }

            if (!legal) {
                editBonus_newCardErr.show();
                newBonus_newCardErr.show();
            }
            return legal;
        };

        $scope.checkJobBonus_recharge = function () {
            var editBonus_rechargeErr = $("#edit-job-error-bonus_recharge").hide();
            var newBonus_rechargeErr = $("#new-job-error-bonus_recharge").hide();
            var legal = true;

            if ($scope.job.bonus_recharge || $scope.job.bonus_recharge) {
                legal = utils.checkNum($scope.job.bonus_recharge, 0, 100);//0-100包括0和100
            }

            if (!legal) {
                editBonus_rechargeErr.show();
                newBonus_rechargeErr.show();
            }
            return legal;
        };

        $scope.checkJobRecordCardConsume = function () {
            var editRecordCardConsumeErr = $("#edit-job-error-bonus_recordCardConsume").hide();
            var newRecordCardConsumeErr = $("#new-job-error-bonus_recordCardConsume").hide();
            var legal = true;

            if ($scope.job.bonus_recordCardConsume || $scope.job.bonus_recordCardConsume) {
                legal = utils.checkNum($scope.job.bonus_recordCardConsume, 0, 100);//0-100包括0和100
            }

            if (!legal) {
                editRecordCardConsumeErr.show();
                newRecordCardConsumeErr.show();
            }
            return legal;
        };

        $scope.checkJobNewRecordCard = function () {
            var editNewRecordCardErr = $("#edit-job-error-bonus_newRecordCard").hide();
            var newNewRecordCardErr = $("#new-job-error-bonus_newRecordCard").hide();
            var legal = true;

            if ($scope.job.bonus_newRecordCard || $scope.job.bonus_newRecordCard) {
                legal = utils.checkNum($scope.job.bonus_newRecordCard, 0, 100);//0-100包括0和100
            }

            if (!legal) {
                editNewRecordCardErr.show();
                newNewRecordCardErr.show();
            }
            return legal;
        };


        function checkJobInput() {
            var nameCheck = $scope.checkJobName();
            var baseSalaryCheck = $scope.checkJobBaseSalary();
            var cashCheck = $scope.checkJobBonus_cash();
            var memberCardCheck = $scope.checkJobBonus_memberCard();
            var newCardCheck = $scope.checkJobBonus_newCard();
            var rechargeCheck = $scope.checkJobBonus_recharge();
            var recordNewCheck = $scope.checkJobNewRecordCard();
            var recordRechargeCheck = $scope.checkJobRecordCardConsume();
            var flag = nameCheck && baseSalaryCheck && cashCheck && memberCardCheck && newCardCheck && rechargeCheck && recordNewCheck && recordRechargeCheck;
            return flag;
        }

        $scope.updateJob = function () {
            if (!checkJobInput()) {
                return;
            }

            var updateDate = new Date().getTime();
            var job = {
                id: $scope.job.id,
                name: $scope.job.name,
                bonus_newCard: $scope.job.bonus_newCard ? $scope.job.bonus_newCard : 0,
                bonus_recharge: $scope.job.bonus_recharge ? $scope.job.bonus_recharge : 0,
                bonus_cash: $scope.job.bonus_cash ? $scope.job.bonus_cash : 0,
                bonus_memberCard: $scope.job.bonus_memberCard ? $scope.job.bonus_memberCard : 0,
                baseSalary: $scope.job.baseSalary ? $scope.job.baseSalary : $scope.job.baseSalary,
                bonus_recordCardConsume: $scope.job.bonus_recordCardConsume ? $scope.job.bonus_recordCardConsume : 0,
                bonus_newRecordCard: $scope.job.bonus_newRecordCard ? $scope.job.bonus_newRecordCard : 0,
                modify_date: updateDate
            };

            featureDataI.updateJob(job, function (error, rowsAffected) {
                if (error) {
                    utils.log("", error);
                    utils.showAreaFailMsg("#m-setting-update-job", "修改失败");
                    return;
                }
                // 更新备份表
                database.updateBackupFlag(updateDate, YILOS_NAIL_MODULE.EMPLOYEE, null);
                global.eventEmitter.emitEvent("m-setting.employee.change");//岗位发生变化、可能员工提成有变化
                _.each($scope.jobList, function (item, index) {
                    if (item.id === job.id) {
                        $scope.jobList.splice(index, 1, job);
                    }
                });
                _.each($scope.employeeList, function (item) {
                    if (item.baseInfo_jobId === job.id) {
                        item.baseSalary = job.baseSalary;
                        item.jobName = job.name;
                    }
                });
                //修改成功后2s后返回
                setTimeout(function () {
                    $scope.backPostAdmin();
                    digestScope();
                }, 2000);
                utils.showAreaSuccessMsg("#m-setting-update-job", "修改成功");
            });
        };

        $scope.delJob = function () {
            //连续点击时提示失败并返回
            if (!$scope.temp.deleteJob.id) {
                utils.showAreaFailMsg("#m-setting-post-delete", "删除失败");
                return;
            }

            featureDataI.countEmployeeOfJob($scope.temp.deleteJob.id, function (error, count) {
                if (error) {
                    utils.showAreaFailMsg("#m-setting-post-delete", "删除失败");
                    utils.log("", error);
                    return;
                }
                if (count !== 0) {
                    utils.showAreaFailMsg("#m-setting-post-delete", "该岗位尚有员工不能删除");
                    return;
                }
                featureDataI.deleteJob($scope.temp.deleteJob.id, function (error, rowsAffected) {
                    if (error) {
                        utils.showAreaFailMsg("#m-setting-post-delete", "删除失败");
                        utils.log("", error);
                        return;
                    }
                    database.updateBackupFlag(new Date().getTime(), YILOS_NAIL_MODULE.EMPLOYEE, null);
                    _.each($scope.jobList, function (item, index) {
                        if (item.id === $scope.temp.deleteJob.id) {
                            $scope.jobList.splice(index, 1);
                        }
                    });
                    $scope.temp.deleteJob = {};
                    setTimeout(function () {
                        $scope.modalDialogClose();
                    }, 2000);
                    utils.showAreaSuccessMsg("#m-setting-post-delete", "删除成功");
                });
            });
        };

        //检查员工数是否达到上限
        function checkEmployeeCount(callback) {
            if ($scope.temp.currentEmployeeCount) {
                if ($scope.temp.currentEmployeeCount < $scope.licenseInfo.maxEmployeeCount) {
                    callback(null, false);
                }
                else {
                    callback(null, true);
                }
            }
            else {
                featureDataI.countEmployeeAmount(function (error, count) {
                    if (error) {
                        callback(error);
                        return;
                    }
                    $scope.temp.currentEmployeeCount = count;
                    //是否达到上限
                    if ($scope.temp.currentEmployeeCount < $scope.licenseInfo.maxEmployeeCount) {
                        callback(null, false);
                    }
                    else {
                        callback(null, true);
                    }
                });
            }
        }

        //新增员工
        $scope.addEmployee = function () {
            //检查员工数量上限
            checkEmployeeCount(function (error, reachMaxCount) {
                if (error) {
                    utils.showGlobalMsg("系统错误、请稍后再试");
                    utils.log("m-setting employee.js addEmployee.checkEmployeeCount", error);
                    return;
                }
                if (reachMaxCount) {
                    utils.showGlobalMsg("员工数量已达到上限,请联系客服人员升级版本!");
                    return;
                }
                if ($scope.jobList.length === 0) {
                    utils.showGlobalMsg("请先切换至岗位页面添加岗位");
                    return;
                }
                emptyEmployee();
                $(".error-hint").hide();
                $scope.action = "addEmployee";
                $scope.actionIndex = "";
                $scope.temp.delImgs = [];
                $scope.temp.selImgNotSave = [];
                utils.showSoftKeyboard("#m-setting-employee-add input:first", 500);
            });
        };

        //员工薪酬月份切换
        $scope.nextMonth = function () {
            if ($scope.temp.selectMonth.getTime() < $scope.temp.effectEnd.getTime()) {
                $scope.temp.selectMonth = new Date($scope.temp.selectMonth.setMonth($scope.temp.selectMonth.getMonth() + 1));
                $(".time-day-select #salary-pre-month").removeClass("disable");
            }
            else {
                $(".time-day-select #salary-next-month").addClass("disable");
            }
        };
        $scope.preMonth = function () {
            if ($scope.temp.selectMonth.getTime() > $scope.temp.effectStart.getTime()) {
                $scope.temp.selectMonth = new Date($scope.temp.selectMonth.setMonth($scope.temp.selectMonth.getMonth() - 1));
                $(".time-day-select #salary-next-month").removeClass("disable");
            }
            else {
                $(".time-day-select #salary-pre-month").addClass("disable");
            }
        };

        //监听薪酬月份切换
        $scope.$watch("temp.selectMonth", function () {
            //获取所有员工的薪酬
            getSalTalMoney(function (error, result) {
                if (error) {
                    utils.log("m-setting employee.js $watch.getSalTalMoney", error);
                    utils.showGlobalMsg("薪酬查询出错");
                    return;
                }
                $scope.empSalaryList = result;
                //初始化没有提成记录的员工工资
                if ($scope.employeeList.length !== result.length) {
                    var i, temp = [];
                    for (i = 0; i < result.length; i++) {
                        temp.push(result[i].employee_id);
                    }
                    for (i = 0; i < $scope.employeeList.length; i++) {
                        //转换至选择月的月末时间
                        var nowMonth = new Date($scope.temp.selectMonth.getFullYear(), $scope.temp.selectMonth.getMonth() + 1, 1);
                        if (temp.indexOf($scope.employeeList[i].id) === -1 && $scope.employeeList[i].baseInfo_beginDate < nowMonth.getTime()) {
                            $scope.empSalaryList.push({
                                employee_id: $scope.employeeList[i].id,
                                totalMoney: $scope.employeeList[i].baseSalary
                            });
                            $scope.temp.salaryTalMoney += $scope.employeeList[i].baseSalary;
                        }
                    }
                }
                //保持薪酬页面员工顺序和资料页面一致
                var empSalSwapTemp;
                for (i = 0; i < $scope.employeeList.length; i++) {
                    for (var j = 0; j < $scope.empSalaryList.length; j++) {
                        if (i !== j && $scope.employeeList[i].id === $scope.empSalaryList[j].employee_id) {
                            empSalSwapTemp = $scope.empSalaryList[i];
                            $scope.empSalaryList[i] = $scope.empSalaryList[j];
                            $scope.empSalaryList[j] = empSalSwapTemp;
                        }
                    }
                }
                digestScope();
            });
        });

        //根据员工id获取员工
        $scope.getEmployeeById = function (employeeId) {
            var result;
            result = _.find($scope.employeeList, function (item) {
                return item.id === employeeId;
            });
            return result;
        };

        //获取所有员工一个月的工资
        function getSalTalMoney(callback) {
            var empSalaryList = [];
            $scope.temp.monthStart = new Date($scope.temp.selectMonth.getFullYear() + "/" + ($scope.temp.selectMonth.getMonth() + 1) + "/1");
            var startTemp = new Date($scope.temp.monthStart.getTime());
            $scope.temp.monthEnd = new Date(startTemp.setMonth(startTemp.getMonth() + 1));
            $scope.temp.salaryTalMoney = 0;

            featureDataI.getSalaryOfHistory($scope.temp.monthStart.getTime(), $scope.temp.monthEnd.getTime(), function (error, salaryList) {
                if (error) {
                    callback(error);
                    return;
                }
                if (salaryList.length !== 0) {
                    empSalaryList = salaryList;
                    _.each(empSalaryList, function (item) {
                        $scope.temp.salaryTalMoney += item.totalMoney;
                    });
                    callback(null, empSalaryList);
                }
                else {
                    featureDataI.getSalaryOfEmpBonus($scope.temp.monthStart.getTime(), $scope.temp.monthEnd.getTime(), function (error, salaryList) {
                        if (error) {
                            callback(error);
                            return;
                        }
                        empSalaryList = salaryList;
                        _.each(empSalaryList, function (item) {
                            $scope.temp.salaryTalMoney += item.totalMoney;
                        });

                        //查询月的中间值
                        var monthMid = new Date(($scope.temp.monthStart.getTime() + $scope.temp.monthEnd.getTime()) / 2), now = new Date();
                        var isPreMonth = (now.getFullYear() > monthMid.getFullYear()) || (now.getMonth() > monthMid.getMonth());
                        //查询的是历史月数据、且工资记录中没有该月记录则生成工资记录
                        if (salaryList.length !== 0 && isPreMonth) {
                            featureDataI.newSalaryRecord(empSalaryList, function (error, rowsAffected) {
                                if (error) {
                                    callback(error);
                                    return;
                                }
                                callback(null, empSalaryList);
                            });
                        }
                        else {
                            callback(null, empSalaryList);
                        }
                    });
                }
            });
        }

        //检查手工调整输入合法性
        function checkAppendInput() {
            var flag = true;
            var rewardErr = $("#employee-error-reward").hide();
            var punishErr = $("#employee-error-punish").hide();
            //奖励或者惩罚都未填写时显示错误信息
            if (!($scope.appendBonus.reward || $scope.appendBonus.punish)) {
                flag = false;
                rewardErr.show();
                punishErr.show();
            }
            else {
                //填写有误
                if ($scope.appendBonus.reward && ($scope.appendBonus.reward <= 0 || $scope.appendBonus.reward > 1000000)) {
                    flag = false;
                    rewardErr.show();
                }
                if ($scope.appendBonus.punish && ($scope.appendBonus.punish <= 0 || $scope.appendBonus.punish > 1000000)) {
                    flag = false;
                    punishErr.show();
                }
            }
            return flag;
        }


        //新增一条手工调整记录、提成记录type为16
        $scope.newAppend = function () {
            if (!checkAppendInput()) {
                return;
            }
            if (!_.isEmpty($scope.temp.empSalarySelected)) {
                async.waterfall([addReward, addPunish], function (error) {
                    if (error) {
                        utils.showAreaFailMsg("#m-setting-salary-manual-modify", "手工调整失败");
                        utils.log("m-setting employee.js newAppend", error);
                        return;
                    }
                    $scope.appendBonus.reward = "";
                    $scope.appendBonus.punish = "";
                    $scope.appendBonus.comment = "";
                    setTimeout(function () {
                        $scope.modalDialogClose();
                        digestScope();
                    }, 2000);
                    utils.showAreaSuccessMsg("#m-setting-salary-manual-modify", "手工调整成功");
                });
            }

            function addReward(callback) {
                if ($scope.appendBonus.reward) {
                    var reward = $scope.appendBonus.reward;
                    var createDate = new Date().getTime();
                    var rewardBonus = {
                        employee_id: $scope.temp.empSalarySelected.employee_id,
                        bonusMoney: reward,
                        billDetail: $scope.appendBonus.comment,
                        dateTime: $scope.temp.empSelectMonth.getTime(),
                        type: 16,
                        enterprise_id: YILOS.ENTERPRISEID,
                        create_date: createDate
                    };
                    featureDataI.manualAppend(rewardBonus, function (error, rowsAffected) {
                        if (error) {
                            callback(error);
                            return;
                        }
                        if ($scope.temp.empSalarySelected.id) {
                            featureDataI.updateSalaryAppend($scope.temp.empSalarySelected.id, reward, createDate, function (error, rowsAffected) {
                                if (error) {
                                    callback(error);
                                    return;
                                }
                                addRewardSuccess();
                                callback(null);
                            });
                        }
                        else {
                            addRewardSuccess();
                            callback(null);
                        }

                        function addRewardSuccess() {
                            database.updateBackupFlag(createDate, YILOS_NAIL_MODULE.EMPLOYEE, null);
                            $scope.temp.empSalarySelected.appendMoney += $scope.appendBonus.reward;
                            $scope.temp.empSalarySelected.totalMoney += $scope.appendBonus.reward;
                            $scope.selEmpAppendLsit.splice(0, 0, rewardBonus);
                        }
                    });
                }
                else {
                    callback(null);
                }
            }

            function addPunish(callback) {
                if ($scope.appendBonus.punish) {
                    var punish = -Math.abs($scope.appendBonus.punish);
                    var createDate = new Date().getTime();
                    var rewardBonus = {
                        employee_id: $scope.temp.empSalarySelected.employee_id,
                        bonusMoney: punish,
                        billDetail: $scope.appendBonus.comment,
                        dateTime: $scope.temp.empSelectMonth.getTime(),
                        type: 16,
                        enterprise_id: YILOS.ENTERPRISEID,
                        create_date: createDate
                    };

                    featureDataI.manualAppend(rewardBonus, function (error, rowsAffected) {
                        if (error) {
                            callback(error);
                            return;
                        }
                        if ($scope.temp.empSalarySelected.id) {
                            featureDataI.updateSalaryAppend($scope.temp.empSalarySelected.id, punish, createDate, function (error, rowsAffected) {
                                if (error) {
                                    callback(error);
                                    return;
                                }
                                addPunishSuccess();
                                callback(null);
                            });
                        }
                        else {
                            addPunishSuccess();
                            callback(null);
                        }

                        function addPunishSuccess() {
                            database.updateBackupFlag(createDate, YILOS_NAIL_MODULE.EMPLOYEE, null);
                            $scope.temp.empSalarySelected.appendMoney += punish;
                            $scope.temp.empSalarySelected.totalMoney += punish;
                            $scope.selEmpAppendLsit.splice(0, 0, rewardBonus);
                        }
                    });
                }
                else {
                    callback(null);
                }
            }
        };

        //岗位管理
        $scope.post_new = function () {
            $(".m-setting-employee-head-right-tab-select").removeClass("head-tag-selected");
            $("#m-setting-employee-head-right-tab-select-post-detail").addClass("head-tag-selected");
            $scope.action = "postAdmin";
            $scope.selectedStyle = "post";
        };


        $scope.editEmployee = function (employee) {
            //是否处于删除选择
            if ($scope.temp.delAction) {
                $scope.showDiaDelEmployee(employee);
            }
            else {
                $scope.action = "employeeEdit";
                $scope.temp.delImgs = [];//初始化需要删除的图像数组
                $scope.temp.selImgNotSave = [];
                $scope.actionIndex = "";
                $(".error-hint").hide();
                $scope.employee = _.clone(employee);
                if ($scope.employee.baseInfo_birthday) {
                    var birthdayTemp = new Date($scope.employee.baseInfo_birthday);
                    $scope.employee.baseInfo_birthday = birthdayTemp.getFullYear() + "-" + (birthdayTemp.getMonth() + 1) + "-" + birthdayTemp.getDate()
                }

                $scope.employee.contact_phoneMobile = parseInt($scope.employee.contact_phoneMobile);
                $scope.employee.job = _.find($scope.jobList, function (item) {
                    return item.id === $scope.employee.baseInfo_jobId;
                });
                utils.showSoftKeyboard("#m-setting-employee-editpopup input:first", 500);
            }
        };

        $scope.modalDialogClose = function () {
            $.fancybox.close();
        };

        //员工薪酬列表
        $scope.showSalaryList = function () {
            $(".m-setting-employee-head-right-tab-select").removeClass("head-tag-selected");
            $("#m-setting-employee-head-right-tab-select-salary").addClass("head-tag-selected");
            $scope.action = "salaryDetail";
            $scope.selectedStyle = "salaryDetail";
            //数据查询有效时间范围
            var now = new Date();
            var nowTemp = new Date(now.getFullYear() + "/" + (now.getMonth() + 1) + "/1");
            $scope.temp.effectEnd = new Date(nowTemp.setMonth(now.getMonth()));
            $scope.temp.effectStart = new Date(nowTemp.setMonth(now.getMonth() - 5));
            //点击薪酬触发查询
            getSalTalMoney(function (error, result) {
                if (error) {
                    utils.showGlobalMsg("薪酬查询出错");
                    utils.log("m-setting employee.js showSalaryList.getSalTalMoney", error);
                    return;
                }
                $scope.empSalaryList = result;
                //初始化没有提成记录的员工工资
                if ($scope.employeeList.length !== result.length) {
                    var i, temp = [];
                    for (i = 0; i < result.length; i++) {
                        temp.push(result[i].employee_id);
                    }
                    for (i = 0; i < $scope.employeeList.length; i++) {
                        var nowMonth = new Date($scope.temp.selectMonth.getFullYear(), $scope.temp.selectMonth.getMonth() + 1, 1);
                        if (temp.indexOf($scope.employeeList[i].id) === -1 && $scope.employeeList[i].baseInfo_beginDate < nowMonth.getTime()) {
                            $scope.empSalaryList.push({
                                employee_id: $scope.employeeList[i].id,
                                totalMoney: $scope.employeeList[i].baseSalary
                            });
                            $scope.temp.salaryTalMoney += $scope.employeeList[i].baseSalary;
                        }
                    }
                }
                //保持薪酬页面员工顺序和资料页面一致
                var empSalSwapTemp;
                for (i = 0; i < $scope.employeeList.length; i++) {
                    for (var j = 0; j < $scope.empSalaryList.length; j++) {
                        if (i !== j && $scope.employeeList[i].id === $scope.empSalaryList[j].employee_id) {
                            empSalSwapTemp = $scope.empSalaryList[i];
                            $scope.empSalaryList[i] = $scope.empSalaryList[j];
                            $scope.empSalaryList[j] = empSalSwapTemp;
                        }
                    }
                }
            });
        };

        $scope.showEmployeeDetail = function () {
            $(".m-setting-employee-head-right-tab-select").removeClass("head-tag-selected");
            $("#m-setting-employee-head-right-tab-select-detail").addClass("head-tag-selected");
            $scope.action = "index";
            $scope.selectedStyle = "index";
        };

        //返回薪酬列表
        $scope.backSalaryList = function () {
            $scope.action = "salaryDetail";
            $scope.actionIndex = "index";
        };

        //员工管理页面
        $scope.backIndex = function () {
            $scope.action = "index";
            $scope.actionIndex = "index";
            //删除选择却未保存的图片
            _.each($scope.temp.selImgNotSave, function (item) {
                if (item) {
                    utils.deleteFileByPath(item);
                }
            });
            $scope.temp.selImgNotSave = [];
        };

        //返回设置
        $scope.back_setting = function () {
            $location.path("#/m-setting/setting");
        };

        //员工工资详情月份切换
        $scope.$watch("temp.empSelectMonth", function () {
            searchEmpDetail();
        });

        //查询被选中员工的提成明细
        function searchEmpDetail() {
            if (!$scope.temp.empSelectMonth) {
                return;
            }
            $scope.temp.empMonthStart = new Date($scope.temp.empSelectMonth.getFullYear() + "/" + ($scope.temp.empSelectMonth.getMonth() + 1) + "/1");
            var startTemp = new Date($scope.temp.empMonthStart.getTime());
            $scope.temp.empMonthEnd = new Date(startTemp.setMonth(startTemp.getMonth() + 1));

            async.waterfall([selBonusDetail, selEmpSalary], function (error) {
                if (error) {
                    utils.log("m-setting employee.js", error);
                    utils.showGlobalMsg("员工工资获取出错、请稍后重试");
                    return;
                }
                try {
                    $scope.$digest();
                }
                catch (error) {
                    console.log(error);
                }
            });

            //获取提成详细记录
            function selBonusDetail(callback) {
                var selEmpBonusList = [];
                var selEmpAppendList = []; //手工调整

                var employeeId = $scope.temp.empSalarySelected.employee_id;
                var startTime = $scope.temp.empMonthStart.getTime();
                var endTime = $scope.temp.empMonthEnd.getTime();
                featureDataI.queryEmpBonus(employeeId, startTime, endTime, function (error, bonusList) {
                    if (error) {
                        callback(error);
                        return;
                    }
                    for (var i = 0; i < bonusList.length; i++) {
                        if (bonusList[i].type === 16) {
                            selEmpAppendList.push(bonusList[i]);
                        }
                        else {
                            selEmpBonusList.push(bonusList[i]);
                        }
                    }
                    $scope.selEmpBonusList = selEmpBonusList;
                    $scope.selEmpAppendLsit = selEmpAppendList;
                    callback(null);
                });
            }

            //从工资表中查询该月工资、若无记录则从提成记录中计算
            function selEmpSalary(callback) {
                var employeeId = $scope.temp.empSalarySelected.employee_id;
                var startTime = $scope.temp.empMonthStart.getTime();
                var endTime = $scope.temp.empMonthEnd.getTime();
                featureDataI.queryEmpSalary(employeeId, startTime, endTime, function (error, empSalary) {
                    if (error) {
                        callback(error);
                        return;
                    }

                    if (empSalary.id) {
                        $scope.temp.empSalarySelected.id = empSalary.id;
                    }
                    $scope.temp.empSalarySelected.baseSalary = empSalary.baseSalary;
                    $scope.temp.empSalarySelected.bonusMoney = empSalary.bonusMoney;
                    $scope.temp.empSalarySelected.appendMoney = empSalary.appendMoney;
                    $scope.temp.empSalarySelected.totalMoney = empSalary.totalMoney;

                    //员工提成记录为空则从员工信息中获取基本工资信息
                    if ($scope.temp.empSalarySelected.totalMoney === 0) {
                        var nowMonth = new Date($scope.temp.selectMonth.getFullYear(), $scope.temp.selectMonth.getMonth() + 1, 1);
                        _.each($scope.employeeList, function (item) {
                            if (item.id === $scope.temp.empSalarySelected.employee_id && item.baseInfo_beginDate < nowMonth.getTime()) {
                                $scope.temp.empSalarySelected.baseSalary = item.baseSalary;
                                $scope.temp.empSalarySelected.totalMoney = item.baseSalary;
                            }
                        });
                    }
                    callback(null);
                });
            }
        }

        //员工详细薪酬月份切换
        $scope.nextEmpMonth = function () {
            if ($scope.temp.empSelectMonth.getTime() < $scope.temp.effectEnd.getTime()) {
                $scope.temp.empSelectMonth = new Date($scope.temp.empSelectMonth.setMonth($scope.temp.empSelectMonth.getMonth() + 1));
                $(".time-day-select #salary-emp-pre-month").removeClass("disable");
            }
            else {
                $(".time-day-select #salary-emp-next-month").addClass("disable");
            }
        };
        $scope.preEmpMonth = function () {
            if ($scope.temp.empSelectMonth.getTime() > $scope.temp.effectStart) {
                $scope.temp.empSelectMonth = new Date($scope.temp.empSelectMonth.setMonth($scope.temp.empSelectMonth.getMonth() - 1));
                $(".time-day-select #salary-emp-next-month").removeClass("disable");
            }
            else {
                $(".time-day-select #salary-emp-pre-month").addClass("disable");
            }
        };

        //查看个人工资明细
        $scope.showSalaryDetail = function (item) {
            $scope.action = "salaryMoreDetail";
            $scope.actionIndex = "";
            $scope.temp.empSelectMonth = new Date($scope.temp.selectMonth.getTime());
            $scope.temp.empSalarySelected = item;
            $(".time-day-select #salary-emp-pre-month").removeClass("disable");
            $(".time-day-select #salary-emp-next-month").removeClass("disable");

            //设置表格高度
            setTimeout(function () {
                var upHeight = $("#salary-detail-table-head").outerHeight() + $("#salary-detail-tableInfo").outerHeight() + $("#salary-detail-operating").outerHeight() + $("#salary-detail-title").outerHeight();
                $("#salary-detail-table-content").height($(window).height() - upHeight - 12);
            }, 100);
        };

        //新增岗位
        $scope.addPost = function () {
            $scope.action = "postAdd";
            $scope.actionIndex = "";
            emptyJob();
            $(".error-hint").hide();
            utils.showSoftKeyboard("#m-setting-employee-post-add input:first", 500);
        };

        //返回岗位页面
        $scope.backPostAdmin = function () {
            $scope.action = "postAdmin";
            $scope.actionIndex = "index";
        };

        //手工调整弹框
        $scope.salaryManualModify = function () {
            $(".error-hint").hide();
            $.fancybox.open({href: "#m-setting-salary-manual-modify" },
                {
                    openEffect: 'none',
                    closeEffect: 'none',
                    closeBtn: false,
                    closeClick: false,
                    autoSize: false,
                    autoHeight: true,
                    autoWidth: true,
                    fitToView: true,
                    padding: 0,
                    margin: 0,
                    helpers: {
                        overlay: {
                            closeClick: false
                        }
                    }
                });
            utils.showSoftKeyboard("#m-setting-manual-reward", 500);
        };

        //岗位修改
        $scope.postEdit = function (item) {
            $scope.job = _.clone(item);
            $scope.action = "postEdit";
            $scope.actionIndex = "";
            $(".error-hint").hide();
            utils.showSoftKeyboard("#m-setting-update-job input:first", 500);
        };

        //岗位删除确认
        $scope.postDelete = function (item) {
            $.fancybox.open({href: "#m-setting-post-delete" },
                {
                    openEffect: 'none',
                    closeEffect: 'none',
                    closeBtn: false,
                    closeClick: false,
                    autoSize: false,
                    autoHeight: true,
                    autoWidth: true,
                    fitToView: true,
                    padding: 0,
                    margin: 0,
                    helpers: {
                        overlay: {
                            closeClick: false
                        }
                    }
                });
            $scope.temp.deleteJob = item;
        };

        //员工删除控件
        $scope.showDeleteControl = function () {
            //切换当前是否处于删除操作状态
            $scope.temp.delAction = !$scope.temp.delAction;
        };

        //删除员工确认
        $scope.showDiaDelEmployee = function (employee) {
            $.fancybox.open({href: "#m-setting-employee-delete"},
                {
                    openEffect: 'none',
                    closeEffect: 'none',
                    closeBtn: false,
                    closeClick: false,
                    autoSize: false,
                    autoHeight: true,
                    autoWidth: true,
                    fitToView: true,
                    padding: 0,
                    margin: 0,
                    helpers: {
                        overlay: {
                            closeClick: false
                        }
                    }
                });
            $scope.employee = _.clone(employee);
        };

        $scope.showBirSeleted = function ($event) {
            var config = {};
            config.title = "选择日期";

            if ($scope.employee.baseInfo_birthday) {
                var birthday = new Date($scope.employee.baseInfo_birthday);
                config.year = birthday.getFullYear();
                config.month = birthday.getMonth() + 1;
                config.day = birthday.getDate();
            }
            else {
                config.year = 1980;
                config.month = 1;
                config.day = 1;
            }
            showDatePickerDia(config, $event.target, function (error, date) {
                if (error) {
                    utils.log("m-setting employee.js", error);
                    $scope.employee.baseInfo_birthday = "";
                    return;
                }
                $scope.employee.baseInfo_birthday = date;
                try {
                    $scope.$digest();
                }
                catch (error) {
                    console.log(error);
                }
            });
        };

        function showDatePickerDia(config, el, callback) {
            if (cordova.platformId == "ios") {
                var options = {
                    date: new Date(),
                    x: $(el).offset().left + 300,
                    y: $(el).offset().top,
                    mode: 'date'
                };
                // calling show() function with options and a result handler
                datePicker.show(options, function (date) {
                    var month = date.getMonth() + 1;
                    callback(null, date.getFullYear() + "-" + month + "-" + date.getDate());
                });
            }
            else {
                if (window.plugins && window.plugins.DatePicker) {
                    window.plugins.DatePicker.showDateDia(config, function (result) {
                        callback(null, result.date);
                    }, function (error) {
                        callback(error)
                    });
                }
            }
        }

        $scope.getPicture = function (record, sourceType) {
            utils.getPicture(sourceType, null, "nailshop", "userImage", function (error, path) {
                if (error) {
                    utils.log("m-setting employee.js", error);
                    return;
                }
                $scope.temp.selImgNotSave.push(path.substring(7));
                if (record.baseInfo_image) {
                    $scope.temp.delImgs.push(record.baseInfo_image.substring(7));//remove file://
                }
                record.baseInfo_image = path;
                try {
                    $scope.$digest();
                }
                catch (error) {
                    console.log(error);
                }
            });
        };

        $scope.selectEmployeeSex = function (sex) {
            $scope.employee.baseInfo_sex = sex;
        };

        $scope.selectEmployeeJob = function (job) {
            $scope.employee.job = job;
        };
    }

    function init() {
    }


    function afterPageLoaded() {
        var winHeight = $(window).height();
        //设置新增员工页面高度
        $("#m-setting-employee-editpopup").height(winHeight);
        $("#m-setting-employee-add").height(winHeight);//设置修改员工页面高度
        $(".add-employee-form").css("max-height", ($(window).height() - $(".m-setting-title").outerHeight() - 60));

        //设置薪酬明细列表高度
        $("#salary-detail-table-content").height($("#main-container").outerHeight() - $("#salary-detail-table-head").outerHeight() - $("#salary-detail-operating").outerHeight() - $("#salary-detail-title").outerHeight());

//        $("#m-setting-employee-post-admin .right").height($("#main-container").outerHeight());
        $("#m-setting-employee-post-admin .right").height($("#main-container").outerHeight() - $(".m-setting-title").outerHeight());

        var permanentMenuKeyHeight = 0;
        if ($(window).width() <= 800) {
            $("#m-setting-employee-list").height($("#main-container").outerHeight() - $("#m-setting-employee-area .m-setting-title").outerHeight() - 48 - permanentMenuKeyHeight);
        } else {
            $("#m-setting-employee-list").height($("#main-container").outerHeight() - ($("#m-setting-employee-area .m-setting-title").outerHeight() + 48 + permanentMenuKeyHeight));
        }
        $('.m-setting-employee-fancybox-media').fancybox({
            openEffect: 'none',
            closeEffect: 'none',
            autoSize: false,
            autoHeight: true,
            padding: 0,
            margin: 0,
            autoWidth: true,
            closeBtn: false,
            fitToView: true,
            helpers: {
                overlay: {
                    closeClick: false
                }
            }
        });
    }

    function switchMenu(params) {
        if (moduleScope.action === "salaryDetail") {
            moduleScope.showSalaryList();
        }
    }

    function paramsChange(params) {

    }
});
