define(function (require, exports, module) {
    var database = require("mframework/static/package").database;
    var dbInstance = database.getDBInstance();
    var updateEnterprise = "update tb_enterprise set"
        + " name = '测试店',"
        + " contact_phoneMobile = '13354698588',"
        + " comment = '用于测试的店铺,乐斯第一家.',"
        + " hours_begin = '08:00',"
        + " hours_end = '22:00',"
        + " addr_state = '广东省',"
        + " addr_city = '深圳市',"
        + " addr_area = '龙岗区',"
        + " addr_detail = '坂田阳光湾畔',"
        + " addr_state_city_area = '广东省深圳市龙岗区';";

    function init(callback) {
        dbInstance.transaction(function (trans) {
            trans.executeSql(updateEnterprise, [], function (trans, result) {
                callback(null);
            }, function (error, trans) {
                callback(error);
            })
        });
    }

    exports.init = init;
});