define(function (require, exports, module) {
    var database = require("mframework/static/package").database;
    var dbInstance = database.getDBInstance();
    var updateAccount = "update tb_users set baseInfo_name = '测试',contact_email = 'test@yilos.com';";//where...

    function init(callback) {
        dbInstance.transaction(function (trans) {
            trans.executeSql(updateAccount, [], function (trans, result) {
                callback(null);
            }, function (error, trans) {
                callback(error);
            })
        });
    }

    exports.init = init;
});