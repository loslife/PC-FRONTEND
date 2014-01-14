define(function (require, exports, module) {
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

    require("./setting.css");
    if (cordova && cordova.platformId == "ios") {
        require.async("./setting_ios.css", function (b) {
        })
    }
    //基础服务
    var utils = require("mframework/static/package").utils; 			        //全局公共函数
    var dataUtils = require("mframework/static/package").dataUtils;
    var database = require("mframework/static/package").database;
    var RSA = require("mframework/static/package").RSA;
    var dbInstance = null;
    var CONSTANT = {
        tb_users: "tb_users",
        tb_enterprise: "tb_enterprise",
        tb_operateItem: "tb_operateItem",
        tb_standOperate: "tb_standOperateItem"
    };

    var moduleScope;

    function loadModelAsync(params, callback) {
        dbInstance = database.getDBInstance();
        var model = {
            pageTitle: "我的账户",
            payment: {
                history: []
            }
        };

        //用于挂临时变量
        model.temp = {};

        model.action = "index";
        model.selectedStyle = "account";
        model.user = {};

        var selUser = "select username,baseInfo_name,baseInfo_image,contact_email from " + CONSTANT.tb_users + ";";
        dbInstance.execQuery(selUser, [], function (result) {
            if (result.rows.length !== 0) {
                model.user = _.clone(result.rows.item(0));
            }
            for (var key in model.user) {
                if (model.user.hasOwnProperty(key)) {
                    if (!model.user[key]) {
                        model.user[key] = "";
                    }
                }
            }
            callback(model);
        }, function (error) {
            utils.log("m-setting account.js loadModelAsync", error);
            callback(model);
        });
    }

    function initContoller($scope, $parse, $q, $http) {
        moduleScope = $scope;
        $scope.getPicture = function (record, sourceType) {
            var oldPath;
            if (record.baseInfo_image) {
                oldPath = record.baseInfo_image.substring(7);//remove file://
            }
            utils.getPicture(sourceType, null, "nailshop", "userImage", function (error, path) {
                if (error) {
                    utils.log("m-setting account.js getPicture", error);
                    utils.showAreaFailMsg("#userInfo-content", "图片保存失败");
                    return;
                }
                var user = {};
                user.baseInfo_image = path;
                user.modify_date = new Date().getTime();
                var userUpdateSql = {
                    statement: "update " + CONSTANT.tb_users + " set baseInfo_image = ?,modify_date = ? where username = ?;",
                    value: [user.baseInfo_image, user.modify_date, $scope.user.username]
                };

                dataUtils.execOneSql(userUpdateSql, function (error, rowsAffected) {
                    if (error) {
                        utils.showAreaFailMsg("#userInfo-content", "图片保存失败");
                        utils.log("m-setting account.js getPicture", error);
                        return;
                    }
                    database.updateBackupFlag(user.modify_date, YILOS_NAIL_MODULE.USERS, null);
                    record.baseInfo_image = path;
                    utils.showAreaSuccessMsg("#userInfo-content", "图片保存成功");
                    if (oldPath) {
                        utils.deleteFileByPath(oldPath);
                    }
                    try {
                        $scope.$digest();
                    }
                    catch (error) {
                        console.log(error);
                    }
                });
            });
        };

        //编辑用户信息
        $scope.editUser = function (modifyField) {
            $scope.userTemp = _.clone($scope.user);
            $scope.action = "modifyAccount";
            $scope.temp.modifyField = modifyField;
            $(".error-hint").hide();
            var elementSelector = "#account-edit-" + modifyField;
            utils.showSoftKeyboard(elementSelector, 500);
        };

        //翻译字段
        $scope.transField = function (modifyField) {
            var result;
            switch (modifyField) {
                case "name":
                    result = "修改姓名";
                    break;
                case "email":
                    result = "修改邮箱";
                    break;
            }
            return result;
        };

        $scope.myAccount = function () {
            $scope.action = "index";
            $scope.selectedStyle = "account";
        };

        //服务账单
        $scope.serviceBill = function () {
            $scope.action = "serviceBill";
            $scope.selectedStyle = "serviceBill";
            var licenseInfo = {};
            if (window.LosNailActivity) {
                licenseInfo = window.LosNailActivity.getLicenseInfo();
                if (licenseInfo) {
                    licenseInfo = JSON.parse(licenseInfo);
                }
                var date = new Date();
                moduleScope.payment = _.extend(moduleScope.payment, licenseInfo);
                moduleScope.payment.useDay = parseInt((licenseInfo.expires_time - (new Date(date.getFullYear(), date.getMonth(), date.getDate())).getTime()) / (24 * 3600 * 1000));
            }
            $scope.payment.history = [];
            //获取历史支付信息
            queryEnterprisePaymentHistory(function (error) {
                if (error) {
                    utils.log("m-setting account.js queryEnterprisePaymentHistory", error);
                }
            });
        };

        function queryEnterprisePaymentHistory(callback) {
            dbInstance.transaction(function (trans) {
                var sqlStr = "select pay_id,pay_date,month,expires_time,version_type,money from tb_payment;";
                trans.executeSql(sqlStr, [], function (trans, result) {
                    for (var i = 0; i < result.rows.length; i++) {
                        $scope.payment.history.push(result.rows.item(i));
                    }
                    callback(null);
                }, function (trans, error) {
                    callback(error);
                });
            });
        }

        //支付方式
        $scope.payStyle = function () {
            $scope.action = "payStyle";
            $scope.selectedStyle = "payStyle";
        };

        //修改密码
        $scope.modifyPassword = function () {
            $scope.password = {
                username: $scope.user.username,
                oldWord: "",
                newWord: "",
                reNewWord: ""
            };
            $scope.pageTitle = "修改登陆密码";
            $scope.action = "modifyPassword";
            $scope.selectedStyle = "modifyPassword";
        };

        $scope.adminLoginOut = function () {
            $scope.action = "logOut";
            $scope.selectedStyle = "logOut";
        };

        //修改邮箱输入是否合法
        $scope.isModifyEmailLegal = function () {
            var emailLegal = true;
            var emailErr = $("#account-error-email").hide();
            var emailReg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
            if ($scope.userTemp.contact_email) {
                $scope.userTemp.contact_email = $scope.userTemp.contact_email.toString().replace(/(^\s*)|(\s*$)/g, "");
                if (!emailReg.test($scope.userTemp.contact_email)) {
                    emailLegal = false;
                    emailErr.show();
                }
            }
            return emailLegal;
        };

        //编辑确认
        $scope.modifyUserConfirm = function () {
            if (!$scope.isModifyEmailLegal()) {
                return;
            }
            var user = {};
            user.modify_date = new Date().getTime();
            var userUpdateSql = {};
            //根据username修改信息
            switch ($scope.temp.modifyField) {
                case "name":
                    user.baseInfo_name = $scope.userTemp.baseInfo_name;
                    userUpdateSql.statement = "update tb_users set baseInfo_name = ?,modify_date = ? where username = ?;";
                    userUpdateSql.value = [user.baseInfo_name, user.modify_date, $scope.userTemp.username];
                    break;
                case "email":
                    user.contact_email = $scope.userTemp.contact_email;
                    userUpdateSql.statement = "update tb_users set contact_email = ?,modify_date = ? where username = ?;";
                    userUpdateSql.value = [user.contact_email, user.modify_date, $scope.userTemp.username];
                    break;
            }

            dataUtils.execOneSql(userUpdateSql, function (error, rowsAffected) {
                if (error) {
                    utils.showAreaFailMsg("#m-setting-account-edit", "修改失败");
                    utils.log("m-setting account.js modifyUserConfirm", error);
                    return;
                }
                database.updateBackupFlag(user.modify_date, YILOS_NAIL_MODULE.USERS, null);
                $scope.user = _.clone($scope.userTemp);
                setTimeout(function () {
                    $scope.myAccount();
                    $scope.$digest();
                }, 2000);
                utils.showAreaSuccessMsg("#m-setting-account-edit", "修改成功");
            });
        };

        //可以失去焦点时向远端确认密码是否正确
        $scope.isOldPasswordCorrect = function () {
            return true;
        };

        $scope.checkOldPassword = function () {
            if (!$scope.password.oldWord || "" == $scope.password.oldWord) {
                return false;
            }
            return true;
        };

        //新密码长度检测
        $scope.isNewPasswordLegal = function () {
            var passwordLegal = true;
            if ($scope.password.newWord) {
                $scope.password.newWord = $scope.password.newWord.replace(/(^\s*)|(\s*$)/g, "");
                if ($scope.password.newWord.length < 6 || $scope.password.newWord.length > 16) {
                    passwordLegal = false;
                }
            }
            else {
                passwordLegal = false;
            }
            return passwordLegal;
        };

        //新密码输入是否一致
        $scope.isNewPasswordSame = function () {
            return $scope.password.newWord === $scope.password.reNewWord;
        };

        $scope.modifyPasswordConfirm = function () {
            // 检查网络是否可用
            if (window.LosNailActivity && 0 == window.LosNailActivity.getNetworkState()) {
                utils.showAreaFailMsg("#m-setting-modifyPassword", "无法连接到网络，请检查网络配置");
                return;
            }

            if (!$scope.checkOldPassword()) {
                utils.showAreaFailMsg("#m-setting-modifyPassword", "请输入原始密码");
                return;
            }

            if (!($scope.isNewPasswordLegal())) {
                utils.showAreaFailMsg("#m-setting-modifyPassword", "新密码长度为1-16");
                return;
            }

            if (!($scope.isNewPasswordSame())) {
                utils.showAreaFailMsg("#m-setting-modifyPassword", "两次密码不一致");
                return;
            }

            passwordModifyService(function (error) {
                if (error) {
                    utils.showAreaFailMsg("#m-setting-modifyPassword", "密码修改失败");
                } else {
                    $scope.password.oldWord = "";
                    $scope.password.newWord = "";
                    $scope.password.reNewWord = "";
                    $scope.$digest();
                    utils.showAreaSuccessMsg("#m-setting-modifyPassword", "密码修改成功");
                }
            });

            //调服务端的修改密码借口
            function passwordModifyService(callback) {
                RSA.setMaxDigits(129);
                var publicKey = "10001";
                var models = "8fd23f6451236716deaf97a86dc6e1a98d55b521eedc08c4e8161538eb447be885ea11209709a5adf88d860bf4e168da68879b3465f4acf8fa3765194ff686b1";
                var rasKeyPair = new RSA.RSAKeyPair(publicKey, "", models);
                var text = YILOS.USERNAME + "-" + $scope.password.oldWord + "-" + $scope.password.newWord;
                var encrypted = RSA.encryptedString(rasKeyPair, encodeURIComponent(text));
                $.ajax({
                    type: "post",
                    async: true,
                    url: global["_g_server"].serviceurl + "/nail/resetPwdByOldPwd",
                    data: {info: encrypted},
                    dataType: "json",
                    success: function (data) {
                        if (data.code
                            == 0) {
                            callback(null);
                        } else {
                            callback(data);
                        }
                    },
                    error: function (error) {
                        callback(error);
                    }
                });
            }
        };

        $scope.modalDialogClose = function () {
            $.fancybox.close();
        };

        $scope.accountLoginOut = function () {
            if (window.LosNailActivity) {
                window.LosNailActivity.logout();
            }
        }
    }

    function init() {

    }


    function afterPageLoaded() {
        var mainContainer = $("#main-container");
        var permanentMenuKeyHeight = 0;
        if ($(window).width() <= 800) {
            $(".m-setting-account-left").height(mainContainer.outerHeight() - 10 - permanentMenuKeyHeight);
        }
        else {
            $(".m-setting-account-left").height(mainContainer.outerHeight() - permanentMenuKeyHeight);
        }

        $(".pay-style-content").height($(window).height() - $(".m-setting-title").outerHeight() - $(".pay-style-title").outerHeight() - 60);

        $('.m-setting-account-fancybox-media').fancybox({
            openEffect: 'none',
            closeEffect: 'none',
            padding: 0,
            closeBtn: false,
            closeClick: false,
            margin: 0,
            autoSize: false,
            autoHeight: true,
            autoWidth: true,
            fitToView: true,
            helpers: {
                overlay: {
                    closeClick: false
                }
            }
        });

    }


    function switchMenu(params) {
    }

    function paramsChange(params) {

    }
});