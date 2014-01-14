/**
 * Created with JetBrains WebStorm.
 * User: huangzhi
 * Date: 13-8-7
 * Time: 下午4:45
 * To change this template use File | Settings | File Templates.
 */
global.cache = new Cache();
function Cache(){
    this.memMap = {

    };
    this.push = function(key,value){
        this.memMap[key] = value;
    }
    this.get = function(key){
        return this.memMap[key];
    }
}
