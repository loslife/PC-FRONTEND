/**
 * Created with JetBrains WebStorm.
 * User: huangzhi
 * Date: 13-8-19
 * Time: 上午11:03
 * To change this template use File | Settings | File Templates.
 */
/**
 * Created with JetBrains WebStorm.
 * User: huangzhi
 * Date: 13-8-7
 * Time: 下午8:28
 * To change this template use File | Settings | File Templates.
 */
module.exports = {
    clientSettingScript: clientSettingScript
}
/**
 * 企业开通注册
 * @param req
 * @param res
 * @param next
 */
function clientSettingScript(req, res, next){

    var script = "window.global = {_g_server:{}}; \n"+
        ";global[\"_g_server\"].staticurl=\"" +global["_g_topo"].clientAccess.staticurl + "\"\n"+
        ";global[\"_g_server\"].uploadurl=\"" +global["_g_topo"].clientAccess.uploadurl + "\"\n"+
        ";global[\"_g_server\"].authurl=\"" +global["_g_topo"].clientAccess.authurl + "\"\n"+
        ";global[\"_g_server\"].serviceurl=\"" +global["_g_topo"].clientAccess.serviceurl + "\"\n"+
        ";global[\"_g_env\"] =\"" +global["_g_topo"].env+ "\";\n";
    res.end(script);

}